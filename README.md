# Lantern Lane — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/afgil-ainudin/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/afgil-ainudin/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Lantern Lane** is a spot-the-difference game for the make.fun bounty [Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two pictures of a lantern-lit market lane, side by side, nearly the same. Find every difference before the clock runs out — three rounds (Dusk Market, Lantern Festival, Midnight Canal), each with more differences and less time. Click a difference on either picture, or move with the arrow keys and press Enter. Hints, a score, and synthesized WebAudio sounds included.

## How it plays

- **Round 1 · Dusk Market** — 7 differences, 2:30 on the clock.
- **Round 2 · Lantern Festival** — 8 differences, 2:00.
- **Round 3 · Midnight Canal** — 9 differences, 1:30.
- Each find is worth 50 points; clearing a round banks 10 points per second left. A wrong click costs 3 seconds. Three hints per round pulse a ring around an unfound difference.

## Run it

Serve `game/` with any static server and open it in desktop Chrome:

```sh
node serve.ts   # serves game/ on http://localhost:8080
```

or open `game/index.html` through a static server of your choice. No build step, no network requests, no dependencies — the art is hand-drawn SVG and the sounds are synthesized with WebAudio.

To hand the entry in (what the grader runs):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Layout

- `main.ts` — the hand-in program.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html`, `game/style.css` — the page shell and look.
- `game/src/config.js` — tuning numbers. `differences.js` — the three rounds' difference sets. `scene.js` — the SVG lane, drawn once and varied by flags so the two panels are near-identical by construction. `game.js` — state, clock, score, hints. `render.js` — panels, markers, HUD, overlays. `input.js` — pointer and keyboard. `sound.js` — synthesized sounds. `shots.js` — deterministic screenshot scenes. `main.js` — boot and the game loop.
- `screenshots/` — four real renders of the game's own code.
- `DOSSIER.md` — the game's design notes.

## License

MIT — see [LICENSE](LICENSE).
