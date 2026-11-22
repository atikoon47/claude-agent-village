/* Theme pack: Thai Floating Market (ตลาดน้ำ)
   Agents are vendors paddling boats. The canal runs across the whole map, so every
   dock is reachable in a straight line — no pathfinding needed in the engine. */
(() => {
  const R = PX.rect;
  const FRUIT = ['#f2a03a', '#e8553f', '#7fc35a', '#f4d35e', '#b65fc7'];
  const FLAG = ['#e8553f', '#f4d35e', '#3a7bd5', '#2f9a57', '#ff9ad5', '#ffffff'];
  const WATER_TOP = 60, WATER_BOT = 182;

  function shophouse(c, x, y, w, h, o) {
    const roofH = Math.round(h * .5), wallY = y + roofH;
    R(c, x, wallY, w, h - roofH, '#7a4a26');
    for (let i = x + 2; i < x + w; i += 3) R(c, i, wallY, 1, h - roofH, '#6a3f20');
    // open shutters with goods inside
    for (let wx = x + 4; wx < x + w - 10; wx += 16) {
      R(c, wx, wallY + 3, 12, 8, '#2a1a0e');
      R(c, wx - 2, wallY + 3, 2, 8, '#a8703f'); R(c, wx + 12, wallY + 3, 2, 8, '#a8703f');
      for (let k = 0; k < 4; k++) R(c, wx + 1 + k * 3, wallY + 8, 2, 2, o.goods[k % o.goods.length]);
    }
    // striped awning
    for (let i = 0; i < w + 4; i++) R(c, x - 2 + i, wallY - 1, 1, 4, Math.floor(i / 4) % 2 ? '#f6efe0' : o.awning);
    // tiled roof with gold finials (ช่อฟ้า)
    R(c, x - 3, y, w + 6, roofH, o.roof);
    for (let i = x - 1; i < x + w + 3; i += 3) R(c, i, y, 1, roofH, o.roofDark);
    R(c, x - 3, y, w + 6, 1, '#e7b142'); R(c, x - 3, y + roofH - 1, w + 6, 1, '#4a1f14');
    R(c, x - 4, y - 3, 1, 3, '#e7b142'); R(c, x - 5, y - 4, 2, 1, '#e7b142');
    R(c, x + w + 3, y - 3, 1, 3, '#e7b142'); R(c, x + w + 3, y - 4, 2, 1, '#e7b142');
  }
  function palm(c, x, y, h) {
    for (let i = 0; i < h; i++) R(c, x + Math.round(Math.sin(i / 5) * 1.5), y - i, 2, 1, i % 3 ? '#8a6238' : '#6e4a28');
    const tx = x + Math.round(Math.sin(h / 5) * 1.5) + 1, ty = y - h;
    for (const [dx, dy] of [[-8, 2], [8, 2], [-6, -3], [6, -3], [0, -5], [-9, 5], [9, 5]]) PX.path(c, tx, ty, tx + dx, ty + dy, 2, dy < 0 ? '#3d9a4a' : '#2c7a3a');
    R(c, tx - 1, ty, 3, 2, '#6e4a28');
  }
  function banana(c, x, y) {
    R(c, x, y - 8, 2, 8, '#7a9a3a');
    for (const [dx, dy] of [[-7, -12], [7, -12], [-6, -5], [6, -6], [0, -15]]) PX.path(c, x + 1, y - 8, x + 1 + dx, y - 8 + dy / 2, 3, '#58a83c');
  }
  function umbrella(c, x, y, cols) {
    R(c, x - 9, y + 4, 18, 6, '#a8703f'); R(c, x - 9, y + 9, 18, 1, '#6e4224');
    for (let k = 0; k < 6; k++) R(c, x - 7 + k * 3, y + 5, 2, 2, FRUIT[k % 5]);
    PX.ellipse(c, x, y - 1, 13, 7, cols[0]);
    for (let a = 0; a < 8; a += 2) { const ang = a / 8 * Math.PI * 2; PX.path(c, x, y - 1, x + Math.cos(ang) * 11, y - 1 + Math.sin(ang) * 6, 2, cols[1]); }
    R(c, x - 1, y - 2, 2, 2, '#fff');
  }

  const ripples = Array.from({ length: 70 }, () => ({ x: Math.random() * 400, y: WATER_TOP + 6 + Math.random() * (WATER_BOT - WATER_TOP - 10), v: 3 + Math.random() * 5, l: 2 + (Math.random() * 4 | 0), p: Math.random() * 6 }));
  const leaves = Array.from({ length: 6 }, () => ({ x: Math.random() * 400, y: WATER_TOP + 10 + Math.random() * 100, v: 2 + Math.random() * 3 }));

  function vendor(c, a, frame, t, withBoat) {
    const bob = withBoat ? Math.round(Math.sin(t * 2.2 + a.id) * .6) : 0;
    const x = Math.round(a.x), y = Math.round(a.y) + bob, L = a.isSub ? 16 : 22, dir = a.flip ? -1 : 1;
    const px = withBoat ? x - dir * 4 : x, fy = withBoat ? y + 3 : y;
    if (withBoat) {
      if (a.walking) for (let i = 0; i < 3; i++) R(c, x - dir * (L / 2 + 3 + i * 4), y + 1 + (i % 2), 3, 1, `rgba(220,255,245,${.55 - i * .15})`);
      PX.ellipse(c, x, y + 2, L / 2 + 1, 2, 'rgba(10,50,50,.35)');
    }
    PX.person(c, px, fy, { top: a.color, pants: '#2b2f4a', hat: 'none', frame: 0, work: a.mode === 'work', t, flip: a.flip });
    if (a.isSub) { R(c, px - 3, fy - 10, 6, 1, '#2b1d14'); R(c, px - 3, fy - 9, 6, 1, a.color); }
    else { // งอบ conical hat
      R(c, px - 6, fy - 10, 12, 1, '#b8904a'); R(c, px - 5, fy - 11, 10, 1, '#d8b46a');
      R(c, px - 3, fy - 12, 6, 1, '#e4c47e'); R(c, px - 1, fy - 13, 2, 1, '#efd596');
    }
    if (!withBoat) return;
    // paddle
    if (a.walking) {
      const hx = px + dir * 4, bx = hx + (frame === 1 ? -dir * 2 : dir * 2);
      PX.path(c, hx, fy - 6, bx, y + 2, 1, '#a8703f'); R(c, bx - 1, y + 1, 2, 3, '#8a5630');
    }
    // hull (drawn after the person so it hides the legs)
    R(c, x - L / 2 + 2, y - 1, L - 4, 1, '#9a6438');
    R(c, x - L / 2, y, L, 2, '#5a3518');
    R(c, x - L / 2 + 2, y + 2, L - 4, 1, '#3d220d');
    R(c, x - L / 2 - 1, y - 2, 2, 2, '#5a3518'); R(c, x + L / 2 - 1, y - 2, 2, 2, '#5a3518');
    // cargo at the bow
    const cx = x + dir * 5;
    for (let k = 0; k < (a.isSub ? 2 : 4); k++) R(c, cx + dir * (k % 2) * 2 - 1, y - 2 - (k > 1), 2, 2, FRUIT[(k + a.id) % 5]);
  }

  registerTheme({
    id: 'market',
    name: 'Floating Market',
    icon: '🛶',
    title: 'ตลาดน้ำ Agent',
    location: 'คลองดำเนินโค้ด',
    ui: { bg: '#0c2422', bg2: '#1c4a45', panel: '#1f4a47', edge: '#0b1f1d', line: '#3f8077', accent: '#ffb547', text: '#fff6e4', sub: '#bfe0d6', chip: '#163836' },
    unitIcon: '🍃',
    toolIcons: { read: '📚', edit: '🍜', bash: '🔥', web: '📻' },
    crew: ['แม่ค้าโค้ด (Dev)', 'แม่ค้าดีไซน์', 'แม่ค้าชิม (QA)', 'แม่ค้าขนส่ง', 'แม่ค้าหาข่าว', 'แม่ค้าจดบันทึก', 'แม่ค้าคุมเรือ'],
    lead: { name: 'ป้าแดง', title: 'เจ้าของท่าเรือ' },
    mission: { title: 'ส่งของ 20 ห่อก่อนตลาดวาย', goal: 20, timeText: '⏱ ตลาดเปิด 07:00–12:00' },
    queue: { dx: -26, gap: 24, alt: 4 },
    words: {
      intake: 'รับออเดอร์จากลูกค้าริมตลิ่ง', helper: 'ตะโกนเรียกหลานมาช่วย', helperName: '%s น้อย',
      wrap: 'ห่อใบตอง · สรุปงาน', wrapIcon: '🍃', carry: 'พายเรือเอาของไปท่าส่ง',
      delivered: 'ส่ง “%s” ลงเรือใหญ่แล้ว', carrierGone: '🛥️ เรือใหญ่ออกส่งของ %n ห่อ!', waitCarrier: 'รอเรือใหญ่กลับมา',
      rest: 'ลอยเรือกินลมกลางคลอง', restIcon: '🥥',
      permAsk: 'ขออนุญาตป้าแดง', leadAuto: 'ป้าแดงโบกมืออนุญาต ✅', youApprove: 'คุณอนุญาตแทนป้าแดง ✅',
      error: 'เรือโคลง ของหกลงน้ำ!', errorIcon: '💦', compact: 'เรือเต็ม! ขนของขึ้นฝั่ง (compact)', compactIcon: '⚓',
      leadIdle: 'นั่งจดบัญชีที่ศาลา', inspect: 'พายเรือให้ป้าแดงตรวจของ', leadBusy: 'มีเรือรอขออนุญาต %n ลำ',
    },
    places: {
      read: { x: 60, y: 80, jx: 6, jy: 2 }, permission: { x: 200, y: 88 }, web: { x: 342, y: 80, jx: 6, jy: 2 },
      edit: { x: 62, y: 168, jx: 6, jy: 2 }, bash: { x: 150, y: 168, jx: 6, jy: 2 }, intake: { x: 238, y: 168, jx: 6, jy: 2 },
      wrap: { x: 262, y: 128, jx: 3, jy: 6 }, deliver: { x: 316, y: 166, jx: 3, jy: 2 },
      idle: { x: 130, y: 124, jx: 44, jy: 14 },
    },
    signs: [
      { x: 60, y: 14, text: 'ห้องสมุดริมน้ำ', sub: 'Read · Grep', icon: '📚' },
      { x: 200, y: 10, text: 'ศาลาป้าแดง', sub: 'Permission', icon: '🙏' },
      { x: 342, y: 14, text: 'หอกระจายข่าว', sub: 'Web search', icon: '📻' },
      { x: 62, y: 226, text: 'ครัวก๋วยเตี๋ยวเรือ', sub: 'Edit · Write', icon: '🍜' },
      { x: 150, y: 226, text: 'เตาย่างชิมรส', sub: 'Bash · Test', icon: '🔥' },
      { x: 238, y: 226, text: 'ลูกค้าริมตลิ่ง', sub: 'งานใหม่', icon: '🙋' },
      { x: 282, y: 108, text: 'แพห่อใบตอง', sub: 'สรุปงาน', icon: '🍃', small: true },
      { x: 358, y: 226, text: 'ท่าเรือใหญ่', sub: 'ส่งงาน', icon: '🛥️' },
    ],

    drawStatic(c) {
      const rnd = PX.rng(1983);
      // banks
      R(c, 0, 0, 400, WATER_TOP, '#9c7a4a'); PX.speckle(c, 0, 0, 400, WATER_TOP, ['#8a6a3e', '#ad8a58'], .05, rnd);
      R(c, 0, WATER_BOT, 400, 240 - WATER_BOT, '#a88552'); PX.speckle(c, 0, WATER_BOT, 400, 58, ['#937244', '#b8955f'], .05, rnd);
      // water
      for (let y = WATER_TOP; y < WATER_BOT; y++) {
        const k = Math.min(y - WATER_TOP, WATER_BOT - y) / 60;
        R(c, 0, y, 400, 1, k < .1 ? '#2f7a72' : k < .3 ? '#348a80' : '#3b968a');
      }
      PX.speckle(c, 0, WATER_TOP, 400, WATER_BOT - WATER_TOP, ['#44a094', '#2f8076'], .015, rnd);
      // boardwalks + pilings
      R(c, 0, 46, 400, 12, '#b08050'); for (let x = 0; x < 400; x += 5) R(c, x, 46, 1, 12, '#93683e');
      R(c, 0, 57, 400, 2, '#6e4a28'); for (let x = 4; x < 400; x += 14) R(c, x, 58, 2, 4, '#4a301a');
      R(c, 0, 184, 400, 10, '#b08050'); for (let x = 0; x < 400; x += 5) R(c, x, 184, 1, 10, '#93683e');
      R(c, 0, 183, 400, 1, '#6e4a28'); for (let x = 8; x < 400; x += 14) R(c, x, 180, 2, 4, '#4a301a');
      // piers
      for (const x of [60, 342]) { R(c, x - 7, 56, 14, 18, '#a8784a'); for (let y = 58; y < 74; y += 3) R(c, x - 7, y, 14, 1, '#8a5e36'); R(c, x - 8, 72, 2, 4, '#4a301a'); R(c, x + 6, 72, 2, 4, '#4a301a'); }
      for (const x of [62, 150, 238]) { R(c, x - 7, 172, 14, 13, '#a8784a'); for (let y = 173; y < 185; y += 3) R(c, x - 7, y, 14, 1, '#8a5e36'); R(c, x - 8, 170, 2, 4, '#4a301a'); R(c, x + 6, 170, 2, 4, '#4a301a'); }
      // top bank: shophouses, palms, sala
      palm(c, 8, 44, 30); palm(c, 128, 42, 26); palm(c, 272, 44, 28); palm(c, 392, 42, 30);
      shophouse(c, 22, 16, 76, 30, { roof: '#a8462e', roofDark: '#8a3420', awning: '#2f9a57', goods: ['#f4ecd8', '#3a7bd5', '#e8553f'] });
      shophouse(c, 304, 16, 76, 30, { roof: '#8a3a5a', roofDark: '#6e2a46', awning: '#e8553f', goods: ['#c9a35a', '#7fc35a', '#f4d35e'] });
      // radio tower on news house
      R(c, 372, 0, 2, 16, '#555'); R(c, 368, 4, 10, 1, '#555'); R(c, 366, 2, 4, 3, '#9aa3aa');
      // sala (Thai pavilion) on a pier
      R(c, 170, 44, 60, 36, '#b88a58'); for (let y = 46; y < 80; y += 3) R(c, 170, y, 60, 1, '#9a6e42');
      R(c, 169, 78, 2, 6, '#4a301a'); R(c, 229, 78, 2, 6, '#4a301a');
      for (const x of [174, 224]) R(c, x, 34, 3, 26, '#f4ecd8');
      R(c, 164, 22, 72, 14, '#c0452e'); for (let i = 166; i < 236; i += 3) R(c, i, 22, 1, 14, '#9a3420');
      R(c, 172, 12, 56, 12, '#2f7d46'); for (let i = 174; i < 228; i += 3) R(c, i, 12, 1, 12, '#235e34');
      R(c, 164, 35, 72, 1, '#e7b142'); R(c, 172, 23, 56, 1, '#e7b142'); R(c, 172, 12, 56, 1, '#e7b142');
      for (const [x, y] of [[162, 20], [236, 20], [170, 10], [228, 10]]) { R(c, x, y, 2, 3, '#e7b142'); R(c, x + (x < 200 ? -1 : 1), y - 1, 2, 1, '#e7b142'); }
      R(c, 198, 6, 4, 6, '#e7b142');
      // bottom bank: umbrella stalls, customers, bananas
      banana(c, 8, 238); banana(c, 108, 236); banana(c, 196, 238); banana(c, 290, 236); banana(c, 396, 238);
      umbrella(c, 62, 204, ['#e8553f', '#f4d35e']);
      umbrella(c, 150, 204, ['#3a7bd5', '#f6efe0']);
      umbrella(c, 238, 210, ['#2f9a57', '#f4d35e']);
      // grill smoke source + noodle pot
      PX.ellipse(c, 74, 208, 4, 2, '#555'); this.steamAt = [74, 205];
      R(c, 140, 208, 20, 3, '#333'); for (let i = 0; i < 6; i++) R(c, 141 + i * 3, 207, 2, 1, '#e8553f'); this.smokeAt = [150, 205];
      // big cargo pier
      R(c, 330, 172, 60, 13, '#a8784a'); for (let y = 173; y < 185; y += 3) R(c, 330, y, 60, 1, '#8a5e36');
      // lotus + lily pads
      for (const [x, y] of [[20, 100], [30, 108], [380, 120], [372, 132], [110, 160], [196, 150], [14, 150]]) {
        PX.ellipse(c, x, y, 4, 2, '#4f9a3f'); R(c, x, y - 1, 2, 1, '#2f7a72');
        if (rnd() < .6) { R(c, x - 1, y - 2, 3, 2, '#ff9ad5'); R(c, x, y - 3, 1, 1, '#ffd0ea'); }
      }
      // wrapping raft
      R(c, 270, 120, 26, 16, '#c9a35a'); for (let x = 270; x < 296; x += 3) R(c, x, 120, 1, 16, '#a8843f');
      R(c, 270, 135, 26, 1, '#6e4a28');
      for (let i = 0; i < 4; i++) { R(c, 274 + i * 5, 124, 4, 3, '#4f9a3f'); R(c, 275 + i * 5, 124, 1, 3, '#2f6a2a'); }
      R(c, 276, 129, 14, 4, '#58a83c'); R(c, 276, 131, 14, 1, '#3d7a2a');
      // customers waving on the bank (drawn in ambient), lamps
      this.customers = [[222, 192, '#e8553f'], [232, 190, '#3a7bd5'], [252, 192, '#f4d35e']];
    },

    drawAmbient(c, t) {
      // flowing ripples
      for (const r of ripples) {
        const x = Math.round((r.x + t * r.v) % 410) - 5;
        if (Math.sin(t * 1.5 + r.p) > -.4) R(c, x, r.y, r.l, 1, 'rgba(190,240,230,.45)');
      }
      for (const l of leaves) { const x = Math.round((l.x + t * l.v) % 410) - 5; R(c, x, l.y, 3, 2, '#5aa04a'); R(c, x + 1, l.y, 1, 1, '#8fd06a'); }
      // bunting flags
      for (let i = 0; i < 50; i++) {
        const x = i * 8 + 2, y = 2 + Math.round(Math.sin(i / 50 * Math.PI) * 4), f = Math.round(Math.sin(t * 3 + i) * .6);
        R(c, x, y, 5, 1, FLAG[i % 6]); R(c, x + 1, y + 1, 3, 1 + f, FLAG[i % 6]); R(c, x + 2, y + 2 + f, 1, 1, FLAG[i % 6]);
      }
      // smoke + steam
      for (const [src, col] of [[this.smokeAt, '200,200,200'], [this.steamAt, '255,255,255']]) for (let i = 0; i < 5; i++) {
        const k = (t * .4 + i / 5) % 1;
        c.fillStyle = `rgba(${col},${.5 * (1 - k)})`;
        c.fillRect(Math.round(src[0] + Math.sin(k * 6 + i) * 3), Math.round(src[1] - k * 18), 2, 2);
      }
      // waving customers
      this.customers.forEach(([x, y, col], i) => PX.person(c, x, y, { top: col, pants: '#2b2f4a', hat: 'none', work: true, t: t + i * .3 }));
    },
    drawWeather(c, t) {
      // soft sun glare sweeping the water
      c.fillStyle = 'rgba(255,240,200,.05)';
      c.fillRect(0, WATER_TOP, 400, WATER_BOT - WATER_TOP);
    },

    leadSeat: { x: 200, y: 76 },
    drawLeadChar(c, L, t) { vendor(c, { x: L.x, y: L.y, flip: L.flip, walking: L.walking, id: 99, color: '#c0392b', isSub: false, mode: L.wave > 0 ? 'work' : 'idle' }, L.frame, t, true); },
    drawLead(c, t, busy, L) {
      const x = 200, y = 76;
      if (L.atDesk) PX.person(c, x, y, { top: '#c0392b', pants: '#5a2a5a', hat: 'none', work: busy || L.wave > 0 || L.stamp > 0, t });
      if (L.atDesk) R(c, x - 3, y - 13, 6, 2, '#2b1d14'); if (L.atDesk) { R(c, x - 4, y - 12, 1, 3, '#2b1d14'); R(c, x + 3, y - 12, 1, 3, '#2b1d14'); R(c, x + 1, y - 15, 3, 2, '#2b1d14'); }
      R(c, x - 12, y - 3, 24, 6, '#6e4224'); R(c, x - 12, y - 4, 24, 2, '#a8703f');
      R(c, x - 9, y - 5, 7, 2, '#f6efe0'); R(c, x + 3, y - 6, 4, 3, '#c9a35a');
    },

    drawCarrier(c, car, t) {
      let ox = 0;
      if (car.phase === 'leaving') ox = car.t * car.t * 22;
      else if (car.phase === 'gone') return;
      else if (car.phase === 'returning') ox = (1 - car.t / 2) * 90;
      const x = Math.round(362 + ox), y = 166 + Math.round(Math.sin(t * 1.8) * .6);
      if (car.phase === 'leaving') for (let i = 0; i < 5; i++) R(c, x - 30 - i * 5, y + 1 + (i % 2), 4, 1, `rgba(220,255,245,${.6 - i * .1})`);
      PX.ellipse(c, x, y + 3, 28, 3, 'rgba(10,50,50,.35)');
      // canopy
      for (const px of [x - 14, x + 8]) R(c, px, y - 14, 1, 13, '#6e4a28');
      R(c, x - 17, y - 17, 28, 4, '#d8b46a'); for (let i = x - 17; i < x + 11; i += 2) R(c, i, y - 17, 1, 4, '#b8904a');
      // cargo parcels
      for (let i = 0; i < car.count; i++) { const gx = x - 13 + (i % 3) * 7, gy = y - 5 - Math.floor(i / 3) * 4; R(c, gx, gy, 6, 4, '#4f9a3f'); R(c, gx + 2, gy, 1, 4, '#e4c47e'); }
      // hull
      R(c, x - 24, y - 1, 48, 1, '#9a6438'); R(c, x - 26, y, 52, 3, '#5a3518'); R(c, x - 22, y + 3, 44, 1, '#3d220d');
      R(c, x - 27, y - 3, 3, 3, '#5a3518'); R(c, x + 24, y - 4, 3, 4, '#5a3518');
      R(c, x - 26, y, 52, 1, '#c0452e');
      // long-tail engine
      R(c, x + 22, y - 6, 4, 4, '#3a3a40'); PX.path(c, x + 26, y - 4, x + 36, y + 3, 1, '#6a6a70');
    },

    drawChar(c, a, frame, t) {
      if (a.mode === 'error') { a = { ...a, flip: Math.sin(t * 10) > 0 }; }
      vendor(c, a, frame, t, true);
    },
    drawPortrait(c, a) { vendor(c, a, 0, 0, false); },
    drawCarry(c, x, y) { const d = 0; R(c, x - 2, y - 5, 5, 3, '#4f9a3f'); R(c, x, y - 5, 1, 3, '#e4c47e'); },
    drawLeadPortrait(c, x, y) {
      PX.person(c, x, y, { top: '#c0392b', pants: '#5a2a5a', hat: 'none' });
      R(c, x - 3, y - 13, 6, 2, '#2b1d14'); R(c, x - 4, y - 12, 1, 3, '#2b1d14'); R(c, x + 3, y - 12, 1, 3, '#2b1d14'); R(c, x + 1, y - 15, 3, 2, '#2b1d14');
    },
  });
})();
