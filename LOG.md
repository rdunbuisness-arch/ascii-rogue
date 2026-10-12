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

## Visual mockup page — 2026-10-11
- `docs/mockup/`: static scene.txt + colors.txt + index.html for fast look iteration (auto-reload, auto-scale). Game logic waits until look settles.
- Agent turns: ~3 tool turns (single executor session).

## v1.0 demo — 2026-10-11 (executor)
- Agent turns this build: ~30 tool turns (single executor session, no screenshots).
- Steps: pulled main; streamed/data-driven waves + SAM-1; UI progress/wave bar/error feedback; zoom + narrow-panel fix;
  Strategy Officer CONFIG patch; audio.js v2 integration; headless harness + playtest bot; tuning (supply_bar 6); tests; release push.

### Playtest (tests/playtest.js, 6 seeds)
| strategy | seed | result | length | Market HP | waves | first leak | <50% HP |
|---|---|---|---|---|---|---|---|
| economy | 1 | WIN | 12:16 | 150 | 10 | - | - |
| economy | 2 | WIN | 12:30 | 150 | 10 | - | - |
| economy | 3 | WIN | 12:15 | 150 | 10 | - | - |
| economy | 4 | WIN | 12:37 | 150 | 10 | - | - |
| economy | 5 | WIN | 12:20 | 150 | 10 | - | - |
| economy | 6 | WIN | 12:22 | 110 | 10 | 2 | - |
| disruptor | 1 | WIN | 12:16 | 100 | 10 | - | - |
| disruptor | 2 | WIN | 12:36 | 100 | 10 | - | - |
| disruptor | 3 | WIN | 12:19 | 100 | 10 | - | - |
| disruptor | 4 | loss | 8:32 | 0 | 7 | 6 | 7 |
| disruptor | 5 | WIN | 12:20 | 100 | 10 | - | - |
| disruptor | 6 | WIN | 12:15 | 100 | 10 | - | - |
| human | 1 | WIN | 13:46 | 100 | 10 | - | - |
| human | 2 | WIN | 13:52 | 100 | 10 | - | - |
| human | 3 | WIN | 13:45 | 80 | 10 | 9 | - |
| human | 4 | WIN | 13:51 | 100 | 10 | - | - |
| human | 5 | WIN | 13:50 | 100 | 10 | - | - |
| human | 6 | WIN | 13:49 | 100 | 10 | - | - |
| passive | 1 | loss | 2:35 | 0 | 2 | 1 | 1 |
| passive | 2 | loss | 2:36 | 0 | 2 | 1 | 1 |
| passive | 3 | loss | 2:33 | 0 | 2 | 1 | 1 |
| passive | 4 | loss | 2:35 | 0 | 2 | 1 | 1 |
| passive | 5 | loss | 2:36 | 0 | 2 | 1 | 1 |
| passive | 6 | loss | 2:36 | 0 | 2 | 1 | 1 |

summary: economy 6/6 wins avg 12:23; disruptor 5/6 wins avg 11:43; human 6/6 wins avg 13:49; passive 0/6 wins avg 2:35

