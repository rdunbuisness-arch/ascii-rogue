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

## 2026-10-11 v1.1 tuning (CEO)
v1.0 too easy and greedy economy won every time. Numbers changed:

| knob | v1.0 | v1.1 |
|---|---|---|
| WAVES W1 / W2 / W3 | 6 / 8 / 8+3 | 8 / 11 / 9+4 |
| wave_scale | 1 | 1.2 |
| enemy_hp_growth | 0.8 | 0.6 |
| unicorn_hp (new knob, was hard-coded) | 3 | 5 |
| boss_hp (SAM-1) | 200 | 900 |
| boss_dmg | 60 | 95 |
| boss_human_dmg | 15 | 10 |
| human_unicorn_dmg | 8 | 12 |
| cannon_cost (Disruptor) | 100 | 90 |
| cannon_dmg | 1 | 0.6 |
| soldier_cost (Human) | 50 | 30 |
| early-call bonus | unchanged | unchanged |

Result over 18 seeds:
```
summary: economy 14/18 wins avg 13:35 winHP 64% dmg/wave 1:16 2:6 7:4 10:58
greedyLate 0/18 wins avg 2:29 winHP 0% dmg/wave 1:96 2:4
disruptor 11/18 wins avg 10:52 winHP 32% dmg/wave 1:10 2:23 10:48
human 13/18 wins avg 12:50 winHP 53% dmg/wave 4:9 5:17 10:42
passive 0/18 wins avg 2:29 winHP 0% dmg/wave 1:96 2:4
```
Where each strategy struggles: economy on waves 1-2 and the boss, Disruptor-only on wave 2 and on SAM-1/Unicorns, Human-heavy on the wave 4-5 swarms. Hallucinator erratic movement skipped to save time.

## 2026-10-11 v1.2
- Data bug: assign('K') used to refuse until a Server Farm was *finished*, and the per-tick check reset K jobs to Power. Now a K assignment is kept while any farm exists and the Intern gathers Compute until the farm is done. The node queue and shortest-wait scoring already included finished Data nodes (verified: Interns cycle go/mine/back on the K node).
- Speed is a sim multiplier with ceil(speed) substeps per frame, so balance is unchanged. Not persisted; it starts at 1x.
- The volume control is a 5-segment click bar to fit the minimalist panel.

## 2026-10-11 v1.3
- New terrain knobs: rock_density 0.14, keep_clear 6, ridge_min/max 5/12, ridge_vert 0.65, ridge_turn 0.35, ridge_thick 0.3. Longer forced paths helped Disruptors and hurt Humans (Human-heavy fell to 4/12 wins), so Humans got cheaper (25) and slightly stronger against SAM-1 (8.5).
- Ground texture stays dark-on-dark so rocks, fields and the path preview keep their contrast.
