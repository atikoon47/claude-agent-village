/* HD style of the Floating Market theme (Pixel/HD switch): same scene and story, but the vendors and ป้าแดง are
   AI-made sprites (assets/sprites/market/*.png, built by tools/build-sprites.py) drawn on the high-res layer.
   The shirt in the sheets uses 3 magenta key shades, recoloured here to each agent's colour. */
(() => {
  const M = THEMES.market;
  const R = PX.rect;
  const KEY = ['#ff00ff', '#c000c0', '#800080'];
  // waiting raft, same box as the market theme (vendors stand on it on foot)
  const RAFT = { x: 80, y: 108, w: 68, h: 22 };
  const onRaft = (x, y) => x >= RAFT.x && x <= RAFT.x + RAFT.w && y >= RAFT.y - 2 && y <= RAFT.y + RAFT.h;

  const SHEETS = {}, tinted = new Map();
  const DIR = 'assets/sprites/market/';
  fetch(DIR + 'sprites.json').then(r => r.json()).then(meta => {
    for (const [name, m] of Object.entries(meta)) {
      const img = new Image();
      img.onload = () => { SHEETS[name] = { ...m, img }; tinted.clear(); };
      img.src = `${DIR}${name}.png`;
    }
  });

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  // a copy of the sheet with the magenta key shades swapped for this agent's colour (light, base, shadow)
  function sheetFor(name, color) {
    const s = SHEETS[name]; if (!s) return null;
    if (!color) return s.img;              // characters that keep their own colours (ป้าแดง)
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

  // draw frame `f` of sheet `name`, its bottom-centre at world (x, y). With hd, the 4x sheet goes on the
  // high-res layer (c.hd) at the same world size, so the sprite keeps 4x the detail.
  // clipY: nothing below this world y is drawn (a stall counter hides the legs)
  function blit(c, name, color, f, x, y, flip, scale = 1, hd = false, clipY = null) {
    if (hd && c.hd && SHEETS[name + '@4x']) { c = c.hd; name += '@4x'; }
    const s = SHEETS[name], src = sheetFor(name, color); if (!s || !src) return false;
    if (clipY != null) { c.save(); c.beginPath(); c.rect(x - 60, clipY - 120, 120, 120); c.clip(); }
    const d = s.density || 1, w = s.w * scale / d, h = s.h * scale / d;
    c.save(); c.translate(Math.round(x), Math.round(y));
    if (flip) c.scale(-1, 1);
    c.drawImage(src, (f % s.frames) * s.w, 0, s.w, s.h, -s.ax * scale / d, -(s.ay + 1) * scale / d, w, h);
    c.restore(); if (clipY != null) c.restore(); return true;
  }

  // crew slots (js/engine.js CREW: Bobby, Lily, Max, Momo, Pip, Juni, Cocoa) drawn as the vendor man in the
  // mixed theme. Sub-agents and numbered names ("Max น้อย", "Bobby 2") share their slot, so they match.
  const MEN = new Set([0, 2, 4]);
  // card labels per crew slot: the market theme's "แม่ค้า..." with พ่อค้า where the character is a man
  const crewFor = man => M.crew.map((r, i) => man(i) ? r.replace('แม่ค้า', 'พ่อค้า') : r);

  // prefix picks the character's sheets (''=vendor woman, 'merchant_'=vendor man, 'mix'=either, per agent)
  function spriteTheme(id, name, icon, hd, prefix = '') {
    const man = i => prefix === 'mix' ? MEN.has(i) : prefix === 'merchant_';
    const who = a => man(a.crewIdx) ? 'merchant_' : '';
    return {
    ...M,
    id,
    name,
    icon,
    crew: crewFor(man),

    drawChar(c, a, frame, t) {
      const p = who(a), scale = a.isSub ? .75 : 1, inBoat = a.walking || !onRaft(a.x, a.y);
      let flip = a.flip;
      if (a.mode === 'error') flip = Math.sin(t * 10) > 0;
      if (!inBoat) {
        if (!blit(c, p + 'foot_idle', a.color, Math.floor(t * 2 + a.id), a.x, a.y, flip, scale, hd)) M.drawChar.call(this, c, a, frame, t);
        return;
      }
      const bob = Math.round(Math.sin(t * 2.2 + a.id) * .6), x = a.x, y = a.y + bob;
      if (a.walking) for (let i = 0; i < 3; i++) R(c, x + (flip ? 1 : -1) * (14 + i * 4), y + 2 + (i % 2), 3, 1, `rgba(220,255,245,${.55 - i * .15})`);
      PX.ellipse(c, Math.round(x), Math.round(y + 3), 13 * scale, 2, 'rgba(10,50,50,.35)');
      // moving: the paddle strip if this character has one, else the idle loop run faster.
      // queued at ป้าแดง's desk for approval: waving an order slip
      const asking = !a.walking && a.cur && a.cur.type === 'perm' && !a.approved && SHEETS[p + 'boat_ask'];
      if (asking) flip = a.x > this.places.permission.x;   // turn to face ป้าแดง's desk with the slip
      // busy at a stop (taking a job, running a tool, wrapping up): packing fruit
      const working = !a.walking && !asking && (a.mode === 'work' || a.mode === 'live') && SHEETS[p + 'boat_work'];
      const sheet = asking ? p + 'boat_ask' : working ? p + 'boat_work'
        : a.walking && SHEETS[p + 'boat_paddle'] ? p + 'boat_paddle' : p + 'boat_idle';
      const f = Math.floor(t * (a.walking ? 8 : asking || working ? 5 : 3) + a.id);
      if (!blit(c, sheet, a.color, f, x, y + 3, flip, scale, hd)) M.drawChar.call(this, c, a, frame, t);
    },
    // ป้าแดง: at her desk in the permission centre, or paddling out to check on someone
    drawLead(c, t, busy, L) {
      const x = 200, y = 64;
      if (!SHEETS.lead_desk_idle) return M.drawLead.call(this, c, t, busy, L);
      R(c, x - 14, y - 3, 28, 7, '#6e4224'); R(c, x - 14, y - 4, 28, 2, '#a8703f');   // desk
      if (!L.atDesk) return;
      const [sheet, f] = L.stamp > 0 ? ['lead_desk_stamp', Math.min(3, Math.floor((.7 - L.stamp) / .7 * 4))]
        : L.wave > 0 ? ['lead_desk_wave', Math.floor(t * 5)]
        : ['lead_desk_idle', Math.floor(t * (busy ? 3 : 1.5))];
      blit(c, sheet, null, f, x, y - 3, false, 1, hd);
    },
    drawLeadChar(c, L, t) {
      if (!SHEETS.lead_boat_paddle) return M.drawLeadChar.call(this, c, L, t);
      const y = L.y + Math.round(Math.sin(t * 2.2) * .6);
      PX.ellipse(c, Math.round(L.x), Math.round(y + 3), 14, 2, 'rgba(10,50,50,.35)');
      blit(c, 'lead_boat_paddle', null, L.walking ? Math.floor(t * 8) : 0, L.x, y + 3, L.flip, 1, hd);
    },
    // vendors behind the bank stalls: woman and man in turn, standing, cut off at the counter top
    drawStallVendor(c, x, y, col, i, t) {
      const who = i % 2 ? 'merchant_' : '', sheet = who + 'foot_idle';
      const counter = (this.stallFronts || []).find(([sx, , w]) => x >= sx && x <= sx + w);
      // the sprites are ~6 px taller than the drawn vendors: sink them so the head sits where theirs did
      if (!blit(c, sheet, col, Math.floor(t * 1.5 + i), x, y + 6, i === 2, 1, hd, counter ? counter[1] : null))
        M.drawStallVendor ? M.drawStallVendor.call(this, c, x, y, col, i, t) : null;
    },
    drawLeadPortrait(c, x, y) { if (!blit(c, 'lead_portrait', null, 0, 8, 25, false)) M.drawLeadPortrait.call(this, c, x, y); },
    drawPortrait(c, a) { if (!blit(c, who(a) + 'foot_idle', a.color, 0, a.x, 25, false)) M.drawPortrait.call(this, c, a); },
  }
  }
  // vendor men and women by crew slot, sprites on the high-res layer
  registerStyle('market', 'hd', spriteTheme('market', M.name, M.icon, true, 'mix'));
})();
