/* Built-in illustrations for the preloaded dishes.
   window.dishArt(id) returns an inline SVG string, or '' for dishes without artwork. */
(() => {
  'use strict';

  // Deterministic pseudo-random numbers so each dish always draws the same way.
  const rng = seed => {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  };

  const svg = body => `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;
  const shadow = (w = 40, y = 80) => `<ellipse cx="60" cy="${y}" rx="${w}" ry="5" fill="#000" opacity=".18"/>`;
  const plate = (rx = 50, cy = 62) => `${shadow(rx - 6, cy + 14)}<ellipse cx="60" cy="${cy}" rx="${rx}" ry="${rx * .34}" fill="#efe7da"/><ellipse cx="60" cy="${cy - 1}" rx="${rx * .78}" ry="${rx * .25}" fill="#fbf6ee"/>`;
  const leaf = (x, y, r, rot, c = '#4f8a3c') => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .45}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;

  // Scatter garnish inside an ellipse.
  function scatter(rand, n, cx, cy, rx, ry, draw) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand());
      out += draw(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, i);
    }
    return out;
  }

  /* ---------- Vessel types ---------- */
  function curry(o, rand) {
    const bowl = o.bowl || '#caa27a';
    return svg(`${shadow(36, 80)}
      <path d="M16 42 Q18 80 60 82 Q102 80 104 42 Z" fill="${bowl}"/>
      <path d="M22 50 Q30 74 60 76" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="60" cy="42" rx="44" ry="12" fill="${bowl}"/>
      <ellipse cx="60" cy="42" rx="39" ry="9.5" fill="${o.base}"/>
      <ellipse cx="52" cy="39" rx="16" ry="3" fill="#fff" opacity=".18"/>
      ${o.swirl ? `<path d="M40 43 Q52 36 62 42 T84 41" fill="none" stroke="${o.swirl}" stroke-width="2.4" stroke-linecap="round"/>` : ''}
      ${o.pieces ? scatter(rand, o.pieces.n, 60, 42, 30, 6, (x, y, i) => {
        const p = o.pieces, c = Array.isArray(p.c) ? p.c[i % p.c.length] : p.c;
        if (p.shape === 'cube') return `<rect x="${x - 3.4}" y="${y - 3}" width="6.8" height="6" rx="1.4" fill="${c}"/><rect x="${x - 3.4}" y="${y - 3}" width="6.8" height="2" rx="1" fill="#fff" opacity=".4"/>`;
        if (p.shape === 'bean') return `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.1" fill="${c}" transform="rotate(${rand() * 180} ${x} ${y})"/>`;
        return `<circle cx="${x}" cy="${y}" r="${p.r || 2.6}" fill="${c}"/><circle cx="${x - .8}" cy="${y - .8}" r="${(p.r || 2.6) * .35}" fill="#fff" opacity=".35"/>`;
      }) : ''}
      ${o.leaves ? scatter(rand, o.leaves, 60, 41, 32, 6, (x, y) => leaf(x, y, 2.4, rand() * 180, o.leafColor)) : ''}
      ${o.chilli ? `<path d="M74 37 q8 -3 12 2" stroke="#c9281e" stroke-width="3" fill="none" stroke-linecap="round"/>` : ''}`);
  }

  function rice(o, rand) {
    return svg(`${plate(50, 62)}
      <path d="M26 64 Q30 30 60 26 Q90 30 94 64 Q60 72 26 64 Z" fill="${o.base}"/>
      <path d="M36 48 Q46 34 60 32" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
      ${scatter(rand, o.grains || 26, 60, 50, 28, 16, (x, y, i) => {
        const c = o.grainColors ? o.grainColors[i % o.grainColors.length] : '#fffaf0';
        return `<ellipse cx="${x}" cy="${y}" rx="2.3" ry=".9" fill="${c}" opacity=".95" transform="rotate(${rand() * 180} ${x} ${y})"/>`;
      })}
      ${o.specks ? scatter(rand, o.specks.n, 60, 50, 26, 14, (x, y) => `<circle cx="${x}" cy="${y}" r="${o.specks.r || 1}" fill="${o.specks.c}"/>`) : ''}
      ${o.nuts ? scatter(rand, o.nuts.n, 60, 48, 22, 12, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.9" fill="${o.nuts.c}"/>`) : ''}
      ${o.leaves ? scatter(rand, o.leaves, 60, 44, 20, 10, (x, y) => leaf(x, y, 3, rand() * 180, o.leafColor)) : ''}
      ${o.lemon ? `<path d="M88 66 a8 8 0 0 1 14 -4 z" fill="#f2d64b" stroke="#e0b92c" stroke-width="1"/>` : ''}
      ${o.onions ? scatter(rand, 5, 60, 34, 16, 5, (x, y) => `<path d="M${x - 3} ${y} q3 -3 6 0" stroke="#8a4a1d" stroke-width="1.6" fill="none"/>`) : ''}`);
  }

  function sabzi(o, rand) {
    return svg(`${plate(50, 62)}
      ${scatter(rand, o.n || 12, 60, 55, 30, 10, (x, y, i) => {
        const c = o.colors[i % o.colors.length];
        if (o.shape === 'okra') return `<rect x="${x - 6}" y="${y - 2}" width="12" height="4" rx="2" fill="${c}" transform="rotate(${rand() * 60 - 30} ${x} ${y})"/><circle cx="${x}" cy="${y}" r="1" fill="#dfe8b0" transform="rotate(0)"/>`;
        return i % 2
          ? `<circle cx="${x}" cy="${y}" r="4.6" fill="${c}"/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.6" fill="#fff" opacity=".35"/>`
          : `<rect x="${x - 4.5}" y="${y - 4}" width="9" height="8" rx="2.4" fill="${c}"/><rect x="${x - 4.5}" y="${y - 4}" width="9" height="2.6" rx="1.3" fill="#fff" opacity=".3"/>`;
      })}
      ${o.leaves ? scatter(rand, o.leaves, 60, 52, 26, 8, (x, y) => leaf(x, y, 2.4, rand() * 180)) : ''}`);
  }

  function flatbread(o) {
    const b = o.base || '#e6c07d';
    const bread = (y, s) => `<ellipse cx="60" cy="${y}" rx="${38 * s}" ry="${13 * s}" fill="${b}" stroke="#c9974f" stroke-width="1"/>
      <circle cx="${48}" cy="${y - 2}" r="2.4" fill="#a8672c" opacity=".55"/><circle cx="${68}" cy="${y + 3}" r="3" fill="#a8672c" opacity=".45"/><circle cx="${74}" cy="${y - 4}" r="1.8" fill="#a8672c" opacity=".5"/><circle cx="${56}" cy="${y + 4}" r="1.6" fill="#a8672c" opacity=".5"/>`;
    return svg(`${plate(52, 64)}${bread(62, 1)}${bread(56, .96)}${bread(50, .92)}
      ${o.butter ? `<rect x="54" y="41" width="12" height="8" rx="2" fill="#fbe7a1" stroke="#e8c865"/>` : ''}
      ${o.curd ? `<ellipse cx="96" cy="66" rx="11" ry="5" fill="#caa27a"/><ellipse cx="96" cy="64.5" rx="9" ry="3.4" fill="#fbf7ef"/>` : ''}`);
  }

  const dosa = () => svg(`${plate(54, 64)}
    <path d="M12 60 Q60 30 108 46 L104 64 Q60 70 12 60 Z" fill="#d8943b"/>
    <path d="M12 60 Q60 38 108 46" fill="none" stroke="#b86d22" stroke-width="1.5"/>
    <path d="M26 58 Q60 42 98 50" fill="none" stroke="#f3c677" stroke-width="2.5" opacity=".7" stroke-linecap="round"/>
    <ellipse cx="30" cy="74" rx="9" ry="4" fill="#caa27a"/><ellipse cx="30" cy="73" rx="7" ry="2.8" fill="#f2f0e4"/>
    <ellipse cx="52" cy="77" rx="9" ry="4" fill="#caa27a"/><ellipse cx="52" cy="76" rx="7" ry="2.8" fill="#d9612d"/>`);

  const idli = () => svg(`${plate(54, 64)}
    ${[[38, 58], [60, 54], [82, 58]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 4}" rx="14" ry="6" fill="#e7e1d4"/><path d="M${x - 14} ${y + 4} Q${x} ${y - 10} ${x + 14} ${y + 4} Z" fill="#fbfaf5"/><ellipse cx="${x - 3}" cy="${y - 1}" rx="5" ry="1.6" fill="#fff"/>`).join('')}
    <ellipse cx="98" cy="72" rx="12" ry="5" fill="#caa27a"/><ellipse cx="98" cy="70.5" rx="10" ry="3.6" fill="#d86c2a"/>
    <circle cx="96" cy="70" r="1" fill="#4f8a3c"/><circle cx="101" cy="71" r="1" fill="#4f8a3c"/>`);

  const dhokla = (o, rand) => svg(`${plate(52, 64)}
    ${[[34, 50], [54, 48], [74, 50], [44, 60], [64, 60], [84, 58]].map(([x, y]) => `<rect x="${x - 9}" y="${y - 7}" width="18" height="14" rx="2" fill="#f1cf4f"/><rect x="${x - 9}" y="${y - 7}" width="18" height="4" rx="2" fill="#f8e28a"/>`).join('')}
    ${scatter(rand, 14, 60, 54, 30, 9, (x, y) => `<circle cx="${x}" cy="${y}" r=".9" fill="#2d2418"/>`)}
    ${scatter(rand, 5, 60, 52, 28, 8, (x, y) => leaf(x, y, 2.4, rand() * 180))}
    <path d="M86 42 q6 -4 12 0" stroke="#3f8f33" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);

  const pav = () => svg(`${plate(54, 64)}
    <ellipse cx="34" cy="60" rx="17" ry="9" fill="#c98a45"/><path d="M17 60 Q34 42 51 60 Z" fill="#e0a35c"/><ellipse cx="30" cy="50" rx="6" ry="2" fill="#fff" opacity=".3"/>
    <ellipse cx="54" cy="64" rx="15" ry="8" fill="#c98a45"/><path d="M39 64 Q54 48 69 64 Z" fill="#e7ad64"/>
    <ellipse cx="88" cy="58" rx="20" ry="8" fill="#caa27a"/><ellipse cx="88" cy="56" rx="17" ry="6" fill="#c2451f"/>
    <rect x="84" y="51" width="7" height="4" rx="1" fill="#fbe7a1"/>
    <circle cx="80" cy="57" r="1.2" fill="#4f8a3c"/><circle cx="95" cy="58" r="1.2" fill="#4f8a3c"/><path d="M78 60 q3 -2 6 0" stroke="#f4e6ef" stroke-width="1.4" fill="none"/>`);

  function glass(o, rand) {
    const top = o.level || 26;
    return svg(`${shadow(20, 84)}
      <path d="M40 12 L80 12 L74 82 L46 82 Z" fill="#ffffff" fill-opacity=".14" stroke="#ffffff" stroke-opacity=".45" stroke-width="1.5"/>
      <path d="M${40 + (top - 12) * .086} ${top} L${80 - (top - 12) * .086} ${top} L74 81 L46 81 Z" fill="${o.base}"/>
      ${o.layer ? `<path d="M${40 + (top - 12) * .086} ${top} L${80 - (top - 12) * .086} ${top} L${79.4 - (top - 12) * .086} ${top + 7} L${40.6 + (top - 12) * .086} ${top + 7} Z" fill="${o.layer}"/>` : ''}
      <path d="M48 20 L51 78" stroke="#fff" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>
      ${o.seeds ? scatter(rand, 16, 60, 58, 11, 18, (x, y) => `<circle cx="${x}" cy="${y}" r="1" fill="#2a2320"/>`) : ''}
      ${o.bits ? scatter(rand, o.bits.n, 60, top + 3, 13, 2, (x, y) => `<circle cx="${x}" cy="${y}" r="${o.bits.r || 1.3}" fill="${o.bits.c}"/>`) : ''}
      ${o.straw ? `<path d="M68 ${top + 16} L84 4" stroke="${o.straw}" stroke-width="3.2" stroke-linecap="round"/>` : ''}
      ${o.lemon ? `<circle cx="80" cy="15" r="9" fill="#f2d64b" stroke="#e0b92c" stroke-width="1.4"/><circle cx="80" cy="15" r="6" fill="#f8e98a"/><path d="M80 9 V21 M74 15 H86" stroke="#e0b92c" stroke-width=".8"/>` : ''}
      ${o.mint ? leaf(50, top - 2, 5, -30, '#3f8f33') + leaf(58, top - 4, 4.6, 20, '#56a646') : ''}
      ${o.ice ? `<rect x="52" y="${top + 6}" width="7" height="7" rx="1.5" fill="#fff" opacity=".35"/><rect x="61" y="${top + 11}" width="7" height="7" rx="1.5" fill="#fff" opacity=".3"/>` : ''}`);
  }

  const cup = () => svg(`<ellipse cx="60" cy="76" rx="36" ry="9" fill="#e9e0d1"/>${shadow(30, 80)}<ellipse cx="60" cy="74" rx="30" ry="6.5" fill="#f7f1e6"/>
    <path d="M36 38 L40 70 Q60 78 80 70 L84 38 Z" fill="#f4ede2"/>
    <path d="M84 44 q14 2 10 14 q-3 7 -12 6" fill="none" stroke="#f4ede2" stroke-width="4"/>
    <ellipse cx="60" cy="38" rx="24" ry="6" fill="#f4ede2"/><ellipse cx="60" cy="38.6" rx="21" ry="4.6" fill="#b07a4a"/>
    <ellipse cx="55" cy="37.6" rx="7" ry="1.4" fill="#d9a877" opacity=".7"/>
    <path d="M52 30 q-4 -6 0 -12 q4 -6 0 -12 M62 30 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`);

  const tumbler = () => svg(`${shadow(32, 82)}
    <path d="M26 56 Q28 80 60 80 Q92 80 94 56 Z" fill="#a9b0b5"/><ellipse cx="60" cy="56" rx="34" ry="8" fill="#c8ced2"/><ellipse cx="60" cy="56" rx="30" ry="6" fill="#8a5a3a"/>
    <path d="M44 20 L47 60 Q60 64 73 60 L76 20 Z" fill="#bfc6cb"/><path d="M50 22 L52 58" stroke="#fff" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="60" cy="20" rx="16" ry="4.4" fill="#d7dcdf"/><ellipse cx="60" cy="20" rx="13.5" ry="3.2" fill="#e8d2b4"/>
    <path d="M56 12 q-3 -4 0 -8 M64 12 q-3 -4 0 -8" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`);

  function pudding(o, rand) {
    const bowl = o.bowl || '#caa27a';
    return svg(`${shadow(36, 80)}
      <path d="M16 42 Q18 80 60 82 Q102 80 104 42 Z" fill="${bowl}"/>
      <ellipse cx="60" cy="42" rx="44" ry="12" fill="${bowl}"/>
      <ellipse cx="60" cy="42" rx="39" ry="9.5" fill="${o.base}"/>
      ${o.texture ? scatter(rand, 30, 60, 42, 32, 7, (x, y) => `<circle cx="${x}" cy="${y}" r=".9" fill="${o.texture}" opacity=".7"/>`) : ''}
      ${o.strands ? scatter(rand, 9, 60, 42, 28, 6, (x, y) => `<path d="M${x - 5} ${y} q5 ${rand() * 4 - 2} 10 0" stroke="${o.strands}" stroke-width="1.2" fill="none"/>`) : ''}
      ${o.discs ? [[44, 42], [60, 39], [76, 42]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="4.2" fill="#fbf6e9"/><ellipse cx="${x - 2}" cy="${y - 1}" rx="4" ry="1.3" fill="#fff"/>`).join('') : ''}
      ${o.balls ? [[44, 41], [60, 38], [76, 41], [52, 45], [68, 45]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#6e2c14"/><circle cx="${x}" cy="${y}" r="6.2" fill="#8a3a1a"/><ellipse cx="${x - 2.4}" cy="${y - 2.6}" rx="2.4" ry="1.4" fill="#fff" opacity=".35"/>`).join('') : ''}
      ${scatter(rand, o.nuts ?? 6, 60, 41, 26, 5, (x, y, i) => i % 2
        ? `<path d="M${x - 2.5} ${y + 1} q2.5 -4 5 0 q-2.5 1.4 -5 0" fill="#f3e4c0" stroke="#d8c08c" stroke-width=".5"/>`
        : `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="1.1" fill="${o.nutColor || '#8fbf4a'}"/>`)}
      ${o.saffron ? scatter(rand, 6, 60, 41, 24, 5, (x, y) => `<path d="M${x} ${y} l2 -1.5" stroke="#d9531e" stroke-width="1" stroke-linecap="round"/>`) : ''}`);
  }

  const ladoo = (o, rand) => svg(`${plate(50, 66)}
    ${[[40, 62], [60, 64], [80, 62], [50, 50], [70, 50], [60, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10.5" fill="#e3a93c"/><circle cx="${x}" cy="${y}" r="9.5" fill="#efbb4f"/>
      ${scatter(rand, 5, x, y, 6, 6, (a, b) => `<circle cx="${a}" cy="${b}" r=".8" fill="#c88a22"/>`)}<ellipse cx="${x - 3}" cy="${y - 4}" rx="3" ry="1.6" fill="#fff" opacity=".35"/>`).join('')}
    <ellipse cx="60" cy="31" rx="2.6" ry="1.6" fill="#f3e4c0"/>`);

  const kulfi = () => svg(`${plate(46, 70)}
    <rect x="57" y="56" width="6" height="22" rx="2" fill="#d9b98a"/>
    <path d="M42 22 Q42 10 60 10 Q78 10 78 22 L75 58 Q60 64 45 58 Z" fill="#f4e3b8"/>
    <path d="M48 18 L50 54" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    <path d="M42 22 Q60 30 78 22 L77 30 Q60 38 43 30 Z" fill="#9cc25a" opacity=".85"/>
    <circle cx="52" cy="26" r="1.4" fill="#5f8f2b"/><circle cx="66" cy="28" r="1.4" fill="#5f8f2b"/><circle cx="60" cy="31" r="1.2" fill="#d9531e"/>`);

  /* ---------- Dish → artwork ---------- */
  const SPECS = {
    dal: ['curry', { base: '#e6ad2e', leaves: 7, chilli: true, swirl: '#f7d27a' }],
    rice: ['rice', { base: '#f6efdf', specks: { n: 14, c: '#6b4a24', r: 1 }, leaves: 2 }],
    aloo: ['sabzi', { colors: ['#e9b949', '#f3e7c6'], n: 14, leaves: 5 }],
    roti: ['flatbread', {}],
    dosa: ['dosa', {}],
    khichdi: ['rice', { base: '#e8c35a', grainColors: ['#f7e6a6', '#f0d27a'], specks: { n: 8, c: '#e27b2e', r: 1.4 } }],
    'paneer-butter': ['curry', { base: '#d8582a', swirl: '#f8e7d0', pieces: { n: 7, c: '#fbf3df', shape: 'cube' }, leaves: 3 }],
    'palak-paneer': ['curry', { base: '#3d7a35', swirl: '#e9f0d8', pieces: { n: 7, c: '#fbf3df', shape: 'cube' } }],
    chole: ['curry', { base: '#7a391b', pieces: { n: 14, c: '#c99a58', r: 2.4 }, leaves: 4 }],
    rajma: ['curry', { base: '#86301d', pieces: { n: 14, c: ['#5e1a12', '#74241a'], shape: 'bean' }, leaves: 3 }],
    'aloo-paratha': ['flatbread', { base: '#e0ae5e', butter: true, curd: true }],
    poha: ['rice', { base: '#f0cf55', grainColors: ['#f8e27f', '#fff1b0'], nuts: { n: 7, c: '#9b5a2a' }, leaves: 3, lemon: true }],
    upma: ['rice', { base: '#efe1bd', grainColors: ['#f8eed2'], nuts: { n: 5, c: '#f2dfb2' }, leaves: 4, specks: { n: 8, c: '#2d2418' } }],
    idli: ['idli', {}],
    biryani: ['rice', { base: '#f3e2bf', grainColors: ['#fffaf0', '#f0a23a', '#e8742a', '#fff3d6'], grains: 36, leaves: 3, leafColor: '#3f8f33', onions: true }],
    'pav-bhaji': ['pav', {}],
    bhindi: ['sabzi', { colors: ['#4d8a33', '#3f7a2a'], n: 12, shape: 'okra' }],
    'curd-rice': ['rice', { base: '#fbf8f0', specks: { n: 12, c: '#2d2418', r: 1 }, leaves: 3, leafColor: '#3f8f33' }],
    dhokla: ['dhokla', {}],
    kheer: ['pudding', { base: '#f4e6c6', texture: '#fffaf0', nuts: 7, saffron: true }],
    chai: ['cup', {}],
    'mango-lassi': ['glass', { base: '#f2a531', layer: '#fbe7b5', level: 22, bits: { n: 6, c: '#8fbf4a' }, straw: '#e85a4f' }],
    chaas: ['glass', { base: '#eef0e3', level: 24, mint: true, bits: { n: 8, c: '#5a8f3a', r: 1 } }],
    'nimbu-pani': ['glass', { base: '#f4efb6', level: 22, lemon: true, mint: true, ice: true }],
    'filter-coffee': ['tumbler', {}],
    'badam-milk': ['glass', { base: '#f1d99a', level: 24, bits: { n: 7, c: '#d9a066', r: 1.5 } }],
    'aam-panna': ['glass', { base: '#c7d65c', level: 22, mint: true, ice: true }],
    thandai: ['glass', { base: '#f3dfc0', level: 24, bits: { n: 8, c: '#d9531e', r: 1 }, straw: '#d9a066' }],
    'rose-sharbat': ['glass', { base: '#e5507c', level: 22, seeds: true, lemon: true, ice: true }],
    'gulab-jamun': ['pudding', { base: '#e0a646', balls: true, nuts: 0 }],
    'gajar-halwa': ['pudding', { base: '#d9541f', texture: '#f07b3d', nuts: 7, nutColor: '#8fbf4a' }],
    rasmalai: ['pudding', { base: '#f3dc9e', discs: true, nuts: 6, saffron: true }],
    'sooji-halwa': ['pudding', { base: '#e3b457', texture: '#f3cf7d', nuts: 7 }],
    kulfi: ['kulfi', {}],
    'besan-ladoo': ['ladoo', {}],
    shrikhand: ['pudding', { base: '#f5d88a', nuts: 6, saffron: true }],
    payasam: ['pudding', { base: '#f4e8cc', strands: '#e8cc8c', nuts: 7 }]
  };

  const DRAW = { curry, rice, sabzi, flatbread, dosa, idli, dhokla, pav, glass, cup, tumbler, pudding, ladoo, kulfi };
  const cache = {};

  window.dishArt = id => {
    if (!SPECS[id]) return '';
    if (!cache[id]) {
      const [type, opts] = SPECS[id];
      cache[id] = DRAW[type](opts, rng(id));
    }
    return cache[id];
  };
})();
