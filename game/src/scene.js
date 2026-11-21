// Draws one panel of the Lantern Lane scene as an SVG string. The two
// panels of a round are the same drawing with different flags: every
// difference in the round is one flag that takes its `a` value on the left
// panel and its `b` value on the right. Nothing here is copied from any
// other game: the lane, the lanterns, the stall and the cat are drawn here.

const THEMES = {
  dusk: {
    skyTop: '#3a2f6b', skyMid: '#c65b4e', skyBot: '#f2a65e',
    buildingLeft: '#a85f3c', buildingRight: '#4a7a6f',
    roofLeft: '#7c3f2a', roofRight: '#33584f',
    ground: '#6b5b4c', groundDark: '#57493d', glow: 0.45,
  },
  festival: {
    skyTop: '#0c1734', skyMid: '#1d3a6e', skyBot: '#2f5d8a',
    buildingLeft: '#8a4b3d', buildingRight: '#3d6b5e',
    roofLeft: '#5f352b', roofRight: '#2c4f45',
    ground: '#4a4038', groundDark: '#3a322b', glow: 0.7,
  },
  canal: {
    skyTop: '#041e28', skyMid: '#0a3540', skyBot: '#0f5257',
    buildingLeft: '#6e3f33', buildingRight: '#2f5d54',
    roofLeft: '#4a2a22', roofRight: '#21403a',
    ground: '#0a3540', groundDark: '#072830', glow: 0.8,
  },
};

const STARS = [
  [60, 40], [150, 30], [240, 55], [330, 28], [380, 70], [580, 35],
  [90, 90], [200, 80], [480, 95], [560, 120], [40, 140], [300, 110], [620, 90],
];

function star(x, y, r, fill, opacity) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
}

function fishShape(x, y, dir, eye, scale) {
  const s = scale || 1;
  const flip = dir === 'right' ? -1 : 1;
  const eyeDot = eye ? `<circle cx="${x + flip * 6 * s}" cy="${y - 2 * s}" r="1.6" fill="#20242e"/>` : '';
  return `<g transform="translate(${x} ${y}) scale(${flip * s} ${s})">`
    + `<ellipse rx="13" ry="7" fill="#b8d4e8" stroke="#5d7d99" stroke-width="1"/>`
    + `<polygon points="-12,0 -19,-6 -19,6" fill="#b8d4e8" stroke="#5d7d99" stroke-width="1"/>`
    + `<path d="M -4,-5 Q 0,0 -4,5" fill="none" stroke="#5d7d99" stroke-width="1"/>`
    + eyeDot + '</g>';
}

function lantern(x, y, color, lit, tassel) {
  const body = lit ? color : '#3a3f4a';
  const glow = lit
    ? `<circle cx="${x}" cy="${y + 18}" r="30" fill="${color}" opacity="0.22"/>`
    : '';
  const tasselSvg = tassel
    ? `<line x1="${x}" y1="${y + 34}" x2="${x}" y2="${y + 42}" stroke="#e8b64c" stroke-width="2"/>`
      + `<rect x="${x - 3}" y="${y + 42}" width="6" height="8" rx="2" fill="#e8b64c"/>`
    : '';
  return `${glow}<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y}" stroke="#d8c9a8" stroke-width="1.5"/>`
    + `<rect x="${x - 13}" y="${y}" width="26" height="34" rx="12" fill="${body}" stroke="#2a1f16" stroke-width="1.5"/>`
    + `<line x1="${x - 13}" y1="${y + 11}" x2="${x + 13}" y2="${y + 11}" stroke="#2a1f16" stroke-width="1" opacity="0.5"/>`
    + `<line x1="${x - 13}" y1="${y + 23}" x2="${x + 13}" y2="${y + 23}" stroke="#2a1f16" stroke-width="1" opacity="0.5"/>`
    + `<rect x="${x - 6}" y="${y - 3}" width="12" height="4" fill="#e8b64c"/>`
    + `<rect x="${x - 6}" y="${y + 34}" width="12" height="4" fill="#e8b64c"/>`
    + tasselSvg;
}

function windowShape(x, y, w, h, lit, curtains) {
  const inner = lit ? '#ffd76a' : '#2a2438';
  const curtain = curtains
    ? `<polygon points="${x},${y} ${x + 14},${y} ${x},${y + 26}" fill="#7a3b4f"/>`
      + `<polygon points="${x + w},${y} ${x + w - 14},${y} ${x + w},${y + 26}" fill="#7a3b4f"/>`
    : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2a1f16"/>`
    + `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="${inner}"/>`
    + `<line x1="${x + w / 2}" y1="${y + 4}" x2="${x + w / 2}" y2="${y + h - 4}" stroke="#2a1f16" stroke-width="2"/>`
    + `<line x1="${x + 4}" y1="${y + h / 2}" x2="${x + w - 4}" y2="${y + h / 2}" stroke="#2a1f16" stroke-width="2"/>`
    + curtain;
}

