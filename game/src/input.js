// Pointer and keyboard input for Lantern Lane. A click on either panel is
// converted to scene coordinates (the 640x460 panel space); the keyboard
// drives a reticle across the panels, Enter/Space taps where it stands.
// The game reads actions through `takeActions()` once a frame.

export const ACTION_TAP = 1;
export const ACTION_HINT = 2;
export const ACTION_PAUSE = 4;
export const ACTION_CONFIRM = 8;
export const ACTION_RESTART = 16;

export function createInput(panelA, panelB, reticle) {
  // Taps are a queue, not a single slot: two quick taps between frames
  // must both land, never overwrite each other.
  let taps = [];
  let actions = 0;
  const reticlePos = { x: 320, y: 230, panel: 'B' };

  function toScene(event, panel) {
    // Map against the SVG's own box, not the panel's: the panel also holds
    // its heading above the picture, which would skew every y.
    const svg = panel.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const box = svg.viewBox.baseVal;
    return {
      x: ((event.clientX - rect.left) / rect.width) * box.width,
      y: ((event.clientY - rect.top) / rect.height) * box.height,
      panel: panel === panelA ? 'A' : 'B',
    };
  }

  function placeReticle() {
    const panel = reticlePos.panel === 'A' ? panelA : panelB;
    const svg = panel.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const host = panel.parentElement.getBoundingClientRect();
    const scaleX = rect.width / 640;
    const scaleY = rect.height / 460;
    reticle.style.display = 'block';
    reticle.style.left = `${rect.left - host.left + reticlePos.x * scaleX - 14}px`;
    reticle.style.top = `${rect.top - host.top + reticlePos.y * scaleY - 14}px`;
  }

  function onPointerDown(event, panel) {
    event.preventDefault();
    const tap = toScene(event, panel);
    taps.push(tap);
    reticlePos.x = tap.x;
    reticlePos.y = tap.y;
    reticlePos.panel = tap.panel;
    actions |= ACTION_TAP;
    reticle.style.display = 'none';
  }

  panelA.addEventListener('pointerdown', (event) => onPointerDown(event, panelA));
  panelB.addEventListener('pointerdown', (event) => onPointerDown(event, panelB));

  function moveReticle(dx, dy) {
    reticlePos.x = Math.min(640, Math.max(0, reticlePos.x + dx));
    reticlePos.y = Math.min(460, Math.max(0, reticlePos.y + dy));
  }

  function onKeyDown(event) {
    const step = event.shiftKey ? 8 : 24;
    switch (event.key) {
      case 'ArrowLeft': moveReticle(-step, 0); placeReticle(); event.preventDefault(); break;
      case 'ArrowRight': moveReticle(step, 0); placeReticle(); event.preventDefault(); break;
      case 'ArrowUp': moveReticle(0, -step); placeReticle(); event.preventDefault(); break;
      case 'ArrowDown': moveReticle(0, step); placeReticle(); event.preventDefault(); break;
      case 'Enter':
      case ' ':
        taps.push({ x: reticlePos.x, y: reticlePos.y, panel: reticlePos.panel });
        actions |= ACTION_TAP | ACTION_CONFIRM;
        placeReticle();
        event.preventDefault();
        break;
      case 'h':
      case 'H': actions |= ACTION_HINT; break;
      case 'p':
      case 'P': actions |= ACTION_PAUSE; break;
      case 'r':
      case 'R': actions |= ACTION_RESTART; break;
      default: break;
    }
  }
  document.addEventListener('keydown', onKeyDown);

  return {
    reticlePos,
    /** Every tap since the last frame, in order. */
    takeTaps() {
      const value = taps;
      taps = [];
      return value;
    },
    takeActions() {
      const value = actions;
      actions = 0;
      return value;
    },
  };
}
