# Build log

## v0.1 — 2026-10-11
- First playable: curses RTS (`rts.py`), shared logic (`game.py`), headless sim (`sim.py`), `config.txt`.
- Smoke tests: sim runs; 400 headless ticks show workers making round trips with Knowledge at 0 before any Library; Knowledge rises after Library; curses UI run under a pty at 80x30 and 30x10 (too-small message) and TERM=dumb without crashing; keystrokes accepted, `q` exits.
- Agent turns: ~5 tool turns (single executor session).

## Web build — 2026-10-11
- `docs/index.html`: self-contained vanilla-JS port of game.py + rts.py rendering, CONFIG mirrors config.txt, URL param overrides, on-screen buttons for phone. Published via GitHub Pages: https://rdunbuisness-arch.github.io/ascii-rogue/
- Smoke tests: `node --check` on both scripts; node headless run matches Python (400 ticks: 5 round trips per worker, Power 100, Knowledge 0); Knowledge rises after Library; URL override works.
- Agent turns: ~6 tool turns (single executor session).

## The Keep + full-screen web — 2026-10-11
- Web: 2x2 `H` replaced by the 9x5 Keep sprite (footprint = bounding box, dock below doorway, flag red / blinks white while training); font scales to ~90% of window; default map 100x35. Terminal version retired (README/DESIGN updated).
- Smoke tests: `node --check` both scripts; node headless: workers make round trips (400 ticks, 3 trips each at 100x35, 4 at 60x20), Knowledge 0 before Library and rises after; no node inside the Keep; headless Chrome screenshots at 1920x1080 / 1440x900.
