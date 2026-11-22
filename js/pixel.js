/* Shared pixel-art helpers + theme registry.
   Every theme draws into a 400x240 world that is upscaled with crisp pixels. */
window.THEMES = {};
window.THEME_ORDER = [];
function registerTheme(t) { THEMES[t.id] = t; THEME_ORDER.push(t.id); }

const PX = {
  W: 400, H: 240,

  rect(c, x, y, w, h, col) {
    if (!col) return;
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  },

  // deterministic random so static maps look the same every load
  rng(seed) {
    let s = (seed >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  },

  ellipse(c, cx, cy, rx, ry, col) {
    for (let y = -ry; y <= ry; y++) {
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      PX.rect(c, cx - hw, cy + y, hw * 2, 1, col);
    }
  },

  // thick line made of squares (paths, roads)
  path(c, x1, y1, x2, y2, w, col) {
    const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
    for (let i = 0; i <= n; i++) {
      const t = n ? i / n : 0;
      PX.rect(c, x1 + (x2 - x1) * t - w / 2, y1 + (y2 - y1) * t - w / 2, w, w, col);
    }
  },

  // speckle texture inside a rect
  speckle(c, x, y, w, h, cols, density, rnd) {
    const n = Math.round(w * h * density);
    for (let i = 0; i < n; i++) PX.rect(c, x + rnd() * w, y + rnd() * h, 1 + (rnd() < .4), 1, cols[(rnd() * cols.length) | 0]);
  },

  pine(c, x, y, h, o = {}) {
    const dark = o.dark || '#1c5236', mid = o.mid || '#2a7448', snow = o.snow !== false;
    PX.ellipse(c, x, y, Math.round(h * .32), 2, 'rgba(20,30,60,.18)');
    PX.rect(c, x - 1, y - 3, 2, 3, '#5a3a22');
    const top = y - 3 - h, tier = Math.ceil(h / 3);
    for (let i = 0; i < h; i++) {
      const hw = Math.max(1, Math.round((i % tier) * 0.55 + (i / h) * h * 0.26));
      PX.rect(c, x - hw, top + i, hw * 2, 1, i % 2 ? dark : mid);
      if (snow && i % tier === 0 && i > 0) PX.rect(c, x - hw + 1, top + i, hw * 2 - 2, 1, '#eef4ff');
    }
    if (snow) PX.rect(c, x - 1, top, 2, 1, '#eef4ff');
  },

  /* 8x13 little person, feet at (x,y).
     o: {top, pants, hat:'elf'|'santa'|'toque'|'chefLead', hatCol, apron, belt, beard, ears, frame(0-2), work, t, flip} */
  person(c, x, y, o) {
    x = Math.round(x); y = Math.round(y);
    const fl = o.flip;
    const R = (dx, dy, w, h, col) => { if (!col) return; c.fillStyle = col; c.fillRect(fl ? x + 4 - dx - w : x - 4 + dx, y - 13 + dy, w, h); };
    const ink = '#2b1d14', skin = o.skin || '#f6c9a0', f = o.frame || 0;
    R(1, 13, 6, 1, 'rgba(0,0,0,.28)');
    R(2, 10, 2, f === 1 ? 2 : 3, o.pants || '#2b4f2f');
    R(4, 10, 2, f === 2 ? 2 : 3, o.pants || '#2b4f2f');
    R(1, 7, 6, 4, o.top);
    if (o.apron) R(2, 8, 4, 3, o.apron);
    if (o.belt) { R(1, 9, 6, 1, ink); R(3, 9, 2, 1, '#f2c14e'); }
    const up = o.work && Math.floor((o.t || 0) * 6) % 2 === 0;
    R(0, up ? 5 : 7, 1, 3, o.top); R(0, up ? 4 : 10, 1, 1, skin);
    R(7, 7, 1, 3, o.top); R(7, 10, 1, 1, skin);
    R(1, 4, 6, 3, skin);
    R(2, 5, 1, 1, ink); R(5, 5, 1, 1, ink);
    R(1, 6, 1, 1, '#f2a08f'); R(6, 6, 1, 1, '#f2a08f');
    if (o.beard) { R(1, 6, 6, 3, '#fff'); R(2, 9, 4, 1, '#fff'); R(3, 6, 2, 1, '#e88'); }
    if (o.ears) { R(0, 4, 1, 2, skin); R(7, 4, 1, 2, skin); }
    if (o.collar) R(1, 7, 6, 1, o.collar);
    if (o.hat === 'elf') { R(1, 3, 6, 1, '#fff'); R(1, 2, 6, 1, o.hatCol); R(2, 1, 5, 1, o.hatCol); R(4, 0, 3, 1, o.hatCol); R(7, 0, 2, 2, '#fff'); }
    else if (o.hat === 'santa') { R(1, 3, 6, 1, '#fff'); R(1, 1, 6, 2, '#c8372d'); R(5, 0, 3, 1, '#c8372d'); R(8, 0, 2, 2, '#fff'); }
    else if (o.hat === 'toque') { R(1, 3, 6, 1, '#d9d9d9'); R(1, 1, 6, 2, '#fff'); R(0, -1, 8, 2, '#fff'); }
    else if (o.hat === 'chefLead') { R(1, 3, 6, 1, '#d9d9d9'); R(1, 0, 6, 3, '#fff'); R(0, -3, 8, 3, '#fff'); R(1, -4, 6, 1, '#fff'); }
  },
};
