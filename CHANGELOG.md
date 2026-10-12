# Changelog

## v1.2 - 2026-10-11
- Fix: pressing K while the Server Farm was still being built did nothing, so Interns never mined Data unless you pressed K again later. Now K works as soon as a Server Farm is placed: the Intern keeps mining Compute until the farm is done, then switches to Data on its own.
- Game speed 1x/1.5x/2x: button in the top bar, T or +/- hotkeys. The sim is sub-stepped, so balance doesn't change.
- Volume control (5 steps) next to the mute button. Saved in localStorage 'asciirogue_volume'. Uses GameAudio.setVolume/getVolume when present, otherwise scales the built-in beeps.
- New tests/data.test.js: browser regression for the L + click + K flow, plus speed and volume checks.

## v1.1 - 2026-10-11 (tuning only)
- Harder: bigger early waves, tankier Unicorns and SAM-1, weaker but cheaper Disruptors, cheaper Humans. Greedy economy no longer dominates.
- Playtest bot: new greedy-late strategy, per-wave damage tracking.

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

## v1.0 — demo (2026-10-11)
- Streamed waves from a data-driven composition table (Chatbot / Scraper / Hallucinator / Unicorn), spawned over 20s.
- Auto waves ON by default (first at 75s, then 75s stepping -2 to 58s); Send Wave calls early for +1 Compute per second skipped.
- Boss SAM-1 on wave 10 (200 HP, speed 9, 60 damage to The Market, Humans only do 15 to it).
- New Hallucinator robot (1.5x HP, speed 26, pink alt Chatbot frames).
- Strategy Officer CONFIG patch: enemy_hp 4 (+0.8/wave), attack_dmg 20, upgrade prices; Workplace supply raised to +6 after playtests.
- UI: progress bars + queue counts on Train Intern/Human and building tiles; bars over buildings under construction and
  over The Market / Workplace while training; next-wave bar in the top strip with wave number and composition icons;
  red flash + SFX for "not enough Compute" / "supply blocked".
- Fixes: 1920x1080 shows ~2x more cells; bottom panel fits narrow screens.
- Audio v2 (Chiptune Composer): music states build/wave/boss, ducking on base hits, new SFX hooks.
- Tests: headless sim harness + scripted playtest bot (tests/playtest.js), full browser game test, updated audio/v05/play/layout tests.

## v0.5 — build-order tuning (2026-10-11)
- Audio merged: GameAudio chiptune music (starts on first click/key) + SFX; M key and mute button.
- Node queue: one Intern mines a node at a time; Interns pick the node with the shortest wait.
- Supply cap: The Market 12, Server Farm +6, Workplace +4; shown as SUPPLY used/cap in the top strip.
- Strategy Officer numbers: start 100 Compute; Intern 50/6s (gather 1.5s); Disruptor 100 with an 8s build;
  Workplace 150/15s; Server Farm 75/12s; Human 50/6s; upgrades Antitrust 30D+50C, Long-Termism 50D+75C,
  Red Tape 60D+75C, Tinfoil Hats 25D+40C.
- Threat: attack_dmg stays 10; wave_base 4 -> 6. Send Wave stays the default (auto_waves knob, wave_first 25).
- Compute nodes now spawn 48-100px from the base (Data 80-170px) so maps are evenly fair.
- Humans (were Luddites) are single-use snipers: auto-fire at the nearest robot within 3.5x Disruptor range,
  kill any non-Unicorn outright, deal 8 to Unicorns, and are consumed.
- Tinfoil Hats reworked: Humans deal 2x damage to Unicorns (old "survive one extra hit" no longer applies).
- Renames: Luddite -> Human, Union Hall -> Workplace, The Last Office -> The Market.
- Tests: new tests/v05.test.js (node queue, supply cap, Human one-shot); all suites updated and passing.

## v0.4.3 — layout fix (2026-10-11)
- Fix: the top HUD bar no longer covers the top map rows. The HUD has its own strip above the map, the panel its
  own strip below; the map is offset and sized to the space between (screen shake and drawing are clipped to it).
- Toast messages moved into the top strip (they used to sit over the bottom map rows).
- New `tests/layout.test.js` (Playwright): at 7 window sizes, asserts no HUD rectangle intersects the map's
  playable cells, and that robots spawn, path and reach the base through the top and bottom rows.

