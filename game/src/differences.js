// The three rounds of Lantern Lane. Each round names its scene theme, its
// clock, and the differences between the two panels. A difference is one
// flag that takes value `a` on the left panel and value `b` on the right,
// plus the spot a player must tap (panel coordinates, in the 640x460 scene)
// and a short label the game shows when it is found.

export const ROUNDS = [
  {
    name: 'Round 1 · Dusk Market',
    theme: 'dusk',
    differences: [
      { id: 'moon', flag: 'moon', a: true, b: false, x: 520, y: 70, r: 34, label: 'The moon vanished' },
      { id: 'lantern3', flag: 'lantern3Color', a: 'red', b: 'teal', x: 320, y: 112, r: 30, label: 'A lantern changed colour' },
      { id: 'cat', flag: 'cat', a: true, b: false, x: 438, y: 358, r: 32, label: 'The cat slipped away' },
      { id: 'window', flag: 'leftWindowLit', a: true, b: false, x: 84, y: 218, r: 32, label: 'A window went dark' },
      { id: 'signfish', flag: 'signFishCount', a: 3, b: 2, x: 305, y: 377, r: 30, label: 'One fish left the sign' },
      { id: 'flower', flag: 'flower', a: true, b: false, x: 280, y: 315, r: 28, label: 'The flower is gone' },
      { id: 'bird', flag: 'bird', a: true, b: false, x: 170, y: 78, r: 28, label: 'The bird flew off the wire' },
    ],
  },
  {
    name: 'Round 2 · Lantern Festival',
    theme: 'festival',
    differences: [
      { id: 'stripe', flag: 'awningStripe2', a: 'red', b: 'teal', x: 300, y: 255, r: 30, label: 'An awning stripe changed colour' },
      { id: 'shutter', flag: 'rightShutterOpen', a: true, b: false, x: 480, y: 325, r: 32, label: 'The shutter closed' },
      { id: 'tassel', flag: 'lantern4Tassel', a: true, b: false, x: 430, y: 152, r: 26, label: 'A lantern lost its tassel' },
      { id: 'crates', flag: 'crates', a: 3, b: 2, x: 75, y: 380, r: 32, label: 'A crate went missing' },
      { id: 'fishdir', flag: 'signFishDir', a: 'left', b: 'right', x: 122, y: 300, r: 30, label: 'The sign fish turned around' },
      { id: 'tail', flag: 'catTailUp', a: true, b: false, x: 462, y: 362, r: 28, label: 'The cat lowered its tail' },
      { id: 'oranges', flag: 'oranges', a: 3, b: 2, x: 360, y: 330, r: 28, label: 'An orange rolled away' },
      { id: 'star', flag: 'brightStar', a: true, b: false, x: 470, y: 45, r: 26, label: 'A bright star blinked out' },
    ],
  },
  {
    name: 'Round 3 · Midnight Canal',
    theme: 'canal',
    differences: [
      { id: 'crater', flag: 'moonCrater', a: true, b: false, x: 530, y: 62, r: 24, label: 'A moon crater smoothed over' },
      { id: 'lantern2', flag: 'lantern2Lit', a: true, b: false, x: 210, y: 112, r: 30, label: 'A lantern went out' },
      { id: 'curtain', flag: 'rightCurtainClosed', a: true, b: false, x: 480, y: 325, r: 32, label: 'The curtain opened' },
      { id: 'boat', flag: 'boat', a: true, b: false, x: 500, y: 440, r: 32, label: 'The little boat drifted off' },
      { id: 'price', flag: 'priceTag', a: '5', b: '6', x: 370, y: 375, r: 26, label: 'The price changed' },
      { id: 'hoops', flag: 'barrelHoops', a: 2, b: 3, x: 267, y: 399, r: 30, label: 'The barrel gained a hoop' },
      { id: 'flag', flag: 'flag', a: true, b: false, x: 132, y: 86, r: 28, label: 'The little flag is gone' },
      { id: 'fisheye', flag: 'fishEye', a: true, b: false, x: 310, y: 338, r: 24, label: 'A fish lost its eye' },
      { id: 'ripple', flag: 'moonRipple', a: true, b: false, x: 520, y: 445, r: 30, label: 'The moon lost its reflection' },
    ],
  },
];

/** The flag values the left panel always starts from (the "a" side). */
export const DEFAULT_FLAGS = {
  moon: true,
  moonCrater: true,
  lantern3Color: 'red',
  lantern2Lit: true,
  lantern4Tassel: true,
  cat: true,
  catTailUp: true,
  leftWindowLit: true,
  signFishCount: 3,
  signFishDir: 'left',
  flower: true,
  bird: true,
  awningStripe2: 'red',
  rightShutterOpen: true,
  crates: 3,
  oranges: 3,
  brightStar: true,
  rightCurtainClosed: true,
  boat: true,
  priceTag: '5',
  barrelHoops: 2,
  flag: true,
  fishEye: true,
  moonRipple: true,
};

/** Flags for one panel of a round: 'A' takes every difference's `a` value. */
export function flagsFor(round, variant) {
  const flags = { ...DEFAULT_FLAGS };
  for (const diff of round.differences) flags[diff.flag] = variant === 'A' ? diff.a : diff.b;
  return flags;
}
