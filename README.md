# MetalVlug

A 2D run and gun for the browser. Pip and Juno of the Lantern Brigade fight through Lowtide Docks and the Rustbelt Railyard to free the captured Tinkers and wreck the Rustcoats' war machines.

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:5180
```

| Script | What it does |
|--------|--------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Type check and production build into `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests with real key presses (Playwright) |
| `npm run assets` | Regenerate the sprite atlas, fonts, backgrounds and baked effects |
| `npm run audit` | Lint the sprite atlas (colour budgets, alpha, stray pixels) |

On Windows run Vitest from an uppercase `C:\` path.

Add `?skip` to the URL to jump straight into a mission, `?skip&level=railyard` for mission 2, and `?bg=0`, `?bg=1` or `?bg=2` to pick the time of day.

## Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move, aim up, crouch | Arrows or WASD | Stick / D pad |
| Fire (knife when close) | J or Z | X |
| Jump | K, X or Space | A |
| Bomb | L or C | B |
| Leave the Mule | Up + Jump, or E | Y |
| Launch the Mule | Up + Jump + Fire | |
| Pause | Esc or P | Start |

## What is in it

- Mission 1, Lowtide Docks, ending with the Iron Warden.
- Mission 2, Rustbelt Railyard, ending with the Railbreaker tank.
- A Training Camp tutorial and a mission select.
- Two playable soldiers with different perks.
- Rivet gun, Scatter cannon, Thumper, Furnace flamer, Arc Lance beam, bombs and the Mule walker.
- Riflemen, grenadiers, knife chargers, bazooka and riot shield troopers, paratroopers.
- Three times of day per stage, picked at random on each load.
- Options for music, sound, announcer, screen shake, flashes and an easy mode, saved locally.

## Stack

Phaser 4, TypeScript, Vite, Vitest, Playwright. The pixel art is drawn by code in `tools/sprites`; explosion and impact effects are baked at build time from [pixelfx](https://github.com/patch-gg/pixelfx). Music and sound effects are free licensed tracks, listed with their authors in [CREDITS.md](CREDITS.md).
