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
- 2026-10-11 — A web build (docs/index.html) is published on GitHub Pages so Ryan can playtest from a link.
- 2026-10-11 — Home base art: the Keep (9x5 multi-line sprite, flag `|>` highlighted and blinking while a worker trains; workers drop off just below the doorway). Replaces the 2x2 `H`.
- 2026-10-11 — Terminal version (rts.py/game.py/sim.py/config.txt) is retired; the web build (docs/index.html) is primary. Tuning knobs live in its CONFIG object and URL params.
- 2026-10-11 — Web play screen scales its font to fill ~90% of the window (recomputed on resize); default map 100x35.

## Open questions
- What is Knowledge spent on (tech, upgrades, new units)?
- Are there enemies / combat? Win/lose condition?
- How do players control things long-term: cursor selection, groups, or only global commands?
- Should nodes deplete by default? Multiple bases?
- Pathing/obstacles, or keep straight-line movement?

- 2026-10-11 — Visual iteration happens via chat mockups plus a static mockup page (`docs/mockup/`); game logic waits until the look is settled.

## Superhumanity direction (2026-10-11)
- Title: **Superhumanity**. Modern humanity under attack by superintelligent AI in humanoid robots; satire of modern AI and the grab for Knowledge and Power.
- Fast-paced, bright, chiptune arcade.
- Gameplay: tower defense. Buy force fields that link terrain into a maze for robots to path through, and build plasma cannon towers.
- The economy (Power and Knowledge) stays. Naming proposals in NAMES.md.

## v1.0 demo decisions — 2026-10-11
- Waves: auto timer ON by default (first 75s, interval 75s, -2/wave, min 58s), streamed over 20s; Send Wave = early call, +1 Compute per second skipped.
- Composition table per Strategy Officer (W1 6 ... W10 8/4/3/1 + SAM-1). SAM-1: 200 HP, speed 9, 60 base damage.
- attack_dmg 20 (newer CEO pacing call); enemy_hp 4, growth 0.8.
- Deviation from the CONFIG patch: soldier_hp 2/3 assumed melee Luddites. Our Humans are single-use snipers, so instead
  SAM-1 resists Humans (15 damage per shot) and Tinfoil Hats stays "Humans x2 vs Unicorns/SAM-1".
- Playtest-driven change: Workplace supply +4 -> +6 (Human-heavy strategy went from 2/4 to 6/6 wins).
- Hallucinator added as a pink alt-frame Chatbot (1.5x HP, speed 26); no erratic pathing yet.
- Playtest (6 seeds each): see CHANGELOG/LOG; sensible strategies win, passive loses at wave 2, games ~12-14 min.