function catShape(flags) {
  if (!flags.cat) return '';
  const tail = flags.catTailUp
    ? `<path d="M 456,368 Q 470,352 464,336" fill="none" stroke="#1a1a22" stroke-width="5" stroke-linecap="round"/>`
    : `<path d="M 456,368 Q 466,378 460,388" fill="none" stroke="#1a1a22" stroke-width="5" stroke-linecap="round"/>`;
  return `<g>${tail}`
    + `<ellipse cx="440" cy="362" rx="17" ry="12" fill="#1a1a22"/>`
    + `<circle cx="430" cy="348" r="11" fill="#1a1a22"/>`
    + `<polygon points="422,341 420,330 429,337" fill="#1a1a22"/>`
    + `<polygon points="438,338 441,328 444,338" fill="#1a1a22"/>`
    + `<circle cx="426" cy="347" r="1.6" fill="#ffd76a"/><circle cx="434" cy="347" r="1.6" fill="#ffd76a"/>`
    + `</g>`;
}

function groundBand(theme, flags, variant) {
  if (theme === 'canal') {
    const boat = flags.boat
      ? `<g><path d="M 468,438 L 532,438 L 522,450 L 478,450 Z" fill="#1c2b33"/>`
        + `<line x1="500" y1="438" x2="500" y2="420" stroke="#1c2b33" stroke-width="3"/>`
        + `<polygon points="500,420 516,436 500,436" fill="#e8b64c"/></g>`
      : '';
    const ripple = flags.moonRipple
      ? `<rect x="514" y="426" width="10" height="26" fill="#ffe9a8" opacity="0.28"/>`
        + `<path d="M 500,434 q 10,5 20,0 M 502,444 q 8,5 16,0" fill="none" stroke="#9fd8d2" stroke-width="1.5" opacity="0.7"/>`
      : '';
    return `<rect x="0" y="420" width="640" height="40" fill="${THEMES.canal.ground}"/>`
      + `<rect x="0" y="420" width="640" height="4" fill="#3a3f4a"/>`
      + `<path d="M 60,436 q 14,5 28,0 M 200,446 q 14,5 28,0 M 340,432 q 14,5 28,0 M 580,440 q 12,5 24,0" fill="none" stroke="#9fd8d2" stroke-width="1.5" opacity="0.5"/>`
      + boat + ripple;
  }
  return `<rect x="0" y="420" width="640" height="40" fill="${THEMES[theme].ground}"/>`
    + `<g fill="${THEMES[theme].groundDark}">`
    + `<ellipse cx="40" cy="436" rx="26" ry="9"/><ellipse cx="110" cy="446" rx="26" ry="9"/>`
    + `<ellipse cx="180" cy="436" rx="26" ry="9"/><ellipse cx="250" cy="446" rx="26" ry="9"/>`
    + `<ellipse cx="320" cy="436" rx="26" ry="9"/><ellipse cx="390" cy="446" rx="26" ry="9"/>`
    + `<ellipse cx="460" cy="436" rx="26" ry="9"/><ellipse cx="530" cy="446" rx="26" ry="9"/>`
    + `<ellipse cx="600" cy="436" rx="26" ry="9"/></g>`;
}