## v0.4.2 — renames (2026-10-11)
- Post → Terms of Service (tile: TOS); Damage+ → Antitrust Suit (tile: ANTITRUST); Range+ → Long-Termism (tile: LONG-TERM);
  Walls → Red Tape; Armor → Tinfoil Hats (tile: TINFOIL). Corner tag v0.4.2. No gameplay changes.

## v0.4 — Superhumanity (2026-10-11)
- Pivot: fast chiptune arcade tower defense. Humanity vs. superintelligent humanoid robots.
- Grid map with rock blocks (can't build on them). Robots spawn at the right edge.
- Pylons [Q] and force fields [F]: a field links two rocks/pylons in a straight line and blocks robots.
  Fields chain from the last anchor.
- Robots follow a BFS flow field to the Keep, recomputed whenever the grid changes; a red dotted
  line previews their route. Any placement that would seal the Keep off is rejected, so you build a maze.
- Plasma cannons [C] auto-fire at the robot closest to the Keep in range. Knowledge upgrades:
  DAMAGE+ [1], RANGE+ [2], plus WALLS [3] and soldier ARMOR [4]. Soldiers remain as backup.
- Robots have HP (grows each wave) and pay a small Power bounty when destroyed.
- Faster pacing: first wave at 20s, waves every 25s, quicker gathering/training, faster robots.
- Chiptune SFX (M mutes). New start screen title. Top bar keeps Power, Knowledge, workers, soldiers, next wave + size.
- All labels in a NAMES table and pixel art in a SPRITES table (placeholders for final names/art).
- Waves are player-launched by default: big SEND WAVE tile / N hotkey; top bar shows "Next: wave N/10 (~size)".
  The timer is a knob (`?auto_waves=1`, then `wave_first`/`wave_interval` apply).
- Visual spec docs/mockup-superhumanity: its palette and sprites (Intern, Luddite, The Last Office, Union Hall,
  Server Farm, Compute/Data deposits, Paywall posts, Disruptor, Alignment Spawn, Chatbot/Scraper/Unicorn robots).
- Starred NAMES.md labels: Compute, Data, Intern, Luddite, The Last Office, Union Hall, Server Farm, Paywall,
  Disruptor, The Alignment (led by SAM-1). Robot mix: Chatbots, Scrapers from wave 3 (fast), Unicorns from wave 5 (tank).
- Tests: `node tests/path.test.js` (pathfinding/anti-seal) and `tests/play.test.js` (Playwright: placement, maze, cannons kill robots, win, restart).

## v0.3.1 — bold bottom panel (2026-10-11)
- One compact, centered bottom panel: income bars, Train Worker/Soldier, and a large 3x3 command card side by side.
- Bold minimalist UI: big flat tiles, no borders, short labels (icon + name + cost + hotkey chip), chunky high-contrast bars.
- Top-bar metrics, pixel-art sprites and map unchanged.

## v0.3 — playable demo (2026-10-11)
- Knowledge upgrades on the command card (each buyable once, shown DONE):
  Sharper Spears [1] (soldiers survive one extra contact), Faster Workers [2] (+25% speed),
  Stone Walls [3] (+50 Keep max HP and full heal).
- Win condition: survive 10 waves (`?win_waves=N`). Victory and game-over screens show time,
  waves, attackers stopped, peak population, Power/Knowledge gathered. R restarts.
- Start screen with title, goal and controls; click or any key starts.
- Juice (mockup palette and HUD kept): death particles and hit flashes, screen shake when the Keep is hit,
  wave countdown pulses under 5s.
- Version tag in the corner. Top bar keeps the mockup metrics (Power, Knowledge, workers, soldiers, next wave + size).

## v0.2 — pixel RTS (2026-10-11)
- Single-file pixel-art build (`docs/index.html`) using the mockup sprites; map fills the window.
- Economy: Keep trains workers, workers haul Power; Library on a Knowledge deposit unlocks Knowledge.
- Income bars (Power/min, Knowledge/min over a rolling 30s) with totals.
- Train Worker / Train Soldier buttons; data-driven 3x3 command card with placement ghosts.
- Barracks required for soldiers; soldiers guard the Keep and intercept attackers.
- Timed, growing enemy waves with countdown; soldier/attacker contact kills both;
  Keep HP, game over, R restarts. All knobs overridable via URL params.
