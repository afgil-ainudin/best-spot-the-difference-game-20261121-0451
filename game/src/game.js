// The game state of Lantern Lane: three rounds, a clock, a score, hints,
// and the found/missed bookkeeping. The scene itself lives in scene.js;
// this file only decides what happens when the player acts.

import { ROUNDS } from './differences.js';
import {
  HINTS_PER_ROUND, HINT_MS, LOW_TIME_SECONDS, MISS_PENALTY_SECONDS,
  POINTS_PER_FIND, POINTS_PER_SECOND_LEFT, ROUND_TIME,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_END = 'round-end';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

export function createGame(onEvent) {
  let roundIndex = 0;
  let found = new Set();
  let score = 0;
  let best = 0;
  let timeLeft = ROUND_TIME[0];
  let hintsLeft = HINTS_PER_ROUND;
  let hint = null;
  let lastFindLabel = '';
  let lastTickSecond = -1;
  let screen = SCREEN_TITLE;
  let roundBonus = 0;

  function round() { return ROUNDS[roundIndex]; }

  function resetRound(index) {
    roundIndex = index;
    found = new Set();
    timeLeft = ROUND_TIME[index];
    hintsLeft = HINTS_PER_ROUND;
    hint = null;
    lastFindLabel = '';
    lastTickSecond = -1;
    roundBonus = 0;
  }

  function start() {
    score = 0;
    resetRound(0);
    screen = SCREEN_PLAY;
    onEvent('start');
  }

  function remaining() { return round().differences.length - found.size; }

  function tap(x, y) {
    if (screen !== SCREEN_PLAY) return null;
    for (const diff of round().differences) {
      if (found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        found.add(diff.id);
        score += POINTS_PER_FIND;
        lastFindLabel = diff.label;
        onEvent('find', diff);
        if (found.size === round().differences.length) finishRound();
        return diff;
      }
    }
    timeLeft = Math.max(0, timeLeft - MISS_PENALTY_SECONDS);
    onEvent('miss');
    return null;
  }

  function finishRound() {
    roundBonus = Math.ceil(timeLeft) * POINTS_PER_SECOND_LEFT;
    score += roundBonus;
    if (roundIndex + 1 < ROUNDS.length) {
      screen = SCREEN_ROUND_END;
      onEvent('round-end');
    } else {
      screen = SCREEN_WIN;
      if (score > best) best = score;
      onEvent('win');
    }
  }

  function nextRound() {
    resetRound(roundIndex + 1);
    screen = SCREEN_PLAY;
    onEvent('next-round');
  }

  function useHint() {
    if (screen !== SCREEN_PLAY || hintsLeft <= 0) return null;
    const unfound = round().differences.filter((d) => !found.has(d.id));
    if (unfound.length === 0) return null;
    hintsLeft -= 1;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    hint = { diff: pick, until: performance.now() + HINT_MS };
    onEvent('hint', pick);
    return pick;
  }

  function tick(dt) {
    if (screen !== SCREEN_PLAY) return;
    timeLeft -= dt;
    if (timeLeft <= LOW_TIME_SECONDS && Math.ceil(timeLeft) !== lastTickSecond && timeLeft > 0) {
      lastTickSecond = Math.ceil(timeLeft);
      onEvent('tick');
    }
    if (timeLeft <= 0) {
      timeLeft = 0;
      screen = SCREEN_OVER;
      if (score > best) best = score;
      onEvent('over');
    }
  }

  return {
    get screen() { return screen; },
    set screen(value) { screen = value; },
    get roundIndex() { return roundIndex; },
    get round() { return round(); },
    get found() { return found; },
    get score() { return score; },
    set score(value) { score = value; },
    get best() { return best; },
    set best(value) { best = value; },
    get timeLeft() { return timeLeft; },
    set timeLeft(value) { timeLeft = value; },
    get hintsLeft() { return hintsLeft; },
    set hintsLeft(value) { hintsLeft = value; },
    get hint() { return hint; },
    set hint(value) { hint = value; },
    get lastFindLabel() { return lastFindLabel; },
    get roundBonus() { return roundBonus; },
    set roundBonus(value) { roundBonus = value; },
    remaining,
    start,
    resetRound,
    tap,
    nextRound,
    useHint,
    tick,
  };
}
