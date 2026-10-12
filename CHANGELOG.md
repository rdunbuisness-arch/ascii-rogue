# Changelog

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
