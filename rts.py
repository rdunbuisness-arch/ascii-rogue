#!/usr/bin/env python3
"""asciirogue v0.1 - curses front end. Run: python3 rts.py"""
import curses, time
from game import Game

HELP = "w:train worker  l:build Library  p/k:move a worker to Power/Knowledge  space:pause  q:quit"

def draw(scr, g, paused):
    scr.erase()
    rows, cols = scr.getmaxyx()
    need_r, need_c = g.H + 5, max(g.W + 2, 40)
    if rows < need_r or cols < need_c:
        msg = "Terminal too small: need %dx%d, have %dx%d" % (need_c, need_r, cols, rows)
        try: scr.addstr(0, 0, msg[:cols - 1]); scr.addstr(1, 0, "q to quit"[:cols - 1])
        except curses.error: pass
        scr.refresh(); return
    col = curses.has_colors()
    cp = lambda n: curses.color_pair(n) if col else 0
    scr.addstr(0, 0, "+" + "-" * g.W + "+")
    for y in range(g.H): scr.addstr(y + 1, 0, "|" + " " * g.W + "|")
    scr.addstr(g.H + 1, 0, "+" + "-" * g.W + "+")
    put = lambda x, y, ch, a=0: scr.addstr(y + 1, x + 1, ch, a) if 0 <= x < g.W and 0 <= y < g.H else None
    bx, by = g.base
    for dx in (0, 1):
        for dy in (0, 1): put(bx + dx, by + dy, "H", cp(4) | curses.A_BOLD)
    for n in g.nodes:
        if n.left is not None and n.left <= 0: put(n.x, n.y, ".", 0); continue
        if n.kind == "P": put(n.x, n.y, "P", cp(1) | curses.A_BOLD)
        elif n.library == "done": put(n.x, n.y, "L", cp(2) | curses.A_BOLD)
        elif n.library == "building": put(n.x, n.y, "l", cp(2))
        else: put(n.x, n.y, "K", cp(2))
    for w in g.workers:
        x, y = int(round(w.x)), int(round(w.y))
        if w.carry: put(x, y, "W" if w.carry_kind == "P" else "M", cp(1 if w.carry_kind == "P" else 2) | curses.A_BOLD)
        else: put(x, y, "w", cp(3))
    pw, kw = g.counts()
    tr = " training %.0fs" % g.train_left if g.train_left > 0 else ""
    hud = "Power %d  Knowledge %d  Workers %d/%d (P:%d K:%d)%s  t=%ds%s" % (
        g.power, g.knowledge, len(g.workers), g.cfg["max_workers"], pw, kw, tr, g.t, "  [PAUSED]" if paused else "")
    scr.addstr(g.H + 2, 0, hud[:cols - 1])
    scr.addstr(g.H + 3, 0, HELP[:cols - 1])
    scr.addstr(g.H + 4, 0, ("w idle  W carrying Power  M carrying Knowledge  K deposit  l/L Library   " + g.msg)[:cols - 1])
    scr.refresh()

def main(scr):
    try: curses.curs_set(0)
    except curses.error: pass
    scr.nodelay(True)
    if curses.has_colors():
        curses.start_color()
        for i, c in enumerate((curses.COLOR_YELLOW, curses.COLOR_CYAN, curses.COLOR_WHITE, curses.COLOR_GREEN), 1):
            curses.init_pair(i, c, curses.COLOR_BLACK)
    g = Game(); paused = False; nxt = time.monotonic()
    while True:
        ch = scr.getch()
        while ch != -1:
            if ch in (ord("q"), ord("Q")): return
            if ch == ord(" "): paused = not paused
            elif ch == ord("w"): g.train_worker()
            elif ch == ord("l"): g.build_library()
            elif ch == ord("p"): g.assign("P")
            elif ch == ord("k"): g.assign("K")
            ch = scr.getch()
        now = time.monotonic()
        while now >= nxt:
            if not paused: g.tick()
            nxt += g.dt
        try: draw(scr, g, paused)
        except curses.error: pass
        time.sleep(max(0, min(0.02, nxt - time.monotonic())))

if __name__ == "__main__":
    curses.wrapper(main)
