"""Pure game logic for asciirogue (no curses). Shared by rts.py and sim.py."""
import math, os

DEFAULTS = dict(tick_rate=10, map_width=60, map_height=20, start_power=50,
                start_knowledge=0, start_workers=2, worker_cost=50,
                worker_train_time=8, worker_speed=4, carry_amount=5,
                gather_time=2, library_cost=150, library_build_time=15,
                power_nodes=3, knowledge_nodes=2, node_capacity=0, max_workers=12)

def load_config(path=None):
    cfg = dict(DEFAULTS)
    path = path or os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.txt")
    try:
        with open(path) as f:
            for line in f:
                line = line.split("#", 1)[0].strip()
                if "=" not in line:
                    continue
                k, v = (s.strip() for s in line.split("=", 1))
                if k in cfg:
                    try:
                        cfg[k] = type(DEFAULTS[k])(float(v)) if isinstance(DEFAULTS[k], int) else float(v)
                    except ValueError:
                        pass
    except OSError:
        pass
    cfg["map_width"] = max(20, cfg["map_width"]); cfg["map_height"] = max(8, cfg["map_height"])
    cfg["tick_rate"] = max(1, cfg["tick_rate"])
    return cfg

class Node:
    def __init__(s, kind, x, y, cap):
        s.kind, s.x, s.y = kind, x, y      # kind 'P' or 'K'
        s.left = cap if cap > 0 else None  # None = infinite
        s.library = None                   # None | 'building' | 'done'
        s.build_left = 0.0
    def usable(s):
        if s.left is not None and s.left <= 0: return False
        return s.kind == "P" or s.library == "done"

class Worker:
    def __init__(s, x, y, job="P"):
        s.x, s.y, s.job = float(x), float(y), job
        s.state, s.target, s.timer, s.carry = "idle", None, 0.0, 0
        s.trips = 0

class Game:
    def __init__(s, cfg=None):
        s.cfg = c = cfg or load_config()
        s.W, s.H = c["map_width"], c["map_height"]
        s.dt = 1.0 / c["tick_rate"]
        s.t = 0.0
        s.power, s.knowledge = float(c["start_power"]), float(c["start_knowledge"])
        s.base = (3, s.H // 2 - 1)  # top-left of 2x2 base
        s.dock = (s.base[0] + 2, s.base[1])  # where workers drop off
        s.nodes = []
        # fixed layout: nodes at increasing distance, alternating rows
        for kind, n, y0 in (("P", c["power_nodes"], 0), ("K", c["knowledge_nodes"], 1)):
            for i in range(n):
                x = min(s.W - 2, 12 + i * max(6, (s.W - 16) // max(1, n)) + y0 * 5)
                y = (2 + (i * 5 + y0 * 9) % (s.H - 4))
                s.nodes.append(Node(kind, x, y, c["node_capacity"]))
        s.workers = [Worker(*s.dock) for _ in range(c["start_workers"])]
        s.train_left = 0.0  # >0 while training
        s.msg = ""

    # --- commands ---
    def train_worker(s):
        c = s.cfg
        if s.train_left > 0: s.msg = "Already training"; return False
        if len(s.workers) >= c["max_workers"]: s.msg = "Max workers"; return False
        if s.power < c["worker_cost"]: s.msg = "Need %d Power" % c["worker_cost"]; return False
        s.power -= c["worker_cost"]; s.train_left = c["worker_train_time"]
        s.msg = "Training worker"; return True

    def build_library(s):
        c = s.cfg
        cands = [n for n in s.nodes if n.kind == "K" and n.library is None]
        if not cands: s.msg = "No unbuilt deposit"; return False
        if s.power < c["library_cost"]: s.msg = "Need %d Power" % c["library_cost"]; return False
        n = min(cands, key=lambda n: s._dist(s.dock, (n.x, n.y)))
        s.power -= c["library_cost"]; n.library = "building"; n.build_left = c["library_build_time"]
        s.msg = "Building Library"; return True

    def assign(s, job):
        ws = [w for w in s.workers if w.state == "idle" and w.job != job] or \
             [w for w in s.workers if w.job != job]
        if not ws: s.msg = "No worker to move"; return False
        w = ws[0]; w.job = job
        if w.carry == 0: w.state, w.target = "idle", None
        s.msg = "Worker -> %s" % ("Power" if job == "P" else "Knowledge"); return True

    # --- simulation ---
    @staticmethod
    def _dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])

    def _move(s, w, tx, ty):
        d = s._dist((w.x, w.y), (tx, ty)); step = s.cfg["worker_speed"] * s.dt
        if d <= step: w.x, w.y = float(tx), float(ty); return True
        w.x += (tx - w.x) / d * step; w.y += (ty - w.y) / d * step; return False

    def tick(s):
        c, dt = s.cfg, s.dt
        s.t += dt
        if s.train_left > 0:
            s.train_left -= dt
            if s.train_left <= 0:
                s.train_left = 0; s.workers.append(Worker(*s.dock)); s.msg = "Worker ready"
        for n in s.nodes:
            if n.library == "building":
                n.build_left -= dt
                if n.build_left <= 0: n.library = "done"; s.msg = "Library complete"
        for w in s.workers:
            if w.state == "idle":
                opts = [n for n in s.nodes if n.kind == w.job and n.usable()]
                if opts:
                    w.target = min(opts, key=lambda n: s._dist((w.x, w.y), (n.x, n.y)))
                    w.state = "to_node"
            elif w.state == "to_node":
                if not w.target.usable(): w.state = "idle"; continue
                if s._move(w, w.target.x, w.target.y): w.state, w.timer = "gather", c["gather_time"]
            elif w.state == "gather":
                if not w.target.usable(): w.state = "idle"; continue
                w.timer -= dt
                if w.timer <= 0:
                    amt = c["carry_amount"]
                    if w.target.left is not None:
                        amt = min(amt, w.target.left); w.target.left -= amt
                    w.carry, w.carry_kind, w.state = amt, w.target.kind, "to_base"
            elif w.state == "to_base":
                if s._move(w, *s.dock):
                    if w.carry_kind == "P": s.power += w.carry
                    else: s.knowledge += w.carry
                    w.carry, w.trips = 0, w.trips + 1
                    w.state = "idle"  # re-pick (job may have changed)

    def counts(s):
        return sum(w.job == "P" for w in s.workers), sum(w.job == "K" for w in s.workers)
