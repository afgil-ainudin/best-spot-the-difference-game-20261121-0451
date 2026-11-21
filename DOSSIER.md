# Lantern Lane — design dossier

## The game

**Lantern Lane** is a spot-the-difference game set in a lantern-lit market
lane at night. Two pictures of the same lane sit side by side; they are
nearly identical, and the player hunts the differences between them before
the clock runs out.

- **Round 1 · Dusk Market** — 7 differences, 2:30. Warm dusk sky, the lane
  settling in for the evening.
- **Round 2 · Lantern Festival** — 8 differences, 2:00. Deep blue night,
  the lanterns burning brighter, the changes smaller.
- **Round 3 · Midnight Canal** — 9 differences, 1:30. Dark teal night, the
  cobbles give way to canal water, and the differences hide in the details:
  a moon crater, a fish's eye, the moon's reflection.

## How it plays

- Click a difference on **either** picture. A found difference gets a
  numbered gold ring on both panels and a two-note chime; the counter reads
  `Found n / total · m left`.
- A wrong click costs 3 seconds and leaves a brief red ✕ where it landed.
- **Hints** (3 per round, the 💡 button or `H`): a green ring pulses for
  2.5 seconds around an unfound difference.
- **Keyboard**: arrow keys move a dashed reticle (Shift for fine steps),
  Enter/Space taps where it stands, `P` pauses, `R` restarts, `H` hints.
- **Scoring**: 50 points per find, plus 10 points per second left when a
  round is cleared. The best total is kept in localStorage.
- **Time pressure**: the clock blinks and blips once a second under 10
  seconds; running out ends the round.

## Original art, sounds and names

Everything is drawn and written for this game — nothing is copied from a
commercial game:

- **Art**: the lane is a hand-built SVG scene (`game/src/scene.js`): the
  moon and stars, the sagging lantern wire, the two shop-houses, the market
  stall with its fish, oranges and flower pot, the cat on its crate, the
  barrel, the cobbles — and, at midnight, the canal with its little boat.
  The two panels are the *same drawing* with different flags, so they are
  near-identical by construction and every difference is a deliberate
  change: a colour, a missing thing, a count, a direction.
- **Sounds**: all synthesized live with WebAudio (`game/src/sound.js`) —
  a chime for a find, a soft thud for a miss, a shimmer for a hint, a
  rising melody for a cleared round, a blip while the clock runs low.
- **Names**: Lantern Lane, Dusk Market, Lantern Festival, Midnight Canal.

## Structure

The source is split into files with one clear job each, named for what they
do (`game/src/`): `config.js` (tuning), `differences.js` (the three rounds'
difference sets), `scene.js` (the SVG lane), `game.js` (state, clock,
score, hints), `render.js` (panels, markers, HUD, overlays), `input.js`
(pointer and keyboard), `sound.js` (synthesized sounds), `shots.js`
(deterministic screenshot scenes), `main.js` (boot and the game loop).

## Screenshots

Four real renders of the game's own code, taken in desktop Chrome via
Playwright with `?shot=` scenes (`shots.js` stages each one from the real
game state and sets `window.__shotReady`):

1. `1-play.jpg` (cover) — mid-game: 3 of 7 found, gold rings on both
   panels, 4 left, the counter and clock visible.
2. `2-start.jpg` — the title screen over the lane.
3. `3-hint.jpg` — a hint pulsing on an unfound difference.
4. `4-win.jpg` — round complete: all 7 found, the score and time bonus.
