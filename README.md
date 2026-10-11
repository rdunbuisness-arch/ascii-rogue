# asciirogue

An ASCII real-time strategy game.

**Play in your browser:** https://rdunbuisness-arch.github.io/ascii-rogue/
The web build (`docs/index.html`) is the only maintained version. Tuning knobs live in its `CONFIG` object; override any of them via URL params, e.g. `?worker_cost=30&map_width=60&map_height=20`.

The old terminal version (`rts.py`, `game.py`, `sim.py`, `config.txt`) is retired and no longer updated.

## Controls
- `w` train worker (costs Power)
- `l` build a Library on the nearest Knowledge deposit (costs Power)
- `p` / `k` move a worker to Power / Knowledge
- `space` pause
- `q` quit (web: stops the game; `r` restarts)

Glyphs: the Keep (home base; its `|>` flag blinks while a worker trains), `P` Power node, `K` Knowledge deposit, `l`/`L` Library building/done, `w` idle worker, `W` carrying Power (yellow), `M` carrying Knowledge (cyan).
