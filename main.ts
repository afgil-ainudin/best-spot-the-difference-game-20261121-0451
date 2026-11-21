// Lantern Lane — the hand-in program (Node 22, standard library only).
// It copies the game and its screenshots beside this file to /output and
// writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library. It never deletes /output itself: the grader
// mounts it, so removing it fails; it only creates it and fills it.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in an empty game: the grader would
// refuse it, and a quiet success here would hide a broken repo.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing: nothing to hand in');
}
if (!existsSync(join(here, 'screenshots')) || !existsSync(join(here, 'game'))) {
  throw new Error('game/ or screenshots/ is missing: nothing to hand in');
}
if (readdirSync(join(here, 'screenshots')).length === 0) {
  throw new Error('screenshots/ is empty: the hand-in needs 3-4 renders');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB
// of game files, in all, or a path under game/ over 1000 bytes: game/
// counts beside /output's own 1000-entry cap, its screenshots/ and
// dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
