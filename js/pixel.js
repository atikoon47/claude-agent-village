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

  // lighten (+) / darken (-) a #rrggbb colour
  shade(hex, k) {
    const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
  },

  // soft pixel glow: stepped rings added with 'lighter' so lights feel warm without blurring the art
  glow(c, x, y, r, rgb, a = .18, squash = .55) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 3; i >= 1; i--) PX.ellipse(c, Math.round(x), Math.round(y), Math.round(r * i / 3), Math.max(1, Math.round(r * squash * i / 3)), `rgba(${rgb},${a / 2})`);
    c.restore();
  },

  /* Chibi person, 10 wide x 16 tall (+hat), feet at (x,y). Big outlined head, eyes, blush, shading.
     o: {top, pants, shoes, hair, skin, hat:'elf'|'santa'|'toque'|'chefLead'|'none', hatCol, apron, belt, beard,
         ears, collar, frame(0-2), work, t, flip, blink} */
  HEAD_TOP: 15, // rows from feet to top of the head (before any hat)
  person(c, x, y, o) {
    x = Math.round(x); y = Math.round(y);
    const fl = o.flip, T = y - 16;
    const R = (dx, dy, w, h, col) => { if (!col) return; c.fillStyle = col; c.fillRect(fl ? x + 5 - dx - w : x - 5 + dx, T + dy, w, h); };
    const ink = '#24160f', skin = o.skin || '#f7cfa8', skinD = PX.shade(skin, -.14), f = o.frame || 0, t = o.t || 0;
    const top = o.top || '#c8372d', topD = PX.shade(top, -.25), topL = PX.shade(top, .22);
    const pants = o.pants || '#2b4f2f', shoes = o.shoes || PX.shade(pants, -.35), hair = o.hair || '#6b3e26';
    const up = o.work && Math.floor(t * 6) % 2 === 0;
    const bob = f ? 0 : (Math.sin(t * 2.2 + x * .7) > .6 ? 1 : 0);   // tiny idle breathing
    // ground shadow
    R(1, 16, 8, 1, 'rgba(20,10,40,.32)'); R(2, 17, 6, 1, 'rgba(20,10,40,.15)');
    // legs + shoes (walk cycle lifts one foot)
    const lL = f === 1 ? 1 : 0, lR = f === 2 ? 1 : 0;
    R(1, 12, 4, 4 - lL, ink); R(5, 12, 4, 4 - lR, ink);
    R(2, 12, 2, 2 - lL, pants); R(6, 12, 2, 2 - lR, pants);
    R(2, 14 - lL, 2, 1, shoes); R(6, 14 - lR, 2, 1, shoes);
    // body outline + fill
    const b = bob;
    R(1, 8 + b, 8, 6 - b, ink);
    R(2, 9 + b, 6, 4 - b, top); R(2, 9 + b, 1, 4 - b, topL); R(7, 9 + b, 1, 4 - b, topD);
    if (o.collar) R(2, 9 + b, 6, 1, o.collar);
    if (o.apron) { R(3, 10 + b, 4, 3 - b, o.apron); R(3, 10 + b, 4, 1, PX.shade(o.apron, .25)); }
    if (o.belt) { R(2, 11, 6, 1, ink); R(4, 11, 2, 1, '#f2c14e'); }
    // arms (raised while working)
    if (up) { R(0, 5 + b, 2, 5, ink); R(0, 6 + b, 1, 3, top); R(0, 5 + b, 1, 1, skin); }
    else { R(0, 9 + b, 2, 4, ink); R(1, 9 + b, 1, 3, topL); R(1, 12, 1, 1, skin); }
    R(8, 9 + b, 2, 4, ink); R(8, 9 + b, 1, 3, topD); R(8, 12, 1, 1, skinD);
    // head: rounded outline, skin, hair
    const h = b;
    R(1, 0 + h, 8, 10, ink); R(0, 1 + h, 10, 8, ink);
    R(1, 1 + h, 8, 8, skin); R(8, 3 + h, 1, 6, skinD); R(2, 8 + h, 6, 1, skinD);
    R(1, 1 + h, 8, 2, hair); R(1, 3 + h, 1, 2, hair); R(8, 3 + h, 1, 2, hair); R(3, 3 + h, 2, 1, hair);
    if (o.ears) { R(-1, 4 + h, 2, 2, ink); R(-1, 3 + h, 1, 1, ink); R(0, 4 + h, 1, 2, skin); R(9, 4 + h, 2, 2, ink); R(10, 3 + h, 1, 1, ink); R(9, 4 + h, 1, 2, skinD); }
    // face
    const blink = (Math.floor(t * 10 + x) % 37) === 0;
    if (blink) { R(2, 6 + h, 2, 1, ink); R(6, 6 + h, 2, 1, ink); }
    else { R(2, 5 + h, 2, 2, ink); R(6, 5 + h, 2, 2, ink); R(2, 5 + h, 1, 1, '#fff'); R(6, 5 + h, 1, 1, '#fff'); }
    R(1, 7 + h, 1, 1, '#f59a8b'); R(8, 7 + h, 1, 1, '#f59a8b');
    R(4, 7 + h, 2, 1, o.work ? '#a8423a' : PX.shade(skin, -.3));
    if (o.beard) {
      R(1, 6 + h, 8, 5, ink); R(2, 6 + h, 6, 5, '#f4f4f8'); R(2, 10 + h, 6, 1, '#d5d8e6'); R(3, 11 + h, 4, 1, ink);
      R(1, 7 + h, 1, 1, '#f59a8b'); R(3, 6 + h, 4, 1, '#ffffff'); R(4, 7 + h, 2, 1, '#e07a6a');
      R(2, 5 + h, 2, 1, ink); R(6, 5 + h, 2, 1, ink);
    }
    // hats
    const hc = o.hatCol || '#c8372d', hcD = PX.shade(hc, -.25);
    if (o.hat === 'elf') {
      R(1, -2 + h, 7, 4, ink); R(3, -4 + h, 6, 3, ink); R(7, -5 + h, 4, 3, ink);
      R(2, -1 + h, 6, 2, hc); R(4, -3 + h, 4, 2, hc); R(7, -4 + h, 2, 1, hc); R(7, -1 + h, 1, 2, hcD);
      R(9, -4 + h, 1, 1, '#ffd54a'); R(9, -3 + h, 1, 1, '#e7a92e');
      R(0, 1 + h, 10, 2, ink); R(1, 1 + h, 8, 1, '#ffffff'); R(1, 2 + h, 8, 1, '#dfe6f2');
    } else if (o.hat === 'santa') {
      R(1, -2 + h, 8, 4, ink); R(5, -4 + h, 5, 3, ink);
      R(2, -1 + h, 6, 2, hc); R(6, -3 + h, 3, 2, hc); R(7, -1 + h, 1, 2, hcD);
      R(8, -3 + h, 2, 2, '#fff');
      R(0, 1 + h, 10, 2, ink); R(1, 1 + h, 8, 1, '#ffffff'); R(1, 2 + h, 8, 1, '#dfe6f2');
    } else if (o.hat === 'toque' || o.hat === 'chefLead') {
      const tall = o.hat === 'chefLead' ? 3 : 0;
      R(0, -3 - tall + h, 10, 5 + tall, ink); R(1, -4 - tall + h, 8, 1, ink);
      R(1, -3 - tall + h, 8, 4 + tall, '#ffffff'); R(1, -4 - tall + h, 8, 1, ink); R(2, -4 - tall + h, 6, 1, '#ffffff');
      R(3, -2 - tall + h, 1, 3 + tall, '#e3e6ee'); R(6, -2 - tall + h, 1, 3 + tall, '#e3e6ee');
      R(1, 1 + h, 8, 2, '#e9ecf3'); R(1, 2 + h, 8, 1, '#c9cede');
    }
  },
};
