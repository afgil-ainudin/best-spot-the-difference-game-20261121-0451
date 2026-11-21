// Boot and the one loop: the clock advances in real time, input is read
// every frame, and the renderer paints what is there. The game moves
// between title, play, paused, round-end, win and game-over screens.
//
// ?shot=start|play|hint|win stages that scene instead of running the loop,
// paints it twice and sets window.__shotReady for a screenshot.

import { BEST_KEY } from './config.js';
import { createGame, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_ROUND_END, SCREEN_TITLE, SCREEN_WIN } from './game.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, ACTION_RESTART, ACTION_TAP, createInput } from './input.js';
import { createRenderer } from './render.js';
import { createSounds } from './sound.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const panelA = document.getElementById('panel-a');
const panelB = document.getElementById('panel-b');
const reticle = document.getElementById('reticle');

const el = {
  panelA,
  panelB,
  roundName: document.getElementById('round-name'),
  timerText: document.getElementById('timer-text'),
  counter: document.getElementById('counter'),
  score: document.getElementById('score'),
  streak: document.getElementById('streak'),
  best: document.getElementById('best'),
  foundList: document.getElementById('found-list'),
  hintBtn: document.getElementById('hint-btn'),
  hintCount: document.getElementById('hint-count'),
  soundBtn: document.getElementById('sound-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  restartBtn: document.getElementById('restart-btn'),
  overlay: document.getElementById('overlay'),
  status: document.getElementById('status'),
  toast: document.getElementById('toast'),
};

const sounds = createSounds();
const input = createInput(panelA, panelB, reticle);
const game = createGame(handleEvent);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

game.best = readBest();

function handleEvent(kind, diff) {
  if (kind === 'find') {
    sounds.find();
    renderer.toast(diff.label);
    renderer.announce(`${diff.label}. ${game.remaining()} left.`);
  } else if (kind === 'miss') {
    sounds.miss();
    renderer.announce('Not a difference. Three seconds lost.');
  } else if (kind === 'hint') {
    sounds.hint();
    renderer.announce(`Hint: look near the ${diff.label.toLowerCase()}.`);
  } else if (kind === 'tick') {
    sounds.tick();
  } else if (kind === 'round-end') {
    sounds.win();
    renderer.announce(`Round complete! Bonus ${game.roundBonus}.`);
  } else if (kind === 'win') {
    sounds.win();
    saveBest(game.best);
    renderer.announce(`You found them all! Final score ${game.score}.`);
  } else if (kind === 'over') {
    saveBest(game.best);
    renderer.announce(`Time's up. You found ${game.found.size} differences.`);
  }
}

const renderer = createRenderer(el, {
  onStart: () => { sounds.click(); startPlaying(); },
  onResume: () => { sounds.click(); game.screen = SCREEN_PLAY; renderer.showOverlay(null, game); },
  onNextRound: () => { sounds.click(); game.nextRound(); renderer.drawPanels(game.round); renderer.showOverlay(null, game); },
  onRestart: () => { sounds.click(); startPlaying(); },
});

function startPlaying() {
  game.start();
  renderer.drawPanels(game.round);
  renderer.showOverlay(null, game);
  renderer.announce(`Playing ${game.round.name}. Find ${game.round.differences.length} differences.`);
}

function paint() {
  renderer.drawMarkers(game, null);
  renderer.drawHud(game);
}

function runShot(name) {
  const overlay = stageShot(name, game);
  renderer.drawPanels(game.round);
  let painted = 0;
  function frame() {
    paint();
    renderer.showOverlay(overlay, game);
    painted += 1;
    if (painted < 2) requestAnimationFrame(frame);
    else window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

function runGame() {
  renderer.drawPanels(game.round);
  renderer.showOverlay(SCREEN_TITLE, game);
  let last = performance.now();
  let lastWholeSecond = -1;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;

    const actions = input.takeActions();
    const taps = input.takeTaps();
    if (actions & ACTION_RESTART && game.screen !== SCREEN_TITLE) startPlaying();
    if (actions & ACTION_PAUSE) {
      if (game.screen === SCREEN_PLAY) {
        game.screen = SCREEN_PAUSED;
        renderer.showOverlay(SCREEN_PAUSED, game);
      } else if (game.screen === SCREEN_PAUSED) {
        game.screen = SCREEN_PLAY;
        renderer.showOverlay(null, game);
      }
    }
    if (actions & ACTION_HINT) {
      const pick = game.useHint();
      if (pick) renderer.drawMarkers(game, null);
    }
    for (const tap of taps) {
      if (game.screen !== SCREEN_PLAY) break;
      const hit = game.tap(tap.x, tap.y);
      renderer.drawMarkers(game, hit ? null : tap);
      if (game.screen === SCREEN_ROUND_END) renderer.showOverlay(SCREEN_ROUND_END, game);
      else if (game.screen === SCREEN_WIN) renderer.showOverlay(SCREEN_WIN, game);
      else if (game.screen === SCREEN_OVER) renderer.showOverlay(SCREEN_OVER, game);
    }
    if (actions & ACTION_CONFIRM && (game.screen === SCREEN_TITLE || game.screen === SCREEN_OVER || game.screen === SCREEN_WIN)) {
      startPlaying();
    }

    if (game.screen === SCREEN_PLAY) {
      game.tick(dt);
      if (game.screen === SCREEN_OVER) renderer.showOverlay(SCREEN_OVER, game);
      const whole = Math.ceil(game.timeLeft);
      if (whole !== lastWholeSecond) {
        lastWholeSecond = whole;
        paint();
      }
      // A spent hint ring must vanish the moment it expires, not linger
      // until the next whole-second paint.
      if (game.hint && performance.now() >= game.hint.until) {
        game.hint = null;
        paint();
      }
    }
    if (actions & (ACTION_TAP | ACTION_HINT | ACTION_PAUSE | ACTION_RESTART)) paint();
  }

  el.hintBtn.addEventListener('click', () => {
    const pick = game.useHint();
    if (pick) renderer.drawMarkers(game, null);
    paint();
  });
  el.soundBtn.addEventListener('click', () => {
    const muted = sounds.toggleMuted();
    el.soundBtn.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
    el.soundBtn.setAttribute('aria-pressed', String(!muted));
  });
  el.pauseBtn.addEventListener('click', () => {
    if (game.screen === SCREEN_PLAY) {
      game.screen = SCREEN_PAUSED;
      renderer.showOverlay(SCREEN_PAUSED, game);
    } else if (game.screen === SCREEN_PAUSED) {
      game.screen = SCREEN_PLAY;
      renderer.showOverlay(null, game);
    }
  });
  el.restartBtn.addEventListener('click', () => startPlaying());

  renderer.announce('Lantern Lane. Press Space or click Start to play.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
