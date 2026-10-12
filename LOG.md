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


## v1.1 tuning pass (2026-10-11)
- Agent turns: ~14 tool calls. About 30 knob sets swept in parallel headless runs (6-18 seeds each), then the defaults were set.
- Added a greedyLate bot and per-wave damage to tests/playtest.js. v05 test now reads human_unicorn_dmg from CFG.

| strategy | seed | result | length | Market HP | waves | first leak | damage by wave |
|---|---|---|---|---|---|---|---|
| economy | 1 | WIN | 14:00 | 150 | 10 | - | - |
| economy | 2 | WIN | 14:20 | 55 | 10 | 10 | w10:95 |
| economy | 3 | WIN | 14:06 | 150 | 10 | 1 | w1:20 |
| economy | 4 | loss | 14:22 | 0 | 10 | 7 | w7:80 w10:95 |
| economy | 5 | loss | 14:19 | 0 | 10 | 1 | w1:80 w2:60 w10:95 |
| economy | 6 | loss | 14:19 | 0 | 10 | 1 | w1:40 w2:40 w10:95 |
| economy | 7 | WIN | 14:18 | 55 | 10 | 10 | w10:95 |
| economy | 8 | WIN | 14:15 | 55 | 10 | 10 | w10:95 |
| economy | 9 | WIN | 14:17 | 150 | 10 | - | - |
| economy | 10 | WIN | 14:07 | 150 | 10 | - | - |
| economy | 11 | WIN | 14:17 | 55 | 10 | 10 | w10:95 |
| economy | 12 | WIN | 14:09 | 150 | 10 | - | - |
| economy | 13 | WIN | 14:25 | 55 | 10 | 10 | w10:95 |
| economy | 14 | WIN | 14:12 | 55 | 10 | 10 | w10:95 |
| economy | 15 | WIN | 14:15 | 55 | 10 | 10 | w10:95 |
| economy | 16 | WIN | 14:11 | 150 | 10 | 1 | w1:40 |
| economy | 17 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| economy | 18 | WIN | 14:19 | 55 | 10 | 10 | w10:95 |
| greedyLate | 1 | loss | 2:29 | 0 | 2 | 1 | w1:100 |
| greedyLate | 2 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| greedyLate | 3 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| greedyLate | 4 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| greedyLate | 5 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| greedyLate | 6 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| greedyLate | 7 | loss | 2:29 | 0 | 1 | 1 | w1:100 |
| greedyLate | 8 | loss | 2:29 | 0 | 2 | 1 | w1:100 |
| greedyLate | 9 | loss | 2:27 | 0 | 1 | 1 | w1:100 |
| greedyLate | 10 | loss | 2:29 | 0 | 1 | 1 | w1:100 |
| greedyLate | 11 | loss | 2:27 | 0 | 1 | 1 | w1:100 |
| greedyLate | 12 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| greedyLate | 13 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| greedyLate | 14 | loss | 2:26 | 0 | 1 | 1 | w1:100 |
| greedyLate | 15 | loss | 2:29 | 0 | 1 | 1 | w1:100 |
| greedyLate | 16 | loss | 2:27 | 0 | 1 | 1 | w1:100 |
| greedyLate | 17 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| greedyLate | 18 | loss | 2:29 | 0 | 1 | 1 | w1:100 |
| disruptor | 1 | WIN | 14:09 | 100 | 10 | - | - |
| disruptor | 2 | WIN | 14:22 | 5 | 10 | 10 | w10:95 |
| disruptor | 3 | loss | 2:38 | 0 | 2 | 2 | w2:100 |
| disruptor | 4 | WIN | 14:20 | 5 | 10 | 10 | w10:95 |
| disruptor | 5 | WIN | 14:16 | 20 | 10 | 2 | w2:80 |
| disruptor | 6 | loss | 2:31 | 0 | 2 | 1 | w1:80 w2:20 |
| disruptor | 7 | WIN | 14:19 | 5 | 10 | 10 | w10:95 |
| disruptor | 8 | WIN | 14:17 | 5 | 10 | 10 | w10:95 |
| disruptor | 9 | WIN | 14:04 | 100 | 10 | - | - |
| disruptor | 10 | loss | 2:39 | 0 | 2 | 2 | w2:100 |
| disruptor | 11 | loss | 14:13 | 0 | 10 | 1 | w1:20 w10:95 |
| disruptor | 12 | WIN | 14:07 | 100 | 10 | - | - |
| disruptor | 13 | WIN | 14:23 | 5 | 10 | 10 | w10:95 |
| disruptor | 14 | WIN | 14:12 | 5 | 10 | 10 | w10:95 |
| disruptor | 15 | loss | 11:42 | 0 | 10 | 10 | w10:100 |
| disruptor | 16 | loss | 2:33 | 0 | 2 | 1 | w1:60 w2:40 |
| disruptor | 17 | loss | 2:36 | 0 | 2 | 1 | w1:20 w2:80 |
| disruptor | 18 | WIN | 14:20 | 5 | 10 | 10 | w10:95 |
| human | 1 | WIN | 14:07 | 100 | 10 | - | - |
| human | 2 | WIN | 14:17 | 5 | 10 | 10 | w10:95 |
| human | 3 | loss | 6:16 | 0 | 5 | 4 | w4:20 w5:80 |
| human | 4 | WIN | 14:16 | 5 | 10 | 10 | w10:95 |
| human | 5 | WIN | 14:12 | 5 | 10 | 10 | w10:95 |
| human | 6 | WIN | 14:18 | 5 | 10 | 10 | w10:95 |
| human | 7 | loss | 6:21 | 0 | 5 | 4 | w4:20 w5:80 |
| human | 8 | WIN | 14:08 | 100 | 10 | - | - |
| human | 9 | WIN | 14:11 | 5 | 10 | 10 | w10:95 |
| human | 10 | WIN | 14:08 | 60 | 10 | 4 | w4:20 w5:20 |
| human | 11 | WIN | 13:52 | 100 | 10 | - | - |
| human | 12 | loss | 14:11 | 0 | 10 | 4 | w4:40 w5:40 w10:95 |
| human | 13 | WIN | 14:15 | 100 | 10 | - | - |
| human | 14 | WIN | 13:49 | 100 | 10 | - | - |
| human | 15 | WIN | 13:53 | 100 | 10 | - | - |
| human | 16 | loss | 14:11 | 0 | 10 | 4 | w4:40 w10:95 |
| human | 17 | loss | 6:18 | 0 | 5 | 4 | w4:20 w5:80 |
| human | 18 | WIN | 14:16 | 5 | 10 | 10 | w10:95 |
| passive | 1 | loss | 2:29 | 0 | 2 | 1 | w1:100 |
| passive | 2 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| passive | 3 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| passive | 4 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| passive | 5 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| passive | 6 | loss | 2:30 | 0 | 2 | 1 | w1:80 w2:20 |
| passive | 7 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| passive | 8 | loss | 2:29 | 0 | 2 | 1 | w1:100 |
| passive | 9 | loss | 2:27 | 0 | 1 | 1 | w1:100 |
| passive | 10 | loss | 2:29 | 0 | 1 | 1 | w1:100 |
| passive | 11 | loss | 2:27 | 0 | 1 | 1 | w1:100 |
| passive | 12 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| passive | 13 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| passive | 14 | loss | 2:26 | 0 | 1 | 1 | w1:100 |
| passive | 15 | loss | 2:29 | 0 | 1 | 1 | w1:100 |
| passive | 16 | loss | 2:27 | 0 | 1 | 1 | w1:100 |
| passive | 17 | loss | 2:28 | 0 | 1 | 1 | w1:100 |
| passive | 18 | loss | 2:29 | 0 | 1 | 1 | w1:100 |

