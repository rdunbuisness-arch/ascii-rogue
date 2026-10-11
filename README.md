# asciirogue

An ASCII real-time strategy game.

**Play in your browser:** https://rdunbuisness-arch.github.io/ascii-rogue/
(override tuning via URL params, e.g. `?worker_cost=30&tick_rate=20`)

**Terminal:** `python3 rts.py` (tuning in `config.txt`; headless build-order sim: `python3 sim.py`)

## Controls
- `w` train worker (costs Power)
- `l` build a Library on the nearest Knowledge deposit (costs Power)
- `p` / `k` move a worker to Power / Knowledge
- `space` pause
- `q` quit (web: stops the game; `r` restarts)

Glyphs: `H` base, `P` Power node, `K` Knowledge deposit, `l`/`L` Library building/done, `w` idle worker, `W` carrying Power (yellow), `M` carrying Knowledge (cyan).
