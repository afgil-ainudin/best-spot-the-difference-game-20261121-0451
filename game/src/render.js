// Everything the player sees: the two scene panels, the rings on the
// differences found, the hint pulse, the HUD, and the overlay cards for
// the title, pause, round end, victory and game over screens.

import { flagsFor } from './differences.js';
import { buildSceneSVG } from './scene.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_ROUND_END, SCREEN_TITLE, SCREEN_WIN } from './game.js';

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function createRenderer(el, handlers) {
  const panelA = el.panelA;
  const panelB = el.panelB;

  function drawPanels(round) {
    panelA.querySelector('.scene').innerHTML = buildSceneSVG(round.theme, flagsFor(round, 'A'), 'A');
    panelB.querySelector('.scene').innerHTML = buildSceneSVG(round.theme, flagsFor(round, 'B'), 'B');
  }

  function markerHtml(diff, index, kind) {
    const left = `${(diff.x / 640) * 100}%`;
    const top = `${(diff.y / 460) * 100}%`;
    const label = kind === 'found' ? '✓' : '?';
    return `<div class="marker ${kind}" style="left:${left};top:${top}"><span>${label}</span></div>`;
  }

  function drawMarkers(game, missMark) {
    for (const panel of [panelA, panelB]) {
      const layer = panel.querySelector('.markers');
      let html = '';
      let index = 0;
      for (const diff of game.round.differences) {
        if (game.found.has(diff.id)) {
          index += 1;
          html += markerHtml(diff, index, 'found');
        }
      }
      if (game.hint && performance.now() < game.hint.until) {
        html += markerHtml(game.hint.diff, 0, 'hint');
      }
      layer.innerHTML = html;
    }
    if (missMark) {
      const host = missMark.panel === 'A' ? panelA : panelB;
      const layer = host.querySelector('.markers');
      const left = `${(missMark.x / 640) * 100}%`;
      const top = `${(missMark.y / 460) * 100}%`;
      const mark = document.createElement('div');
      mark.className = 'marker miss';
      mark.style.left = left;
      mark.style.top = top;
      mark.innerHTML = '<span>✕</span>';
      layer.appendChild(mark);
      window.setTimeout(() => mark.remove(), 700);
    }
  }

  function drawHud(game) {
    el.roundName.textContent = game.round.name;
    el.timerText.textContent = formatTime(game.timeLeft);
    el.timerText.classList.toggle('low', game.timeLeft <= 10 && game.screen === 'play');
    const total = game.round.differences.length;
    el.counter.textContent = `Found ${game.found.size} / ${total} · ${total - game.found.size} left`;
    el.score.textContent = `Score ${game.score}`;
    el.best.textContent = `Best ${game.best}`;
    el.streak.textContent = game.streak >= 2 ? `Streak ×${game.streak}` : '';
    const names = game.round.differences.filter((d) => game.found.has(d.id)).map((d) => `✓ ${d.label}`);
    el.foundList.textContent = names.length ? `Found: ${names.join(' · ')}` : 'Found: —';
    el.hintCount.textContent = `Hints ${game.hintsLeft}`;
    el.hintBtn.disabled = game.hintsLeft <= 0 || game.screen !== 'play';
  }

  function overlayHtml(kind, game) {
    if (kind === SCREEN_TITLE) {
      return `<h1>Lantern Lane</h1>`
        + `<p class="tagline">A spot-the-difference hunt down a lantern-lit lane.</p>`
        + `<p>Two pictures, side by side, nearly the same. Find every difference before the clock runs out — three rounds, each trickier than the last. Click a difference, or move with the arrow keys and press Enter. <b>H</b> spends a hint, <b>P</b> pauses, <b>R</b> restarts.</p>`
        + `<button data-act="start" class="primary">Start the hunt</button>`
        + `<p class="fine">Best score ${game.best} · Original art, sounds and names — drawn and written for this game.</p>`;
    }
    if (kind === SCREEN_PAUSED) {
      return `<h1>Paused</h1><p>Take a breath. The lanterns will wait.</p>`
        + `<button data-act="resume" class="primary">Resume</button>`
        + `<button data-act="restart">Restart round</button>`;
    }
    if (kind === SCREEN_ROUND_END) {
      return `<h1>Round complete!</h1>`
        + `<p>You found all ${game.round.differences.length} differences in ${game.round.name}. Time bonus <b>+${game.roundBonus}</b>.</p>`
        + `<p class="score-line">Score ${game.score}</p>`
        + `<button data-act="next" class="primary">Next round</button>`;
    }
    if (kind === SCREEN_WIN) {
      return `<h1>You found them all!</h1>`
        + `<p>Three rounds, every difference found. Lantern Lane is yours.</p>`
        + `<p class="score-line">Final score ${game.score} · Best ${game.best}</p>`
        + `<button data-act="restart" class="primary">Play again</button>`;
    }
    if (kind === SCREEN_OVER) {
      return `<h1>Time's up</h1>`
        + `<p>You found ${game.found.size} of ${game.round.differences.length} differences in ${game.round.name}.</p>`
        + `<p class="score-line">Score ${game.score} · Best ${game.best}</p>`
        + `<button data-act="restart" class="primary">Try again</button>`;
    }
    return '';
  }

  function showOverlay(kind, game) {
    if (!kind) {
      el.overlay.classList.add('hidden');
      el.overlay.innerHTML = '';
      return;
    }
    el.overlay.innerHTML = `<div class="card">${overlayHtml(kind, game)}</div>`;
    el.overlay.classList.remove('hidden');
    const card = el.overlay.querySelector('.card');
    card.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-act]');
      if (!button) return;
      const act = button.getAttribute('data-act');
      if (act === 'start') handlers.onStart();
      else if (act === 'resume') handlers.onResume();
      else if (act === 'next') handlers.onNextRound();
      else if (act === 'restart') handlers.onRestart();
    });
    const first = card.querySelector('button.primary');
    if (first) first.focus();
  }

  function announce(message) { el.status.textContent = message; }

  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.toast.classList.remove('show'), 2200);
  }

  return { drawPanels, drawMarkers, drawHud, showOverlay, announce, toast };
}
