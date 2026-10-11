#!/usr/bin/env python3
"""Headless build-order comparison using game.py logic."""
from game import Game, load_config

def run(name, policy, cfg):
    g = Game(cfg); ticks = int(cfg["tick_rate"]); out = []
    state = {}
    for minute in range(1, 6):
        for _ in range(60 * ticks):
            policy(g, state); g.tick()
        if minute in (1, 3, 5):
            out.append("%dm P=%5d K=%4d w=%2d" % (minute, g.power, g.knowledge, len(g.workers)))
    print("%-28s | %s" % (name, " | ".join(out)))

def all_power(g, s):
    g.train_worker() if g.train_left <= 0 else None

def library_first(g, s):
    if not s.get("lib"):
        if g.build_library(): s["lib"] = 1; g.assign("K")
        return
    if g.train_left <= 0: g.train_worker()
    pw, kw = g.counts()
    if kw < pw: g.assign("K")

def library_after(n):
    def pol(g, s):
        if not s.get("lib"):
            if len(g.workers) < n: g.train_left <= 0 and g.train_worker()
            elif g.build_library(): s["lib"] = 1
            return
        if g.train_left <= 0: g.train_worker()
        pw, kw = g.counts()
        if kw < pw // 2: g.assign("K")
    return pol

if __name__ == "__main__":
    cfg = load_config()
    print("Build order comparison (game time):")
    run("All Power (spam workers)", all_power, cfg)
    run("Library at once, 50/50", library_first, cfg)
    run("Library after 6 workers, 1/3K", library_after(6), cfg)