/** The whole lane for one panel. `variant` ('A' or 'B') only suffixes ids. */
export function buildSceneSVG(themeName, flags, variant) {
  const t = THEMES[themeName];
  const id = (name) => `${name}-${variant}`;
  const skyId = id('sky');
  const stars = STARS.map(([x, y]) => star(x, y, 2, '#fff6d8', 0.8)).join('')
    + (flags.brightStar ? `<path d="M 470,37 L 473,43 L 479,45 L 473,47 L 470,53 L 467,47 L 461,45 L 467,43 Z" fill="#fff6d8"/>` : '');
  const moon = flags.moon
    ? `<circle cx="520" cy="70" r="32" fill="#ffe9a8"/>`
      + (flags.moonCrater ? `<circle cx="530" cy="62" r="5" fill="#e8c87a"/><circle cx="510" cy="80" r="4" fill="#e8c87a"/><circle cx="535" cy="82" r="3" fill="#e8c87a"/>` : '')
    : '';
  const wire = `<path d="M 10,70 Q 160,100 320,96 Q 480,92 630,60" fill="none" stroke="#d8c9a8" stroke-width="1.5"/>`;
  const lanterns = lantern(90, 82, '#e5534b', true, true)
    + lantern(210, 94, '#e5534b', flags.lantern2Lit, true)
    + lantern(320, 96, flags.lantern3Color === 'red' ? '#e5534b' : '#2f8f83', true, true)
    + lantern(430, 88, '#e8b64c', true, flags.lantern4Tassel)
    + lantern(540, 72, '#e5534b', true, true);
  const birds = (flags.bird
    ? `<g stroke="#20242e" stroke-width="2" fill="none" stroke-linecap="round"><path d="M 163,78 q 4,-5 7,0 q 3,-5 7,0"/><circle cx="170" cy="76" r="2.4" fill="#20242e" stroke="none"/></g>` : '')
    + `<g stroke="#20242e" stroke-width="2" fill="none" stroke-linecap="round"><path d="M 463,72 q 4,-5 7,0 q 3,-5 7,0"/><circle cx="470" cy="70" r="2.4" fill="#20242e" stroke="none"/></g>`;
  const flag = flags.flag
    ? `<line x1="122" y1="108" x2="122" y2="80" stroke="#2a1f16" stroke-width="2"/>`
      + `<polygon points="122,80 146,86 122,92" fill="#e5534b"/>`
    : '';
  const leftBuilding = `<polygon points="8,152 237,152 122,106" fill="${t.roofLeft}"/>`
    + `<rect x="20" y="150" width="205" height="270" fill="${t.buildingLeft}"/>`
    + windowShape(55, 185, 58, 66, flags.leftWindowLit, false)
    + windowShape(150, 185, 58, 66, true, true)
    + `<circle cx="122" cy="300" r="26" fill="#f4ead8" stroke="#2a1f16" stroke-width="2"/>`
    + fishShape(122, 300, flags.signFishDir, true, 1.1)
    + `<path d="M 95,460 L 95,380 Q 95,340 122,340 Q 150,340 150,380 L 150,460 Z" fill="#5d3a22"/>`
    + `<circle cx="140" cy="405" r="3" fill="#e8b64c"/>` + flag;
  const stripes = [0, 1, 2, 3, 4].map((i) => {
    const color = i === 1 ? (flags.awningStripe2 === 'red' ? '#e5534b' : '#2f8f83') : (i % 2 === 0 ? '#f4ead8' : '#e5534b');
    return `<rect x="${415 + i * 41}" y="240" width="41" height="36" fill="${color}"/>`;
  }).join('');
  const shutter = flags.rightShutterOpen
    ? `<rect x="436" y="290" width="14" height="70" fill="#5d3a22"/><rect x="510" y="290" width="14" height="70" fill="#5d3a22"/>`
    : `<rect x="450" y="290" width="60" height="70" fill="#5d3a22"/>`
      + `<line x1="450" y1="308" x2="510" y2="308" stroke="#3a2415" stroke-width="2"/>`
      + `<line x1="450" y1="326" x2="510" y2="326" stroke="#3a2415" stroke-width="2"/>`
      + `<line x1="450" y1="344" x2="510" y2="344" stroke="#3a2415" stroke-width="2"/>`;
  const curtain = flags.rightCurtainClosed
    ? `<rect x="454" y="294" width="52" height="62" fill="#7a3b4f" opacity="0.92"/>` : '';
  const rightBuilding = `<rect x="415" y="170" width="205" height="250" fill="${t.buildingRight}"/>`
    + `<rect x="415" y="170" width="205" height="14" fill="${t.roofRight}"/>`
    + stripes + `<rect x="415" y="240" width="205" height="36" fill="none" stroke="#2a1f16" stroke-width="1.5"/>`
    + windowShape(450, 290, 60, 70, true, false) + shutter + curtain
    + `<path d="M 530,460 L 530,380 Q 530,340 557,340 Q 585,340 585,380 L 585,460 Z" fill="#3a2415"/>`
    + `<circle cx="577" cy="405" r="3" fill="#e8b64c"/>`;
  const crates = `<g fill="#9a6b3f" stroke="#5d3a22" stroke-width="1.5">`
    + `<rect x="35" y="380" width="40" height="40"/><rect x="80" y="380" width="40" height="40"/>`
    + (flags.crates === 3 ? `<rect x="58" y="340" width="40" height="40"/>` : '')
    + `</g><g stroke="#5d3a22" stroke-width="1.5"><line x1="35" y1="400" x2="75" y2="400"/><line x1="80" y1="400" x2="120" y2="400"/>`
    + (flags.crates === 3 ? `<line x1="58" y1="360" x2="98" y2="360"/>` : '') + `</g>`;
  const hoops = flags.barrelHoops === 2
    ? `<line x1="250" y1="388" x2="284" y2="388" stroke="#2a1f16" stroke-width="3"/><line x1="250" y1="406" x2="284" y2="406" stroke="#2a1f16" stroke-width="3"/>`
    : `<line x1="250" y1="384" x2="284" y2="384" stroke="#2a1f16" stroke-width="3"/><line x1="250" y1="396" x2="284" y2="396" stroke="#2a1f16" stroke-width="3"/><line x1="250" y1="408" x2="284" y2="408" stroke="#2a1f16" stroke-width="3"/>`;
  const barrel = `<rect x="250" y="378" width="34" height="42" rx="4" fill="#8a5a33" stroke="#5d3a22" stroke-width="1.5"/>`
    + `<ellipse cx="267" cy="378" rx="17" ry="5" fill="#a9713f" stroke="#5d3a22" stroke-width="1.5"/>` + hoops;
  const stallFish = [285, 310, 335].map((x) => fishShape(x, 338, 'left', x === 310 ? flags.fishEye : true, 1)).join('');
  const oranges = (flags.oranges === 3
    ? `<circle cx="355" cy="322" r="7" fill="#e8821e"/><circle cx="368" cy="320" r="7" fill="#e8821e"/><circle cx="381" cy="322" r="7" fill="#e8821e"/>`
    : `<circle cx="355" cy="322" r="7" fill="#e8821e"/><circle cx="381" cy="322" r="7" fill="#e8821e"/>`)
    + `<path d="M 348,330 q 20,10 40,0 l -4,10 q -16,6 -32,0 Z" fill="#9a6b3f"/>`;
  const flower = flags.flower
    ? `<line x1="280" y1="318" x2="280" y2="302" stroke="#3d7a3a" stroke-width="2"/>`
      + `<g fill="#e86a9c"><circle cx="280" cy="296" r="5"/><circle cx="274" cy="300" r="5"/><circle cx="286" cy="300" r="5"/><circle cx="276" cy="305" r="5"/><circle cx="284" cy="305" r="5"/></g>`
      + `<circle cx="280" cy="301" r="3" fill="#ffd23e"/>`
    : '';
  const signFish = (flags.signFishCount === 3
    ? fishShape(285, 377, 'left', true, 0.55) + fishShape(305, 377, 'left', true, 0.55) + fishShape(325, 377, 'left', true, 0.55)
    : fishShape(285, 377, 'left', true, 0.55) + fishShape(305, 377, 'left', true, 0.55));
  const stall = `<rect x="248" y="235" width="8" height="120" fill="#5d3a22"/><rect x="390" y="235" width="8" height="120" fill="#5d3a22"/>`
    + `<polygon points="238,235 407,235 397,272 248,272" fill="#f4ead8" stroke="#2a1f16" stroke-width="1.5"/>`
    + `<polygon points="268,235 288,235 282,272 262,272" fill="#e5534b"/><polygon points="318,235 338,235 334,272 314,272" fill="#e5534b"/><polygon points="368,235 388,235 386,272 366,272" fill="#e5534b"/>`
    + `<rect x="255" y="350" width="140" height="55" fill="#8a5a33" stroke="#5d3a22" stroke-width="1.5"/>`
    + `<rect x="250" y="345" width="150" height="10" fill="#a9713f" stroke="#5d3a22" stroke-width="1.5"/>`
    + stallFish + oranges
    + `<path d="M 268,318 L 292,318 L 289,336 L 271,336 Z" fill="#b5673f" stroke="#5d3a22" stroke-width="1.5"/>` + flower
    + `<rect x="272" y="362" width="80" height="30" fill="#2a2438" stroke="#f4ead8" stroke-width="1.5"/>` + signFish
    + `<rect x="358" y="366" width="24" height="18" fill="#f4ead8" stroke="#2a1f16" stroke-width="1"/><text x="370" y="380" font-size="13" font-weight="bold" text-anchor="middle" fill="#20242e">${flags.priceTag}</text>`;
  const catCrate = `<rect x="415" y="372" width="50" height="48" fill="#9a6b3f" stroke="#5d3a22" stroke-width="1.5"/>`
    + `<line x1="415" y1="396" x2="465" y2="396" stroke="#5d3a22" stroke-width="1.5"/>`;

  return `<svg viewBox="0 0 640 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lantern Lane scene, panel ${variant}">`
    + `<defs><linearGradient id="${skyId}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="${t.skyTop}"/><stop offset="0.6" stop-color="${t.skyMid}"/><stop offset="1" stop-color="${t.skyBot}"/>`
    + `</linearGradient></defs>`
    + `<rect x="0" y="0" width="640" height="460" fill="url(#${skyId})"/>`
    + stars + moon
    + `<g fill="#ffffff" opacity="0.16"><ellipse cx="120" cy="90" rx="48" ry="13"/><ellipse cx="420" cy="130" rx="56" ry="15"/></g>`
    + wire + lanterns + birds
    + leftBuilding + rightBuilding + stall + crates + barrel + catCrate + catShape(flags)
    + groundBand(themeName, flags, variant)
    + `</svg>`;
}
