// Every tuning number in one place. The scene is a fixed 640x460 logical
// panel; the page scales each panel to its column, so no rule below depends
// on the screen size.

export const PANEL = { width: 640, height: 460 };

// Seconds on the clock for each round, and how many hints a round starts with.
export const ROUND_TIME = [150, 120, 90];
export const HINTS_PER_ROUND = 3;

// Score: each found difference, each second left when a round is cleared.
export const POINTS_PER_FIND = 50;
export const POINTS_PER_SECOND_LEFT = 10;

// Seconds taken off the clock for a wrong click.
export const MISS_PENALTY_SECONDS = 3;

// How long a hint ring pulses on an unfound difference, in milliseconds.
export const HINT_MS = 2500;

// Keyboard reticle: arrow keys move it this far per press (Shift = fine step).
export const RETICLE_STEP = 24;
export const RETICLE_FINE_STEP = 8;

// How close a click must land to a difference's centre to count, in panel px.
// Each difference also carries its own radius; this is the floor.
export const HIT_RADIUS_MIN = 26;

// The timer blips once a second once this many seconds are left.
export const LOW_TIME_SECONDS = 10;

export const PALETTE = {
  page: '#14101d',
  panel: '#1d1830',
  hud: '#241d3a',
  hudEdge: '#3a2f5c',
  text: '#f4ead8',
  muted: '#b9a8d6',
  accent: '#ffb454',
  accentSoft: '#ffd28a',
  good: '#7ddc8a',
  bad: '#ff7a6b',
  marker: '#ffd23e',
  timerLow: '#ff6b5e',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'lantern-lane.best';
