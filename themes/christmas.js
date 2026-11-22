/* Theme pack: Christmas Village
   A theme only describes WHERE each agent activity happens and HOW it looks.
   The engine never knows about elves, sleighs or Santa. */
(() => {
  const R = PX.rect;
  const LIGHT_COLS = ['#ff5a4e', '#ffd54a', '#6fd3ff', '#9fe0a8', '#ff9ad5'];

  function building(c, x, y, w, h, o, th, rnd) {
    const roofH = Math.round(h * .52), wallY = y + roofH, wallH = h - roofH;
    R(c, x + 3, y + h, w - 2, 3, 'rgba(40,50,90,.22)');
    // wall
    R(c, x, wallY, w, wallH, o.wall);
    for (let i = x + 3; i < x + w; i += 4) R(c, i, wallY, 1, wallH, o.wallDark);
    // windows
    const wins = w > 80 ? [6, 22, w - 32, w - 16] : [6, w - 16];
    for (const wx of wins) {
      R(c, x + wx - 1, wallY + 3, 12, 9, '#3b2212');
      R(c, x + wx, wallY + 4, 10, 7, '#ffd36b');
      R(c, x + wx + 4, wallY + 4, 1, 7, '#d99a3a'); R(c, x + wx, wallY + 7, 10, 1, '#d99a3a');
      R(c, x + wx - 1, wallY + 12, 12, 1, '#f4f8ff');
      th.glows.push({ x: x + wx + 5, y: wallY + 8, r: 9 });
    }
    // door
    const dh = Math.min(13, wallH - 2), dx = x + Math.round(w / 2) - 5;
    R(c, dx - 1, y + h - dh - 1, 12, dh + 1, '#3b2212');
    R(c, dx, y + h - dh, 10, dh, o.door || '#7a2a22');
    R(c, dx + 5, y + h - dh, 1, dh, '#00000033');
    R(c, dx + 7, y + h - 6, 1, 1, '#ffd54a');
    if (o.awning) for (let i = 0; i < w + 4; i++) R(c, x - 2 + i, wallY, 1, 4, Math.floor(i / 3) % 2 ? '#fff' : '#d8443a');
    // roof
    R(c, x - 3, y, w + 6, roofH, o.roof);
    for (let ry = y + roofH - 4; ry < y + roofH; ry += 2) R(c, x - 3, ry, w + 6, 1, o.roofDark);
    R(c, x - 3, y + roofH - 1, w + 6, 1, '#2b1a10');
    // snow blanket
    R(c, x - 3, y, w + 6, roofH - 5, '#e9f0fa');
    R(c, x - 3, y, w + 6, 2, '#ffffff');
    R(c, x - 3, y + roofH - 7, w + 6, 2, '#d5e0f0');
    for (let i = 0; i < w + 6; i++) {
      if (rnd() < .45) R(c, x - 3 + i, y + roofH - 5, 1, 1 + (rnd() < .4), '#e9f0fa');
      if (rnd() < .12) R(c, x - 3 + i, y + roofH, 1, 2 + (rnd() < .5), '#cfe6ff');
    }
    // chimney
    if (o.chimney !== false) {
      const cx = x + w - 20;
      R(c, cx, y - 7, 7, 10, '#7b3b2a'); R(c, cx, y - 7, 7, 1, '#5a2a1d');
      R(c, cx - 1, y - 9, 9, 2, '#fff');
      th.chimneys.push({ x: cx + 3, y: y - 10 });
    }
    if (o.wreath) {
      const wx = x + w / 2, wy = y + roofH + 2;
      PX.ellipse(c, wx, wy - 12, 4, 4, '#2f7d46'); PX.ellipse(c, wx, wy - 12, 2, 2, o.roof);
      R(c, wx - 1, wy - 8, 2, 2, '#d8443a');
    }
    for (let i = x - 2; i < x + w + 3; i += 5) th.lights.push({ x: i, y: y + roofH, col: LIGHT_COLS[th.lights.length % 5] });
  }

  function reindeer(c, x, y, t, k = 0) {
    const b = Math.floor(t * 6 + k) % 2;
    R(c, x - 4, y - 7, 8, 4, '#8b5a2b'); R(c, x - 4, y - 4, 8, 1, '#6e4422');
    R(c, x - 3, y - 3, 1, 3 - b, '#5a3a22'); R(c, x + 2, y - 3, 1, 2 + b, '#5a3a22');
    R(c, x + 3, y - 10, 3, 4, '#8b5a2b'); R(c, x + 6, y - 9, 1, 1, '#ff4b3e');
    R(c, x + 3, y - 13, 1, 3, '#e2c28f'); R(c, x + 5, y - 12, 1, 2, '#e2c28f'); R(c, x + 2, y - 13, 1, 1, '#e2c28f');
    R(c, x + 4, y - 9, 1, 1, '#2b1d14');
  }

  const flakes = Array.from({ length: 140 }, () => ({ x: Math.random() * 400, y: Math.random() * 240, v: 8 + Math.random() * 14, d: Math.random() * 6 }));

  registerTheme({
    id: 'christmas',
    name: 'Christmas Village',
    icon: '🎄',
    title: 'Christmas Agent Office',
    location: 'North Pole',
    ui: { bg: '#0e1830', bg2: '#1b2c52', panel: '#3a2416', edge: '#1f1208', line: '#7a5130', accent: '#f2c14e', text: '#fff3dc', sub: '#d9c29b', chip: '#2a190e' },
    unitIcon: '🎁',
    toolIcons: { read: '📜', edit: '🔨', bash: '✅', web: '🔭' },
    crew: ['Dev Elf', 'Design Elf', 'QA Elf', 'Logistics Elf', 'Research Elf', 'Docs Elf', 'Ops Elf'],
    lead: { name: 'Santa', title: 'หัวหน้าโรงงาน' },
    mission: { title: 'ส่งของขวัญ 20 ชิ้นก่อนคริสต์มาส', goal: 20, countdown: 'christmas' },
    words: {
      intake: 'อ่านจดหมายขอของขวัญ', helper: 'เป่านกหวีดเรียกผู้ช่วย', helperName: '%s Jr.',
      wrap: 'ห่อของ · สรุปงาน', wrapIcon: '🎀', carry: 'แบกของไปที่รถลาก',
      delivered: 'ส่ง “%s” ขึ้นรถลากแล้ว', carrierGone: '🦌 รถลากออกส่งของ %n ชิ้น!', waitCarrier: 'รอรถลากกลับมา',
      rest: 'จิบโกโก้ข้างต้นคริสต์มาส', restIcon: '☕',
      permAsk: 'ขอซานต้าประทับตรา', leadAuto: 'ซานต้าประทับตราให้อัตโนมัติ ✅', youApprove: 'คุณประทับตราแทนซานต้า ✅',
      error: 'กล่องระเบิด! ลองใหม่', errorIcon: '💥', compact: 'ถุงเต็ม! บีบอัด context', compactIcon: '🎒',
      leadIdle: 'นั่งเช็กลิสต์', inspect: 'ส่งของให้ซานต้าตรวจ', leadBusy: 'มีคิวรอประทับตรา %n',
    },
    places: {
      intake: { x: 246, y: 214 }, read: { x: 164, y: 216 }, edit: { x: 75, y: 87 }, bash: { x: 72, y: 213 },
      web: { x: 330, y: 87 }, permission: { x: 200, y: 89 }, wrap: { x: 300, y: 191 }, deliver: { x: 334, y: 208 },
      idle: { x: 200, y: 166, jx: 46, jy: 7 },
    },
    signs: [
      { x: 75, y: 25, text: 'Workshop', sub: 'Edit · Write', icon: '🔨' },
      { x: 200, y: 12, text: "Santa's Office", sub: 'Permission', icon: '🎅' },
      { x: 330, y: 27, text: 'Reindeer Scouts', sub: 'Web search', icon: '🔭' },
      { x: 72, y: 153, text: 'Quality Control', sub: 'Bash · Test', icon: '✅' },
      { x: 164, y: 163, text: 'Wish List Archive', sub: 'Read · Grep', icon: '📜' },
      { x: 246, y: 186, text: 'Letter Box', sub: 'งานใหม่', icon: '✉️', small: true },
      { x: 336, y: 150, text: 'Delivery Zone', sub: 'ส่งงาน', icon: '🛷' },
    ],

    drawStatic(c) {
      const rnd = PX.rng(2512);
      this.lights = []; this.glows = []; this.chimneys = []; this.treeLights = [];
      // snow ground
      R(c, 0, 0, 400, 240, '#e3ebf7');
      PX.speckle(c, 0, 0, 400, 240, ['#d1dbec', '#f4f8ff', '#cad6ea'], .05, rnd);
      // roads
      const cob = '#958ea8';
      R(c, 28, 80, 346, 15, cob);
      R(c, 28, 205, 252, 18, cob);
      R(c, 192, 170, 16, 40, cob);
      PX.ellipse(c, 200, 135, 80, 43, '#857e98');
      PX.ellipse(c, 200, 135, 78, 41, cob);
      // cobble texture
      const onRoad = (x, y) => (x >= 28 && x < 371 && y >= 80 && y < 93) || (x >= 28 && x < 277 && y >= 205 && y < 221) ||
        (x >= 192 && x < 205 && y >= 170 && y < 210) || (((x - 200) / 77) ** 2 + ((y - 135) / 40) ** 2 < 1);
      for (let y = 80; y < 222; y += 3) for (let x = 28; x < 378; x += 4) {
        const sx = x + ((y / 3) % 2) * 2;
        if (onRoad(sx, y) && onRoad(sx + 2, y + 1)) R(c, sx, y, 3, 2, rnd() < .5 ? '#a39cb5' : '#8a839d');
      }
      PX.speckle(c, 28, 80, 346, 3, ['#eef3fb'], .3, rnd);
      // pond + snowman
      PX.ellipse(c, 342, 130, 25, 10, '#9cc9e2'); PX.ellipse(c, 342, 130, 23, 8, '#c4e6f7');
      R(c, 330, 127, 8, 1, '#fff'); R(c, 348, 132, 6, 1, '#fff');
      PX.ellipse(c, 108, 146, 5, 4, '#fff'); PX.ellipse(c, 108, 139, 4, 3, '#fff');
      R(c, 107, 138, 1, 1, '#222'); R(c, 109, 138, 1, 1, '#222'); R(c, 108, 139, 2, 1, '#ff8a30');
      R(c, 105, 141, 6, 1, '#d8443a'); R(c, 105, 134, 6, 1, '#222'); R(c, 106, 132, 4, 2, '#222');
      // pines around the edge
      for (const [x, y, h] of [[12, 26, 16], [137, 28, 13], [266, 26, 15], [389, 28, 16], [13, 66, 12], [390, 68, 12], [10, 112, 14], [390, 112, 13],
        [12, 148, 11], [390, 150, 11], [96, 122, 9], [120, 112, 8], [282, 112, 8], [6, 238, 10], [114, 239, 9], [262, 238, 8], [396, 238, 10], [378, 96, 9]])
        PX.pine(c, x, y, h);
      // fences
      const fence = (x1, x2, y) => { R(c, x1, y + 1, x2 - x1, 1, '#6e4224'); R(c, x1, y + 3, x2 - x1, 1, '#6e4224');
        for (let x = x1; x <= x2; x += 6) { R(c, x, y - 1, 2, 6, '#7d4c28'); R(c, x, y - 2, 2, 1, '#fff'); } };
      fence(30, 118, 96); fence(282, 372, 96);
      // buildings
      building(c, 30, 22, 90, 52, { wall: '#8a5630', wallDark: '#74472a', roof: '#a12a24', roofDark: '#7a1d18', awning: true }, this, rnd);
      building(c, 150, 8, 100, 60, { wall: '#7a4a2a', wallDark: '#653c22', roof: '#b8322a', roofDark: '#86201a', door: '#5a1a14', wreath: true }, this, rnd);
      building(c, 285, 24, 90, 50, { wall: '#6e4224', wallDark: '#5a3620', roof: '#6b3a22', roofDark: '#4a2614' }, this, rnd);
      building(c, 26, 150, 94, 50, { wall: '#8a5630', wallDark: '#74472a', roof: '#2e6b45', roofDark: '#1f4d31' }, this, rnd);
      building(c, 128, 160, 72, 44, { wall: '#7d5a3c', wallDark: '#664830', roof: '#2f4f7a', roofDark: '#203858', chimney: false }, this, rnd);
      // stable stalls with reindeer peeking
      for (let i = 0; i < 3; i++) { const sx = 296 + i * 24; R(c, sx, 52, 18, 22, '#2a180e'); R(c, sx, 62, 18, 2, '#8a5630'); reindeer(c, sx + 7, 70, 0, i); }
      // red carpet + santa desk area
      R(c, 194, 68, 12, 12, '#b8322a'); R(c, 194, 68, 1, 12, '#e7b142'); R(c, 205, 68, 1, 12, '#e7b142');
      // mailbox
      R(c, 237, 196, 2, 10, '#4a2a18'); R(c, 233, 190, 10, 7, '#d8443a'); R(c, 233, 190, 10, 1, '#fff'); R(c, 234, 193, 8, 1, '#8f1f1a');
      // central tree + presents
      PX.ellipse(c, 200, 149, 24, 9, '#7d7690');
      PX.pine(c, 200, 150, 36, { dark: '#1a4d33', mid: '#24693f' });
      for (let i = 0; i < 26; i++) { const k = rnd(), yy = 116 + k * 30, hw = 2 + k * 12; this.treeLights.push({ x: 200 + (rnd() * 2 - 1) * hw, y: yy, col: LIGHT_COLS[i % 5] }); }
      for (const [x, y, col] of [[186, 147, '#d8443a'], [192, 151, '#3a7bd5'], [207, 150, '#2f9a57'], [213, 146, '#e7b142'], [199, 153, '#9b59b6']]) {
        R(c, x, y, 6, 5, col); R(c, x + 2, y, 1, 5, '#fff3c4'); R(c, x, y + 2, 6, 1, '#fff3c4');
      }
      // benches + lamps
      for (const [x, y] of [[150, 112], [240, 112]]) { R(c, x, y, 12, 3, '#7d4c28'); R(c, x, y - 3, 12, 2, '#6e4224'); R(c, x + 1, y + 3, 1, 2, '#3b2212'); R(c, x + 10, y + 3, 1, 2, '#3b2212'); R(c, x, y - 4, 12, 1, '#fff'); }
      this.lamps = [[126, 102], [274, 102], [128, 172], [272, 172], [28, 100], [372, 100]];
      for (const [x, y] of this.lamps) { R(c, x, y - 12, 1, 12, '#2b2b38'); R(c, x - 1, y - 15, 3, 3, '#ffe08a'); R(c, x - 1, y - 16, 3, 1, '#fff'); R(c, x - 1, y, 3, 1, 'rgba(0,0,0,.2)'); }
      // delivery deck
      R(c, 276, 158, 120, 66, '#9a6438');
      for (let y = 160; y < 224; y += 4) R(c, 276, y, 120, 1, '#865330');
      R(c, 276, 158, 120, 2, '#6e4224');
      fence(298, 394, 156);
      // wrap table
      R(c, 289, 180, 24, 8, '#6e4224'); R(c, 289, 179, 24, 3, '#a8703f');
      for (const [x, col] of [[291, '#d8443a'], [297, '#2f9a57'], [303, '#3a7bd5']]) { R(c, x, 175, 5, 4, col); R(c, x + 2, 175, 1, 4, '#ffe9a8'); }
      R(c, 308, 176, 3, 3, '#ff9ad5');
      // candy canes
      for (const [x, y] of [[282, 162], [390, 220], [186, 206], [214, 206]]) { for (let i = 0; i < 10; i++) R(c, x, y - i, 2, 1, i % 3 ? '#fff' : '#d8443a'); R(c, x + 1, y - 11, 2, 1, '#d8443a'); R(c, x + 3, y - 10, 1, 2, '#fff'); }
    },

    drawAmbient(c, t) {
      // warm window + lamp glow
      for (const g of this.glows) { c.fillStyle = 'rgba(255,200,90,.09)'; c.fillRect(g.x - g.r, g.y - g.r / 2, g.r * 2, g.r); }
      for (const [x, y] of this.lamps) { const a = .16 + .04 * Math.sin(t * 3 + x); c.fillStyle = `rgba(255,214,120,${a})`; PX.ellipse(c, x, y - 4, 10, 6, c.fillStyle); }
      // blinking string lights
      this.lights.forEach((l, i) => { if (Math.sin(t * 2.4 + i * 1.7) > -.3) R(c, l.x, l.y, 1, 2, l.col); });
      this.treeLights.forEach((l, i) => { if (Math.sin(t * 3 + i) > -.2) R(c, l.x, l.y, 1, 1, l.col); });
      // star
      const s = Math.sin(t * 4) > 0;
      R(c, 199, 108, 3, 3, '#ffd54a'); R(c, 200, s ? 105 : 106, 1, s ? 9 : 7, '#ffe98a'); R(c, s ? 196 : 197, 109, s ? 9 : 7, 1, '#ffe98a');
      // chimney smoke
      for (const ch of this.chimneys) for (let i = 0; i < 4; i++) {
        const k = ((t * .35 + i / 4) % 1);
        c.fillStyle = `rgba(230,236,248,${.55 * (1 - k)})`;
        c.fillRect(Math.round(ch.x + Math.sin(k * 6 + i) * 3), Math.round(ch.y - k * 22), 2 + (k > .5), 2 + (k > .5));
      }
    },

    drawWeather(c, t, dt) {
      c.fillStyle = 'rgba(255,255,255,.9)';
      for (const f of flakes) {
        f.y += f.v * dt; f.x += Math.sin(t * .8 + f.d) * .15;
        if (f.y > 240) { f.y = -2; f.x = Math.random() * 400; }
        c.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      }
    },

    leadSeat: { x: 200, y: 75 },
    drawLeadChar(c, L, t) { PX.person(c, L.x, L.y, { top: '#c8372d', pants: '#2b1d14', hat: 'santa', belt: true, beard: true, frame: L.frame, flip: L.flip, work: L.wave > 0, t }); },
    drawLead(c, t, busy, L) {
      if (L.atDesk) PX.person(c, 200, 75, { top: '#c8372d', pants: '#2b1d14', hat: 'santa', belt: true, beard: true, work: busy || L.wave > 0 || L.stamp > 0, t });
      R(c, 188, 72, 24, 8, '#6e2a1f'); R(c, 188, 71, 24, 2, '#a8423a');
      R(c, 191, 70, 5, 2, '#fff'); R(c, 205, 69, 3, 3, '#e7b142');
    },

    drawCarrier(c, car, t) {
      let ox = 0, oy = 0;
      if (car.phase === 'leaving') { const k = car.t; ox = k * k * 16; oy = -k * k * 16; }
      else if (car.phase === 'gone') return;
      else if (car.phase === 'returning') { const k = 1 - car.t / 2; oy = -k * 70; ox = -k * 20; }
      const x = Math.round(352 + ox), y = Math.round(194 + oy);
      if (car.phase === 'leaving' && car.t > .3) for (let i = 0; i < 6; i++) R(c, x - 16 - i * 4, y + i * 3, 2, 1, LIGHT_COLS[(i + Math.floor(t * 8)) % 5]);
      reindeer(c, x + 30, y - 2, t, 0); reindeer(c, x + 42, y - 4, t, 1);
      R(c, x + 12, y - 7, 30, 1, '#7a4a2a');
      R(c, x - 15, y, 30, 1, '#e7b142'); R(c, x + 14, y - 2, 2, 2, '#e7b142'); R(c, x - 10, y - 1, 1, 1, '#e7b142'); R(c, x + 8, y - 1, 1, 1, '#e7b142');
      R(c, x - 16, y - 13, 5, 12, '#c8372d'); R(c, x - 13, y - 8, 25, 7, '#c8372d');
      R(c, x - 13, y - 5, 25, 1, '#e7b142'); R(c, x - 13, y - 2, 25, 1, '#8f1f1a'); R(c, x - 16, y - 13, 5, 1, '#e7b142');
      for (let i = 0; i < car.count; i++) {
        const gx = x - 10 + (i % 3) * 7, gy = y - 13 - Math.floor(i / 3) * 5;
        R(c, gx, gy, 6, 5, LIGHT_COLS[i % 5]); R(c, gx + 2, gy, 1, 5, '#fff3c4'); R(c, gx, gy + 2, 6, 1, '#fff3c4');
      }
    },

    drawChar(c, a, frame, t) {
      PX.person(c, a.x, a.y, {
        top: a.color, pants: '#2b3b2f', hat: 'elf', hatCol: a.isSub ? '#e7b142' : (a.color === '#d8443a' ? '#2f7d46' : '#c8372d'),
        ears: true, belt: true, frame, work: a.mode === 'work', t, flip: a.flip,
      });
    },
    drawCarry(c, x, y) { R(c, x - 3, y - 20, 6, 5, '#d8443a'); R(c, x - 1, y - 20, 1, 5, '#ffe9a8'); R(c, x - 3, y - 18, 6, 1, '#ffe9a8'); },
    drawLeadPortrait(c, x, y) { PX.person(c, x, y, { top: '#c8372d', pants: '#2b1d14', hat: 'santa', belt: true, beard: true }); },
  });
})();
