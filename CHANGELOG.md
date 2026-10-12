# Changelog

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
