# Build log

## v0.1 — 2026-10-11
- First playable: curses RTS (`rts.py`), shared logic (`game.py`), headless sim (`sim.py`), `config.txt`.
- Smoke tests: sim runs; 400 headless ticks show workers making round trips with Knowledge at 0 before any Library; Knowledge rises after Library; curses UI run under a pty at 80x30 and 30x10 (too-small message) and TERM=dumb without crashing; keystrokes accepted, `q` exits.
- Agent turns: ~5 tool turns (single executor session).
