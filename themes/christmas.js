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
      R(c, x + wx, wallY + 4, 10, 7, '#ffc65a'); R(c, x + wx + 1, wallY + 5, 3, 2, '#fff0b8');
      R(c, x + wx + 4, wallY + 4, 1, 7, '#d99a3a'); R(c, x + wx, wallY + 7, 10, 1, '#d99a3a');
      R(c, x + wx - 1, wallY + 12, 12, 1, '#f4f8ff');
      th.glows.push({ x: x + wx + 5, y: wallY + 10, r: 16 });
    }
    // door
    const dh = Math.min(13, wallH - 2), dx = x + Math.round(w / 2) - 5;
    R(c, dx - 1, y + h - dh - 1, 12, dh + 1, '#3b2212');
    R(c, dx, y + h - dh, 10, dh, o.door || '#7a2a22');
    R(c, dx + 5, y + h - dh, 1, dh, '#00000033');
    R(c, dx + 7, y + h - 6, 1, 1, '#ffd54a');
    if (o.awning) for (let i = 0; i < w + 4; i++) R(c, x - 2 + i, wallY, 1, 4, Math.floor(i / 3) % 2 ? '#fff' : '#d8443a');
    // garland swag under the eave
    for (let i = 0; i < w; i++) R(c, x + i, wallY + 1 + (Math.abs((i % 12) - 6) > 3 ? 0 : 1), 1, 2, i % 2 ? '#2f7d46' : '#245f37');
    // hipped roof: narrow at the ridge, wide at the eave, a band of tiles peeking under the snow
    const inset = Math.round(roofH * .4), L = x - 5, Wd = w + 10;
    for (let i = 0; i < roofH; i++) {
      const k = 1 - i / roofH, l = L + Math.round(inset * k), r = L + Wd - Math.round(inset * k), mid = (l + r) >> 1;
      const tiles = i >= roofH - 6;
      R(c, l, y + i, r - l, 1, tiles ? (i % 2 ? o.roofDark : o.roof) : (i < 2 ? '#ffffff' : '#eef3fb'));
      if (!tiles) { R(c, mid, y + i, r - mid, 1, i < 2 ? '#f4f8ff' : '#dde6f4'); R(c, l, y + i, 1, 1, o.roofDark); R(c, r - 1, y + i, 1, 1, o.roofDark); }
    }
    R(c, L, y + roofH - 1, Wd, 1, '#2b1a10');
    R(c, L + inset, y, Wd - inset * 2, 1, '#ffffff');
    // snow lip drooping over the tiles + icicles
    for (let i = 0; i < Wd; i++) {
      const lip = 1 + (rnd() < .5) + (rnd() < .25);
      R(c, L + i, y + roofH - 6, 1, lip, '#e3ebf8');
      if (rnd() < .16) R(c, L + i, y + roofH, 1, 2 + (rnd() < .5) + (rnd() < .3), '#cfe6ff');
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

  const GIFT_COLS = ['#d8443a', '#2f9a57', '#3a7bd5', '#e7b142', '#9b59b6'];
  function gift(c, x, y, w, h, col, rib = '#fff3c4') {
    R(c, x, y, w, h, col); R(c, x, y + h - 1, w, 1, PX.shade(col, -.25));
    R(c, x + (w >> 1), y, 1, h, rib); R(c, x, y + (h >> 1), w, 1, rib);
    R(c, x + (w >> 1) - 1, y - 1, 1, 1, rib); R(c, x + (w >> 1) + 1, y - 1, 1, 1, rib);
  }
  function giftPile(c, x, y, n, rnd) {
    for (let i = 0; i < n; i++) {
      const w = 4 + Math.floor(rnd() * 4), h = 3 + Math.floor(rnd() * 3);
      gift(c, x + (i % 3) * 5 - 6 + (i >= 3 ? 2 : 0), y - h - (i >= 3 ? 4 : 0), w, h, GIFT_COLS[Math.floor(rnd() * 5)]);
    }
  }
  function holly(c, x, y, rnd) {
    PX.ellipse(c, x, y, 6, 3, '#1f5a34'); PX.ellipse(c, x - 1, y - 1, 4, 2, '#2f7d46');
    R(c, x - 5, y - 3, 10, 1, '#eef4ff');
    for (let i = 0; i < 4; i++) R(c, x - 4 + Math.floor(rnd() * 8), y - 1 + Math.floor(rnd() * 3), 1, 1, '#e23a3a');
  }
  function snowman(c, x, y) {
    PX.ellipse(c, x + 1, y + 1, 9, 3, 'rgba(40,50,90,.2)');
    PX.ellipse(c, x, y - 5, 7, 6, '#dfe7f5'); PX.ellipse(c, x - 1, y - 6, 6, 5, '#ffffff');
    PX.ellipse(c, x, y - 14, 5, 4, '#dfe7f5'); PX.ellipse(c, x - 1, y - 15, 4, 3, '#ffffff');
    PX.ellipse(c, x, y - 21, 4, 4, '#ffffff');
    R(c, x - 2, y - 22, 1, 1, '#222'); R(c, x + 1, y - 22, 1, 1, '#222'); R(c, x, y - 21, 3, 1, '#ff8a30');
    R(c, x - 4, y - 18, 9, 2, '#d8443a'); R(c, x + 2, y - 17, 2, 5, '#d8443a'); R(c, x + 2, y - 13, 2, 1, '#8f1f1a');
    for (const by of [y - 14, y - 11, y - 6]) R(c, x, by, 1, 1, '#2b2b38');
    R(c, x - 5, y - 30, 10, 5, '#24242e'); R(c, x - 7, y - 25, 14, 1, '#24242e'); R(c, x - 5, y - 27, 10, 1, '#d8443a');
    for (let i = 0; i < 6; i++) { R(c, x - 6 - i, y - 15 - (i >> 1), 1, 1, '#5a3a22'); R(c, x + 6 + i, y - 15 - (i >> 1), 1, 1, '#5a3a22'); }
  }
  function lamp(c, x, y) {
    R(c, x - 2, y - 1, 5, 2, '#2b2b38'); R(c, x, y - 17, 1, 16, '#2b2b38'); R(c, x + 1, y - 17, 1, 16, '#454560');
    R(c, x - 2, y - 23, 6, 7, '#2b2b38'); R(c, x - 1, y - 22, 4, 5, '#ffd77a');
    R(c, x - 3, y - 25, 8, 2, '#2b2b38'); R(c, x - 2, y - 26, 6, 1, '#ffffff'); R(c, x, y - 27, 2, 1, '#2b2b38');
  }

  const flakes =Array.from({ length: 140 }, () => ({ x: Math.random() * 400, y: Math.random() * 240, v: 8 + Math.random() * 14, d: Math.random() * 6 }));

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
    signStyle: 'big',
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
      R(c, 0, 0, 400, 240, '#c9d1ea');
      PX.speckle(c, 0, 0, 400, 240, ['#b6c0de', '#dbe2f3', '#bfc8e4', '#e6ebf7'], .07, rnd);
      // roads
      const cob = '#8a7470';
      R(c, 28, 80, 346, 15, cob);
      R(c, 28, 205, 252, 18, cob);
      R(c, 192, 170, 16, 40, cob);
      PX.ellipse(c, 200, 135, 80, 43, '#6e5a58');
      PX.ellipse(c, 200, 135, 78, 41, cob);
      // cobble texture
      const onRoad = (x, y) => (x >= 28 && x < 371 && y >= 80 && y < 93) || (x >= 28 && x < 277 && y >= 205 && y < 221) ||
        (x >= 192 && x < 205 && y >= 170 && y < 210) || (((x - 200) / 77) ** 2 + ((y - 135) / 40) ** 2 < 1);
      for (let y = 80; y < 222; y += 3) for (let x = 28; x < 378; x += 4) {
        const sx = x + ((y / 3) % 2) * 2;
        if (onRoad(sx, y) && onRoad(sx + 2, y + 1)) R(c, sx, y, 3, 2, rnd() < .5 ? '#9a8580' : '#7a6662');
      }
      PX.speckle(c, 28, 80, 346, 3, ['#e6ebf7'], .3, rnd); PX.speckle(c, 28, 205, 252, 2, ['#e6ebf7'], .3, rnd);
      // plaza: rings of darker setts like a laid stone circle, snow drifting in at the rim
      const ring = (rx, ry, col, step) => { for (let a = 0; a < Math.PI * 2; a += step) R(c, Math.round(200 + Math.cos(a) * rx), Math.round(135 + Math.sin(a) * ry), 2, 1, col); };
      ring(58, 29, '#6a5654', .035); ring(57, 28, '#a8928c', .07); ring(34, 16, '#6a5654', .05); ring(77, 40, '#e6ebf7', .05);
      // frozen pond
      PX.ellipse(c, 342, 130, 26, 11, '#e6ebf7'); PX.ellipse(c, 342, 130, 25, 10, '#6d93c4'); PX.ellipse(c, 342, 129, 23, 8, '#9cc4e8');
      PX.ellipse(c, 338, 128, 12, 3, '#b8d8f2'); R(c, 330, 127, 8, 1, '#fff'); R(c, 348, 132, 6, 1, '#fff'); R(c, 352, 126, 3, 1, '#fff');
      // pine forest crowding the edges, drawn back to front
      const pines = [];
      for (let x = 4; x < 400; x += 11 + Math.floor(rnd() * 6)) pines.push([x, 14 + Math.floor(rnd() * 8), 12 + Math.floor(rnd() * 7)]);
      for (let y = 34; y < 236; y += 14 + Math.floor(rnd() * 6)) { pines.push([5 + Math.floor(rnd() * 6), y, 12 + Math.floor(rnd() * 8)]); pines.push([389 + Math.floor(rnd() * 7), y, 12 + Math.floor(rnd() * 8)]); }
      for (const x of [8, 26, 112, 124, 206, 222, 262, 280, 394]) pines.push([x, 236 + Math.floor(rnd() * 4), 10 + Math.floor(rnd() * 6)]);
      pines.push([137, 30, 15], [266, 30, 16], [118, 116, 10], [282, 116, 9], [378, 100, 10], [128, 146, 8]);
      pines.sort((a, b) => a[1] - b[1]).forEach(([x, y, h]) => PX.pine(c, x, y, h));
      // fences
      const fence = (x1, x2, y) => { R(c, x1, y + 1, x2 - x1, 1, '#6e4224'); R(c, x1, y + 3, x2 - x1, 1, '#6e4224');
        for (let x = x1; x <= x2; x += 6) { R(c, x, y - 1, 2, 6, '#7d4c28'); R(c, x, y - 2, 2, 1, '#fff'); } };
      fence(30, 118, 96); fence(282, 372, 96);
      for (const [a, b, y] of [[30, 118, 95], [282, 372, 95]]) for (let x = a + 3; x < b; x += 6) this.lights.push({ x, y: y + ((x / 6) % 2 ? 1 : 0), col: LIGHT_COLS[this.lights.length % 5] });
      // buildings
      building(c, 30, 22, 90, 52, { wall: '#8a5630', wallDark: '#74472a', roof: '#a12a24', roofDark: '#7a1d18', awning: true }, this, rnd);
      building(c, 150, 8, 100, 60, { wall: '#7a4a2a', wallDark: '#653c22', roof: '#b8322a', roofDark: '#86201a', door: '#5a1a14', wreath: true }, this, rnd);
      building(c, 285, 24, 90, 50, { wall: '#6e4224', wallDark: '#5a3620', roof: '#6b3a22', roofDark: '#4a2614' }, this, rnd);
      building(c, 26, 150, 94, 50, { wall: '#8a5630', wallDark: '#74472a', roof: '#2e6b45', roofDark: '#1f4d31' }, this, rnd);
      building(c, 128, 160, 72, 44, { wall: '#7d5a3c', wallDark: '#664830', roof: '#2f4f7a', roofDark: '#203858', chimney: false }, this, rnd);
      // snowman, holly along the fences, gifts piled by the doors
      snowman(c, 106, 140);
      for (const x of [50, 92, 302, 350]) holly(c, x, 104, rnd);
      for (const [x, y, n] of [[40, 80, 4], [112, 80, 3], [176, 76, 5], [228, 76, 5], [292, 80, 3], [366, 80, 4], [116, 204, 3], [32, 204, 3], [196, 206, 2]]) giftPile(c, x, y, n, rnd);
      // stable stalls with reindeer peeking
      for (let i = 0; i < 3; i++) { const sx = 296 + i * 24; R(c, sx, 52, 18, 22, '#2a180e'); R(c, sx, 62, 18, 2, '#8a5630'); reindeer(c, sx + 7, 70, 0, i); }
      // red carpet + santa desk area
      R(c, 188, 72, 24, 2, '#a59fb0'); R(c, 186, 75, 28, 2, '#8c8496'); R(c, 184, 78, 32, 2, '#a59fb0');
      R(c, 194, 68, 12, 12, '#b8322a'); R(c, 194, 68, 1, 12, '#e7b142'); R(c, 205, 68, 1, 12, '#e7b142');
      // mailbox
      R(c, 237, 196, 2, 10, '#4a2a18'); R(c, 233, 190, 10, 7, '#d8443a'); R(c, 233, 190, 10, 1, '#fff'); R(c, 234, 193, 8, 1, '#8f1f1a');
      // central tree + presents
      PX.ellipse(c, 200, 150, 30, 11, '#7d7690'); PX.ellipse(c, 200, 149, 28, 9, '#e6ebf7');
      PX.pine(c, 200, 151, 46, { dark: '#1a4d33', mid: '#24693f' });
      for (let i = 0; i < 18; i++) { const k = .1 + rnd() * .85, yy = Math.round(106 + k * 40), hw = 2 + k * 14; R(c, Math.round(200 + (rnd() * 2 - 1) * hw), yy, 2, 2, ['#d8443a', '#e7b142', '#6fd3ff', '#ff9ad5'][i % 4]); }
      for (let i = 0; i < 34; i++) { const k = rnd(), yy = 106 + k * 40, hw = 2 + k * 15; this.treeLights.push({ x: 200 + (rnd() * 2 - 1) * hw, y: yy, col: LIGHT_COLS[i % 5] }); }
      for (const [x, y, w, h, col] of [[176, 146, 7, 6, '#d8443a'], [184, 150, 6, 5, '#3a7bd5'], [190, 152, 8, 6, '#e7b142'], [205, 151, 7, 6, '#2f9a57'],
        [212, 147, 6, 6, '#d8443a'], [218, 150, 7, 5, '#9b59b6'], [198, 154, 6, 4, '#ff9ad5'], [180, 154, 5, 4, '#2f9a57'], [214, 155, 6, 4, '#3a7bd5']]) gift(c, x, y, w, h, col);
      // campfire + log seats (cocoa break spot)
      this.fire = { x: 250, y: 160 };
      PX.ellipse(c, 250, 161, 9, 4, '#4a3a3a'); PX.ellipse(c, 250, 161, 7, 3, '#2a1c1c');
      for (let i = 0; i < 8; i++) { const k = i / 8 * Math.PI * 2; R(c, 250 + Math.cos(k) * 8 - 1, 161 + Math.sin(k) * 3.5 - 1, 3, 2, i % 2 ? '#8c8496' : '#a59fb0'); }
      R(c, 245, 160, 10, 2, '#6b3e22'); R(c, 247, 158, 6, 2, '#7d4c28');
      for (const [x, y] of [[234, 166], [262, 166]]) { R(c, x - 5, y - 1, 10, 4, '#24160f'); R(c, x - 4, y, 8, 2, '#8a5630'); R(c, x - 4, y, 1, 2, '#c8955a'); R(c, x + 3, y, 1, 2, '#c8955a'); R(c, x - 4, y - 1, 8, 1, '#e6ebf7'); }
      // benches + lamps
      for (const [x, y] of [[150, 112], [240, 112]]) { R(c, x, y, 12, 3, '#7d4c28'); R(c, x, y - 3, 12, 2, '#6e4224'); R(c, x + 1, y + 3, 1, 2, '#3b2212'); R(c, x + 10, y + 3, 1, 2, '#3b2212'); R(c, x, y - 4, 12, 1, '#fff'); }
      this.lamps = [[126, 102], [274, 102], [128, 172], [272, 172], [28, 100], [372, 100]];
      for (const [x, y] of this.lamps) lamp(c, x, y);
      // delivery deck
      R(c, 276, 158, 120, 66, '#9a6438');
      for (let y = 160; y < 224; y += 4) R(c, 276, y, 120, 1, '#865330');
      R(c, 276, 158, 120, 2, '#6e4224');
      fence(298, 394, 156);
      // wrap table
      R(c, 289, 180, 24, 8, '#6e4224'); R(c, 289, 179, 24, 3, '#a8703f');
      for (const [x, col] of [[291, '#d8443a'], [297, '#2f9a57'], [303, '#3a7bd5']]) { R(c, x, 175, 5, 4, col); R(c, x + 2, 175, 1, 4, '#ffe9a8'); }
      R(c, 308, 176, 3, 3, '#ff9ad5');
      giftPile(c, 366, 222, 5, rnd); giftPile(c, 300, 220, 4, rnd);
      for (const [x, y] of [[378, 204], [387, 208]]) { R(c, x, y, 8, 7, '#a8703f'); R(c, x, y, 8, 1, '#c8955a'); R(c, x, y + 3, 8, 1, '#6e4224'); R(c, x + 3, y, 1, 7, '#6e4224'); }
      this.bakeEvening = true;
      // candy canes
      for (const [x, y] of [[282, 162], [390, 220], [186, 206], [214, 206], [168, 152], [232, 152]]) { for (let i = 0; i < 10; i++) R(c, x, y - i, 2, 1, i % 3 ? '#fff' : '#d8443a'); R(c, x + 1, y - 11, 2, 1, '#d8443a'); R(c, x + 3, y - 10, 1, 2, '#fff'); }
      // evening: soft lavender dusk over the whole map + darker edges. Characters are drawn later, so they stay bright.
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#cdc2ee'; c.fillRect(0, 0, 400, 240);
      const v = c.createRadialGradient(200, 125, 90, 200, 125, 260); v.addColorStop(0, 'rgba(255,255,255,1)'); v.addColorStop(1, 'rgba(95,80,150,1)');
      c.fillStyle = v; c.fillRect(0, 0, 400, 240); c.restore();
      // warm light already falling on the snow (static part of the glow)
      for (const g of this.glows) { PX.glow(c, g.x, g.y + 8, g.r + 6, '255,160,70', .3, .45); PX.glow(c, g.x, g.y - 2, 7, '255,200,110', .3, .8); }
      for (const [x, y] of this.lamps) PX.glow(c, x, y - 2, 24, '255,190,110', .3, .5);
      PX.glow(c, 200, 135, 52, '255,180,100', .26, .55);
      PX.glow(c, 250, 160, 34, '255,130,50', .3, .5);
    },

    drawAmbient(c, t) {
      // warm window + lamp glow
      for (const [x, y] of this.lamps) { R(c, x - 1, y - 22, 4, 5, '#ffe9a8'); R(c, x, y - 21, 2, 2, '#ffffff'); }
      // blinking string lights
      this.lights.forEach((l, i) => { if (Math.sin(t * 2.4 + i * 1.7) > -.3) { R(c, l.x, l.y, 2, 2, l.col); R(c, l.x, l.y, 1, 1, '#fff'); } else R(c, l.x, l.y, 2, 2, '#4a3a5a'); });
      this.treeLights.forEach((l, i) => { if (Math.sin(t * 3 + i) > -.2) R(c, l.x, l.y, 1, 1, l.col); });
      this.drawFire(c, t);
      // star
      const s = Math.sin(t * 4) > 0;
      R(c, 198, 99, 5, 5, '#ffd54a'); R(c, 199, 100, 3, 3, '#fff3b0'); R(c, 200, s ? 95 : 96, 1, s ? 13 : 11, '#ffe98a'); R(c, s ? 194 : 195, 101, s ? 13 : 11, 1, '#ffe98a');
      // chimney smoke
      for (const ch of this.chimneys) for (let i = 0; i < 4; i++) {
        const k = ((t * .35 + i / 4) % 1);
        c.fillStyle = `rgba(230,236,248,${.55 * (1 - k)})`;
        c.fillRect(Math.round(ch.x + Math.sin(k * 6 + i) * 3), Math.round(ch.y - k * 22), 2 + (k > .5), 2 + (k > .5));
      }
    },

    drawFire(c, t) {
      const { x, y } = this.fire, k = Math.floor(t * 10);
      const fl = [[0, 6, '#ff6a2a'], [-2, 4, '#ff8a2a'], [2, 5, '#ff7a2a'], [0, 4, '#ffc23a'], [-1, 2, '#ffe27a'], [1, 3, '#ffd24a']];
      fl.forEach(([dx, h, col], i) => { const hh = h + ((k + i * 3) % 3) - 1; R(c, x + dx - 1, y - hh, 2, hh, col); });
      R(c, x - 1, y - 2, 3, 2, '#fff3c4');
      if (k % 4 === 0) R(c, x + ((k >> 2) % 5) - 2, y - 9 - (k % 3), 1, 1, '#ffb347');
    },

    drawWeather(c, t, dt) {
      PX.glow(c, this.fire.x, this.fire.y - 2, 22 + Math.sin(t * 9) * 2 + Math.sin(t * 23), '255,120,40', .16, .6);
      PX.glow(c, 200, 101, 12 + Math.sin(t * 4) * 2, '255,220,120', .24, 1);
      for (const [x, y] of this.lamps) PX.glow(c, x + 1, y - 20, 8, '255,220,140', .25, 1);
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
    drawCarry(c, x, y) { R(c, x - 4, y - 12, 8, 7, '#24160f'); R(c, x - 3, y - 11, 6, 5, '#d8443a'); R(c, x - 3, y - 7, 6, 1, '#a82e26'); R(c, x - 1, y - 11, 1, 5, '#ffe9a8'); R(c, x - 3, y - 9, 6, 1, '#ffe9a8'); R(c, x - 2, y - 13, 1, 1, '#ffe9a8'); R(c, x, y - 13, 1, 1, '#ffe9a8'); },
    drawLeadPortrait(c, x, y) { PX.person(c, x, y, { top: '#c8372d', pants: '#2b1d14', hat: 'santa', belt: true, beard: true }); },
  });
})();
