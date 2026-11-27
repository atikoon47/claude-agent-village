/* Theme pack: Floating Market with PNG sprites (test).
   Same scene and story as the 'market' theme; only the vendors are drawn from sprite sheets
   (assets/sprites/*.png, built by tools/build-sprites.py) instead of rectangles.
   The shirt in the sheets uses 3 magenta key shades, recoloured here to each agent's colour. */
(() => {
  const M = THEMES.market;
  const R = PX.rect;
  const KEY = ['#ff00ff', '#c000c0', '#800080'];
  // waiting raft, same box as the market theme (vendors stand on it on foot)
  const RAFT = { x: 80, y: 108, w: 68, h: 22 };
  const onRaft = (x, y) => x >= RAFT.x && x <= RAFT.x + RAFT.w && y >= RAFT.y - 2 && y <= RAFT.y + RAFT.h;

  const SHEETS = {}, tinted = new Map();
  fetch('assets/sprites/sprites.json').then(r => r.json()).then(meta => {
    for (const [name, m] of Object.entries(meta)) {
      const img = new Image();
      img.onload = () => { SHEETS[name] = { ...m, img }; tinted.clear(); };
      img.src = `assets/sprites/${name}.png`;
    }
  });

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  // a copy of the sheet with the magenta key shades swapped for this agent's colour (light, base, shadow)
  function sheetFor(name, color) {
    const s = SHEETS[name]; if (!s) return null;
    const id = name + color;
    if (tinted.has(id)) return tinted.get(id);
    const cv = document.createElement('canvas'); cv.width = s.img.width; cv.height = s.img.height;
    const g = cv.getContext('2d'); g.drawImage(s.img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data;
    const keys = KEY.map(hex), to = [PX.shade(color, .3), color, PX.shade(color, -.35)].map(hex);
    for (let i = 0; i < px.length; i += 4) {
      const k = keys.findIndex(([r, gg, b]) => px[i] === r && px[i + 1] === gg && px[i + 2] === b);
      if (k >= 0) [px[i], px[i + 1], px[i + 2]] = to[k];
    }
    g.putImageData(d, 0, 0);
    tinted.set(id, cv); return cv;
  }

  // draw frame `f` of sheet `name`, its bottom-centre at (x, y)
  function blit(c, name, color, f, x, y, flip, scale = 1) {
    const s = SHEETS[name], src = sheetFor(name, color); if (!s || !src) return false;
    const w = Math.round(s.w * scale), h = Math.round(s.h * scale);
    c.save(); c.translate(Math.round(x), Math.round(y));
    if (flip) c.scale(-1, 1);
    c.drawImage(src, (f % s.frames) * s.w, 0, s.w, s.h, -Math.round(s.ax * scale), -h, w, h);
    c.restore(); return true;
  }

  registerTheme({
    ...M,
    id: 'marketSprite',
    name: 'Floating Market (sprite test)',
    icon: '🧺',

    drawChar(c, a, frame, t) {
      const scale = a.isSub ? .75 : 1, inBoat = a.walking || !onRaft(a.x, a.y);
      let flip = a.flip;
      if (a.mode === 'error') flip = Math.sin(t * 10) > 0;
      if (!inBoat) {
        if (!blit(c, 'foot_idle', a.color, Math.floor(t * 2 + a.id) , a.x, a.y, flip, scale)) M.drawChar.call(this, c, a, frame, t);
        return;
      }
      const bob = Math.round(Math.sin(t * 2.2 + a.id) * .6), x = a.x, y = a.y + bob;
      if (a.walking) for (let i = 0; i < 3; i++) R(c, x + (flip ? 1 : -1) * (14 + i * 4), y + 2 + (i % 2), 3, 1, `rgba(220,255,245,${.55 - i * .15})`);
      PX.ellipse(c, Math.round(x), Math.round(y + 3), 13 * scale, 2, 'rgba(10,50,50,.35)');
      // the AI strip is a slow idle loop; while moving it simply runs faster (no paddle strip yet)
      const f = Math.floor(t * (a.walking ? 8 : 3) + a.id);
      if (!blit(c, 'boat_idle', a.color, f, x, y + 3, flip, scale)) M.drawChar.call(this, c, a, frame, t);
    },
    drawPortrait(c, a) { if (!blit(c, 'foot_idle', a.color, 0, a.x, 25, false)) M.drawPortrait.call(this, c, a); },
  });
})();