summary: economy 14/18 wins avg 13:35 winHP 64% dmg/wave 1:16 2:6 7:4 10:58
greedyLate 0/18 wins avg 2:29 winHP 0% dmg/wave 1:96 2:4
disruptor 11/18 wins avg 10:52 winHP 32% dmg/wave 1:10 2:23 10:48
human 13/18 wins avg 12:50 winHP 53% dmg/wave 4:9 5:17 10:42
passive 0/18 wins avg 2:29 winHP 0% dmg/wave 1:96 2:4


## v1.2 (2026-10-11)
- Agent turns: ~20 tool calls. Reproduced the Data bug with real key/mouse input in Playwright (it fails on v1.1), fixed it, added speed and volume.
- All suites pass (path, play, layout, audio, v05, data, browser-game). Playtest with 18 seeds:
```
summary: economy 14/18 wins avg 13:35 winHP 64% dmg/wave 1:17 2:6 7:4 10:58
greedyLate 0/18 wins avg 2:29 winHP 0% dmg/wave 1:96 2:4
disruptor 11/18 wins avg 10:52 winHP 32% dmg/wave 1:10 2:23 10:48
human 12/18 wins avg 12:50 winHP 53% dmg/wave 4:6 5:16 6:1 10:48
passive 0/18 wins avg 2:29 winHP 0% dmg/wave 1:96 2:4
```
