# asciirogue — Design

## Pillars
1. **An ASCII RTS** — real-time, terminal, text only.
2. **Ryan drives design** — the agent builds; Ryan decides.
3. **Power is the main resource.**

## Decision log
- 2026-10-11 — Project switches to an RTS (from roguelike).
- 2026-10-11 — Home base `H` (2x2) trains workers; training costs Power and takes time.
- 2026-10-11 — Workers `w` gather Power and Knowledge, visibly walking to a node, gathering, and carrying back (carry shown with a different glyph/color).
- 2026-10-11 — Power nodes `P` are mined directly.
- 2026-10-11 — Knowledge deposits `K` need a Library `L` (costs Power) built on top before they can be mined.
- 2026-10-11 — HUD shows Power, Knowledge, worker count live plus controls.
- 2026-10-11 — Keyboard-only controls; workers start auto-assigned to Power.
- 2026-10-11 — Small fixed map (~60x20), tuning in config.txt, headless sim for build orders.

## Open questions
- What is Knowledge spent on (tech, upgrades, new units)?
- Are there enemies / combat? Win/lose condition?
- How do players control things long-term: cursor selection, groups, or only global commands?
- Should nodes deplete by default? Multiple bases?
- Pathing/obstacles, or keep straight-line movement?
