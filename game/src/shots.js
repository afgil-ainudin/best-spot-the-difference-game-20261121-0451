// The screenshot scenes behind ?shot=start|play|hint|win. Each one sets the
// real game to a fixed state — the same state a player would reach — then
// paints it twice and sets window.__shotReady, so a screenshot is a real
// render of the game's own code, never a mock-up.

import { ROUNDS } from './differences.js';
import { SCREEN_ROUND_END, SCREEN_TITLE } from './game.js';

/** Stage `name` on a fresh game and return the overlay kind to show. */
export function stageShot(name, game) {
  game.start();
  if (name === 'play') {
    const firstFour = ROUNDS[0].differences.slice(0, 4);
    for (const diff of firstFour) game.found.add(diff.id);
    game.timeLeft = 107;
    game.score = 200;
    game.streak = 4;
    return null;
  }
  if (name === 'hint') {
    const firstTwo = ROUNDS[0].differences.slice(0, 2);
    for (const diff of firstTwo) game.found.add(diff.id);
    game.timeLeft = 72;
    game.score = 100;
    game.hintsLeft = 2;
    game.hint = { diff: ROUNDS[0].differences[4], until: performance.now() + 60000 };
    return null;
  }
  if (name === 'win') {
    // All 7 found in round 1: the round is complete, with its time bonus.
    // (The final victory screen belongs to clearing all three rounds.)
    for (const diff of ROUNDS[0].differences) game.found.add(diff.id);
    game.timeLeft = 64;
    game.score = 350;
    game.roundBonus = 640;
    game.screen = SCREEN_ROUND_END;
    game.best = 990;
    return SCREEN_ROUND_END;
  }
  game.screen = SCREEN_TITLE;
  game.timeLeft = 150;
  return SCREEN_TITLE;
}
