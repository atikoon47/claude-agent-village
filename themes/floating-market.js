/* Theme pack: Thai Floating Market (ตลาดน้ำ)
   Agents are vendors paddling boats. The canal runs across the whole map, so every
   dock is reachable in a straight line — no pathfinding needed in the engine.
   Between jobs they wait on a bamboo raft (แพ) on foot; once they move, they're in a boat. */
(() => {
  const R = PX.rect;
  const FRUIT = ['#f2a03a', '#e8553f', '#7fc35a', '#f4d35e', '#b65fc7'];
  const FLAG = ['#e8553f', '#f4d35e', '#3a7bd5', '#2f9a57', '#ff9ad5', '#ffffff'];
  const WATER_TOP = 74, WATER_BOT = 172;
  const RAFT = { x: 80, y: 108, w: 68, h: 22 };
  const onRaft = (x, y) => x >= RAFT.x && x <= RAFT.x + RAFT.w && y >= RAFT.y - 2 && y <= RAFT.y + RAFT.h;

  function thaiHouse(c, x, y, w, h, o, th) {
    const roofH = Math.round(h * .42), wallY = y + roofH, wallH = h - roofH;
    R(c, x + 2, y + h, w, 2, 'rgba(40,20,10,.25)');
    // wooden wall with an open front
    R(c, x, wallY, w, wallH, '#8a5630');
    for (let i = x + 2; i < x + w; i += 3) R(c, i, wallY, 1, wallH, '#74462a');
    R(c, x + 4, wallY + 3, w - 8, wallH - 5, '#3b2414');
    o.inside(c, x + 5, wallY + 4, w - 10, wallH - 7);
    R(c, x + 3, wallY + 2, 2, wallH - 2, '#a8703f'); R(c, x + w - 5, wallY + 2, 2, wallH - 2, '#a8703f');
    R(c, x, y + h - 2, w, 2, '#6e4224');
    // striped awning over the front
    if (o.awning) for (let i = 0; i < w + 2; i++) { const col = Math.floor(i / 4) % 2 ? '#f6efe0' : o.awning; R(c, x - 1 + i, wallY - 1, 1, 4, col); if (i % 4 === 1) R(c, x - 1 + i, wallY + 3, 2, 1, col); }
    // two-tier Thai roof with gold trim and finials (ช่อฟ้า)
    const tier = (tx, ty, tw, thh) => {
      for (let i = 0; i < thh; i++) { const ins = Math.round((thh - i) * .9); R(c, tx + ins, ty + i, tw - ins * 2, 1, i % 2 ? o.roof : o.roofDark); }
      for (let i = tx + 3; i < tx + tw - 3; i += 4) R(c, i, ty + 2, 1, thh - 2, PX.shade(o.roof, -.2));
      R(c, tx, ty + thh - 1, tw, 1, '#e7b142'); R(c, tx, ty + thh, tw, 1, '#4a1f14');
      R(c, tx - 2, ty + thh - 4, 2, 4, '#e7b142'); R(c, tx - 3, ty + thh - 5, 2, 1, '#e7b142');
      R(c, tx + tw, ty + thh - 4, 2, 4, '#e7b142'); R(c, tx + tw + 1, ty + thh - 5, 2, 1, '#e7b142');
    };
    tier(x - 4, y + Math.round(roofH * .45), w + 8, roofH - Math.round(roofH * .45));
    tier(x + 10, y, w - 20, Math.round(roofH * .55));
    R(c, x + w / 2 - 1, y - 4, 2, 4, '#e7b142');
    // hanging lanterns at the corners
    for (const lx of [x + 1, x + w - 3]) { R(c, lx + 1, wallY + 3, 1, 3, '#3b2414'); R(c, lx, wallY + 6, 3, 5, '#ff8a3a'); R(c, lx, wallY + 6, 3, 1, '#7a2a1a'); R(c, lx + 1, wallY + 7, 1, 2, '#ffd77a'); th.lanterns.push([lx + 1, wallY + 8]); }
  }
  function palm(c, x, y, h) {
    for (let i = 0; i < h; i++) R(c, x + Math.round(Math.sin(i / 5) * 1.5), y - i, 2, 1, i % 3 ? '#8a6238' : '#6e4a28');
    const tx = x + Math.round(Math.sin(h / 5) * 1.5) + 1, ty = y - h;
    for (const [dx, dy] of [[-8, 2], [8, 2], [-6, -3], [6, -3], [0, -5], [-9, 5], [9, 5]]) PX.path(c, tx, ty, tx + dx, ty + dy, 2, dy < 0 ? '#3d9a4a' : '#2c7a3a');
    R(c, tx - 1, ty, 3, 2, '#6e4a28');
  }
  function bush(c, x, y, s = 1) {
    for (const [dx, dy, r, col] of [[-4, 0, 4, '#2c7a3a'], [4, 0, 4, '#2c7a3a'], [0, -3, 5, '#3d9a4a'], [-2, -5, 3, '#4fb35a']]) PX.ellipse(c, x + dx * s, y + dy * s, r * s, r * s * .8, col);
  }
  function potPalm(c, x, y) {
    R(c, x - 4, y - 5, 9, 5, '#b5562e'); R(c, x - 4, y - 5, 9, 1, '#d8743e'); R(c, x - 3, y - 1, 7, 1, '#8a3e20');
    for (const [dx, dy] of [[-8, -8], [8, -8], [-6, -13], [6, -13], [0, -15], [-9, -4], [9, -4]]) PX.path(c, x, y - 5, x + dx, y - 5 + dy, 2, dy < -10 ? '#4fb35a' : '#2f8a3e');
  }
  function flowers(c, x, y, rnd) { for (let i = 0; i < 6; i++) { const fx = x + Math.floor(rnd() * 10) - 5, fy = y + Math.floor(rnd() * 4) - 2; R(c, fx, fy, 2, 2, ['#ff9ad5', '#f4d35e', '#ff6a5a', '#ffffff'][i % 4]); } }
  function lotus(c, x, y, flower) {
    PX.ellipse(c, x, y, 6, 3, '#3f8f3a'); PX.ellipse(c, x - 1, y - 1, 5, 2, '#5aae4a'); R(c, x + 1, y - 1, 3, 1, '#2f7a72');
    if (flower) { R(c, x - 2, y - 4, 5, 3, '#ff9ad5'); R(c, x - 1, y - 6, 3, 2, '#ffb8e4'); R(c, x, y - 7, 1, 1, '#ffe0f2'); R(c, x - 3, y - 2, 1, 1, '#e86aa8'); R(c, x + 3, y - 2, 1, 1, '#e86aa8'); }
  }
  function lamp(c, x, y) {
    R(c, x - 3, y - 2, 7, 3, '#4a301a'); R(c, x, y - 22, 2, 20, '#3b2414');
    R(c, x - 3, y - 30, 8, 8, '#3b2414'); R(c, x - 2, y - 29, 6, 6, '#ffc65a'); R(c, x - 1, y - 28, 2, 2, '#fff0b8');
    R(c, x - 4, y - 32, 10, 2, '#7a2a1a'); R(c, x - 2, y - 34, 6, 2, '#7a2a1a');
  }
  function stall(c, x, y, w, cols, th) {
    // posts, counter of fruit, striped scalloped awning
    R(c, x + 1, y + 8, 2, 40, '#5a3518'); R(c, x + w - 3, y + 8, 2, 40, '#5a3518');
    R(c, x + 3, y + 14, w - 6, 18, '#5c3a22'); for (let i = 0; i < 3; i++) R(c, x + 4, y + 18 + i * 6, w - 8, 1, '#7a4a26');
    for (let i = 0; i < 3; i++) for (let k = 0; k < (w - 10) / 4; k++) R(c, x + 5 + k * 4, y + 15 + i * 6, 3, 3, FRUIT[(k + i * 2) % 5]);
    const cy = y + 34; R(c, x, cy, w, 12, '#8a5630'); R(c, x, cy, w, 3, '#b07a44'); for (let i = x + 3; i < x + w; i += 6) R(c, i, cy + 4, 1, 8, '#6e4224');
    for (let k = 0; k < w - 6; k += 5) { PX.ellipse(c, x + 5 + k, cy - 1, 2, 2, FRUIT[(k / 5) % 5]); }
    th.stallFronts.push([x, cy, w]);
    for (let i = 0; i < w + 4; i++) { const col = Math.floor(i / 5) % 2 ? cols[1] : cols[0]; R(c, x - 2 + i, y, 1, 9, col); if (i % 5 > 0 && i % 5 < 4) R(c, x - 2 + i, y + 9, 1, 1 + (i % 5 === 2), col); }
    R(c, x - 2, y, w + 4, 1, PX.shade(cols[0], .3));
  }
  function swag(c, x1, y1, x2, y2, sag, t) {
    const n = Math.floor((x2 - x1) / 7);
    for (let i = 0; i <= n; i++) {
      const k = i / n, x = Math.round(x1 + (x2 - x1) * k), y = Math.round(y1 + (y2 - y1) * k + Math.sin(k * Math.PI) * sag), f = Math.round(Math.sin(t * 3 + i) * .6);
      R(c, x, y, 1, 1, '#6e4a28');
      if (i < n) { const col = FLAG[(i + x1) % 6]; R(c, x + 1, y + 1, 5, 1, col); R(c, x + 2, y + 2, 3, 1 + f, col); R(c, x + 3, y + 3 + f, 1, 1, col); }
    }
  }

  const ripples = Array.from({ length: 70 }, () => ({ x: Math.random() * 400, y: WATER_TOP + 6 + Math.random() * (WATER_BOT - WATER_TOP - 10), v: 3 + Math.random() * 5, l: 2 + (Math.random() * 4 | 0), p: Math.random() * 6 }));
  const leaves = Array.from({ length: 6 }, () => ({ x: Math.random() * 400, y: WATER_TOP + 10 + Math.random() * 80, v: 2 + Math.random() * 3 }));

  function hat(c, px, fy) { // งอบ: a low, wide woven dome that sits right on the head
    const ink = '#2b1a0e', rows = [[-19, 2], [-18, 4], [-17, 6], [-16, 8], [-15, 9]];
    for (const [dy, hw] of rows) {
      const y = fy + dy, l = px - hw, r = px + hw;
      R(c, l - 1, y, 1, 1, ink); R(c, r, y, 1, 1, ink);
      for (let x = l; x < r; x++) {
        const lit = x < px - 1, shade = x >= px + 2;
        const weave = ((x - px) + (dy & 1)) & 1;   // alternating straw strips
        R(c, x, y, 1, 1, lit ? (weave ? '#f2d898' : '#e6c682') : shade ? (weave ? '#c9a05a' : '#b88e4c') : (weave ? '#e8c987' : '#d8b46e'));
      }
    }
    R(c, px - 2, fy - 20, 4, 1, ink); R(c, px - 1, fy - 19, 1, 1, '#fff0c0');
    // brim rim, drooping at the tips, with the dark woven underside peeking out
    R(c, px - 9, fy - 15, 18, 1, '#c99d58'); R(c, px - 7, fy - 14, 14, 1, '#6e4a28');
    R(c, px - 10, fy - 15, 1, 2, ink); R(c, px + 9, fy - 15, 1, 2, ink); R(c, px - 9, fy - 14, 2, 1, ink); R(c, px + 7, fy - 14, 2, 1, ink);
    R(c, px - 5, fy - 13, 10, 1, 'rgba(50,25,8,.38)'); // shade cast on the brow
  }
  function vendor(c, a, frame, t, withBoat) {
    const bob = withBoat ? Math.round(Math.sin(t * 2.2 + a.id) * .6) : 0;
    const x = Math.round(a.x), y = Math.round(a.y) + bob, L = a.isSub ? 16 : 22, dir = a.flip ? -1 : 1;
    const px = withBoat ? x - dir * 4 : x, fy = withBoat ? y + 3 : y;
    if (withBoat) {
      if (a.walking) for (let i = 0; i < 3; i++) R(c, x - dir * (L / 2 + 3 + i * 4), y + 1 + (i % 2), 3, 1, `rgba(220,255,245,${.55 - i * .15})`);
      PX.ellipse(c, x, y + 2, L / 2 + 1, 2, 'rgba(10,50,50,.35)');
    }
    PX.person(c, px, fy, { top: a.color, pants: '#2b2f4a', hat: 'none', face: 'cool', skin: '#e2a878', hair: '#1e140e', frame: withBoat ? 0 : frame, work: a.mode === 'work', t, flip: a.flip });
    if (a.isSub) { R(c, px - 4, fy - 13, 8, 1, a.color); R(c, px + 3, fy - 13, 2, 2, a.color); }
    else hat(c, px, fy);
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
  function emptyBoat(c, x, y, L = 22) {
    PX.ellipse(c, x, y + 2, L / 2 + 1, 2, 'rgba(10,50,50,.35)');
    R(c, x - L / 2 + 2, y - 1, L - 4, 1, '#9a6438'); R(c, x - L / 2 + 2, y - 2, L - 4, 1, '#3d220d');
    R(c, x - L / 2, y, L, 2, '#5a3518'); R(c, x - L / 2 + 2, y + 2, L - 4, 1, '#3d220d');
    R(c, x - L / 2 - 1, y - 3, 2, 3, '#5a3518'); R(c, x + L / 2 - 1, y - 3, 2, 3, '#5a3518');
    PX.path(c, x - 6, y - 2, x + 5, y - 1, 1, '#a8703f');
  }

  registerTheme({
    id: 'market',
    name: 'Floating Market',
    icon: '🛶',
    title: 'ตลาดน้ำ Agent',
    location: 'คลองดำเนินโค้ด',
    ui: { bg: '#0c2422', bg2: '#1c4a45', panel: '#1f4a47', edge: '#0b1f1d', line: '#3f8077', accent: '#ffb547', text: '#fff6e4', sub: '#bfe0d6', chip: '#163836' },
    unitIcon: '🍃',
    toolIcons: { read: '📚', edit: '🍜', bash: '▶️', web: '🔍' },
    crew: ['แม่ค้าโค้ด (Dev)', 'แม่ค้าดีไซน์', 'แม่ค้าชิม (QA)', 'แม่ค้าขนส่ง', 'แม่ค้าหาข่าว', 'แม่ค้าจดบันทึก', 'แม่ค้าคุมเรือ'],
    lead: { name: 'ป้าแดง', title: 'เจ้าของท่าเรือ' },
    mission: { title: 'ส่งของ 20 ห่อก่อนตลาดวาย', goal: 20, timeText: '⏱ ตลาดเปิด 07:00–12:00' },
    queue: { dx: -26, gap: 24, alt: 4 },
    words: {
      intake: 'รับคำสั่งใหม่ที่แผงริมตลิ่ง', helper: 'ตะโกนเรียกหลานมาช่วย', helperName: '%s น้อย',
      wrap: 'ตรวจของ · สรุปงาน', wrapIcon: '⚙️', carry: 'พายเรือเอาของไปท่าส่ง',
      delivered: 'ส่ง “%s” ลงเรือใหญ่แล้ว', carrierGone: '🛥️ เรือใหญ่ออกส่งของ %n ห่อ!', waitCarrier: 'รอเรือใหญ่กลับมา',
      rest: 'นั่งพักบนแพ รองานใหม่', restIcon: '🥥',
      permAsk: 'ขออนุญาตป้าแดง', leadAuto: 'ป้าแดงโบกมืออนุญาต ✅', youApprove: 'คุณอนุญาตแทนป้าแดง ✅',
      error: 'เรือโคลง ของหกลงน้ำ!', errorIcon: '💦', compact: 'เรือเต็ม! ขนของขึ้นฝั่ง (compact)', compactIcon: '⚓',
      leadIdle: 'นั่งจดบัญชีที่ศาลา', inspect: 'พายเรือให้ป้าแดงตรวจของ', leadBusy: 'มีเรือรอขออนุญาต %n ลำ',
    },
    places: {
      read: { x: 68, y: 86, jx: 6, jy: 2 }, permission: { x: 200, y: 88 }, web: { x: 336, y: 86, jx: 6, jy: 2 },
      edit: { x: 72, y: 162, jx: 4, jy: 2 }, bash: { x: 150, y: 163, jx: 6, jy: 2 }, wrap: { x: 250, y: 163, jx: 6, jy: 2 },
      intake: { x: 322, y: 162, jx: 4, jy: 2 }, deliver: { x: 334, y: 140, jx: 4, jy: 2 },
      idle: { x: 120, y: 121, jx: 18, jy: 3 },
    },
    signStyle: 'big',
    signs: [
      { x: 68, y: 9, text: 'ห้องสมุดร้านค้า', sub: 'Read · Grep', icon: '📖' },
      { x: 200, y: 9, text: 'ศูนย์ผู้ใช้งาน', sub: 'Permission', icon: '🙋' },
      { x: 336, y: 9, text: 'หอกรองข่าว', sub: 'Web search', icon: '🔍' },
      { x: 114, y: 140, text: 'แพพักรองาน', sub: 'Waiting raft', icon: '🥥', small: true },
      { x: 374, y: 92, text: 'ท่าเรือส่งงาน', sub: 'Dispatch · ส่งงาน', icon: '🛥️', small: true },
      { x: 62, y: 223, text: 'แผงตลาดน้ำ', sub: 'Edit · Write', icon: '🍜' },
      { x: 152, y: 223, text: 'ท่ารันงาน', sub: 'Bash · Test', icon: '▶️' },
      { x: 250, y: 223, text: 'ท่าตรวจงาน', sub: 'สรุปงาน · Logs', icon: '⚙️' },
      { x: 344, y: 223, text: 'คำสั่งใหม่', sub: 'งานใหม่ · Queue', icon: '📋' },
    ],

    drawStatic(c) {
      const rnd = PX.rng(1983);
      this.lanterns = []; this.stallFronts = [];
      // top bank: jungle behind, packed earth in front
      R(c, 0, 0, 400, WATER_TOP, '#9c7a4a'); PX.speckle(c, 0, 20, 400, 40, ['#8a6a3e', '#ad8a58'], .05, rnd);
      for (let x = -6; x < 410; x += 9) bush(c, x, 10 + Math.floor(rnd() * 8), 1.4 + rnd() * .5);
      for (const [x, h] of [[8, 34], [130, 30], [150, 24], [258, 28], [272, 32], [392, 34]]) palm(c, x, 50, h);
      // bottom boardwalk area + a strip of canal at the very bottom
      R(c, 0, WATER_BOT, 400, 240 - WATER_BOT, '#b08050');
      for (let y = WATER_BOT; y < 232; y += 6) { R(c, 0, y, 400, 1, '#93683e'); for (let x = (y / 6 % 2) * 20; x < 400; x += 40) R(c, x, y, 1, 6, '#93683e'); }
      R(c, 0, 230, 400, 10, '#2f9aa8'); R(c, 0, 230, 400, 1, '#6e4a28');
      // canal: bright turquoise, deeper in the middle
      for (let y = WATER_TOP; y < WATER_BOT; y++) {
        const k = Math.min(y - WATER_TOP, WATER_BOT - y) / 50;
        R(c, 0, y, 400, 1, k < .06 ? '#1f7f8a' : k < .14 ? '#2590a0' : k < .3 ? '#2ba2b0' : k < .5 ? '#31afbb' : '#36b8c2');
      }
      PX.speckle(c, 0, WATER_TOP, 400, WATER_BOT - WATER_TOP, ['#48c4cc', '#2a98a6'], .015, rnd);
      // top boardwalk with a rail of pilings along the water
      R(c, 0, 54, 400, 18, '#b08050'); for (let x = 0; x < 400; x += 5) R(c, x, 54, 1, 18, '#93683e'); R(c, 0, 54, 400, 1, '#c99a64');
      R(c, 0, 71, 400, 2, '#6e4a28');
      for (let x = 6; x < 400; x += 18) { R(c, x, 64, 4, 14, '#6e4a28'); R(c, x, 64, 4, 1, '#a8784a'); R(c, x + 1, 77, 2, 2, 'rgba(10,50,50,.3)'); }
      R(c, 0, 66, 400, 1, '#5a3518');
      // houses on the top bank
      thaiHouse(c, 26, 6, 86, 48, { roof: '#c0452e', roofDark: '#9a3420', awning: '#e8553f', inside: (g, x, y, w, h) => {
        for (const sx of [x, x + w - 22]) { R(g, sx, y, 22, h, '#5c3a22'); for (let yy = y + 1; yy < y + h - 2; yy += 6) { R(g, sx + 1, yy + 5, 20, 1, '#7a4a26'); for (let bx = sx + 2; bx < sx + 20; bx += 2) R(g, bx, yy + (rnd() < .3 ? 1 : 0), 1, 5 - (rnd() < .3 ? 1 : 0), FLAG[Math.floor(rnd() * 5)]); } }
        R(g, x + 30, y + h - 9, 12, 8, '#2a2a30'); R(g, x + 31, y + h - 8, 10, 5, '#3a5a4a'); R(g, x + 33, y + h - 7, 5, 1, '#f6efe0');
      } }, this);
      thaiHouse(c, 158, 4, 84, 50, { roof: '#2f5f9a', roofDark: '#234a7a', inside: (g, x, y, w, h) => {
        for (const [bx, cols] of [[x + 2, ['#f4d35e', '#e8553f', '#3a7bd5']], [x + w - 20, ['#7fc35a', '#ff9ad5', '#f2a03a']]]) {
          R(g, bx, y + 1, 18, h - 4, '#f6efe0'); R(g, bx, y + 1, 18, 1, '#a8703f');
          for (let k = 0; k < 4; k++) R(g, bx + 2 + (k % 2) * 8, y + 3 + Math.floor(k / 2) * 7, 6, 5, cols[k % 3]);
        }
      } }, this);
      thaiHouse(c, 286, 6, 100, 48, { roof: '#c0452e', roofDark: '#9a3420', awning: '#f4d35e', inside: (g, x, y, w, h) => {
        R(g, x + 3, y + 3, 14, 10, '#6e4a28'); R(g, x + 5, y + 5, 6, 6, '#2a2a30'); R(g, x + 12, y + 5, 3, 2, '#e8553f'); R(g, x + 12, y + 9, 3, 1, '#9aa3aa');
        for (const [bx, by] of [[x + 26, y + h - 8], [x + 36, y + h - 8], [x + 31, y + h - 14], [x + 60, y + h - 8], [x + 70, y + h - 8]]) { R(g, bx, by, 9, 7, '#c9a35a'); R(g, bx, by, 9, 1, '#e4c47e'); R(g, bx + 4, by, 1, 7, '#8a6238'); }
        PX.ellipse(g, x + 52, y + 6, 4, 4, '#e8553f'); PX.ellipse(g, x + 52, y + 6, 2, 2, '#3b2414'); R(g, x + 49, y + 5, 2, 2, '#ffffff'); R(g, x + 54, y + 5, 2, 2, '#ffffff');
      } }, this);
      R(c, 372, 0, 2, 10, '#555'); R(c, 368, 3, 10, 1, '#555'); R(c, 366, 1, 4, 3, '#9aa3aa');
      // lead's desk in front of the centre house is drawn in drawLead; potted palms and flowers along the top walk
      for (const x of [140, 258]) potPalm(c, x, 66);
      for (const x of [14, 120, 150, 250, 280, 394]) flowers(c, x, 60, rnd);
      R(c, 120, 58, 10, 5, '#a8703f'); R(c, 250, 58, 10, 5, '#a8703f');
      // life ring on the news house dock
      PX.ellipse(c, 300, 62, 5, 5, '#e8553f'); PX.ellipse(c, 300, 62, 3, 3, '#b08050'); R(c, 296, 61, 2, 2, '#ffffff'); R(c, 303, 61, 2, 2, '#ffffff');
      // reflections of the houses
      for (const [x, w, col] of [[26, 86, '#8a5630'], [158, 84, '#2f5f9a'], [286, 100, '#9a3420']])
        for (let y = WATER_TOP + 3; y < WATER_TOP + 16; y += 2) R(c, x + ((y / 2) % 3) - 1, y, w, 1, col + '40');
      // lotus + lily pads
      for (const [x, y] of [[54, 98], [62, 104], [138, 94], [146, 98], [200, 120], [226, 112], [250, 120], [276, 96], [290, 140], [176, 150], [30, 146], [200, 140], [300, 104]]) lotus(c, x, y, rnd() < .6);
      // moored fruit boat on the left
      PX.ellipse(c, 24, 126, 26, 3, 'rgba(10,50,50,.35)');
      R(c, 2, 112, 40, 12, '#5a3518'); R(c, 4, 110, 36, 3, '#8a5630');
      for (let k = 0; k < 9; k++) PX.ellipse(c, 7 + k * 4, 109, 2, 2, FRUIT[k % 5]);
      for (const px of [5, 38]) R(c, px, 94, 1, 16, '#6e4a28');
      for (let i = 0; i < 40; i++) R(c, 2 + i, 92, 1, 5, Math.floor(i / 5) % 2 ? '#f6efe0' : '#e8553f');
      R(c, 0, 123, 46, 2, '#3d220d');

      // ── waiting raft: bamboo deck, thatched hut, cushions and coconuts; two empty boats tied alongside
      const { x: rx, y: ry, w: rw, h: rh } = RAFT;
      PX.ellipse(c, rx + rw / 2, ry + rh + 1, rw / 2 + 4, 4, 'rgba(10,50,50,.3)');
      for (let i = 0; i < rh; i += 3) { R(c, rx, ry + i, rw, 3, i % 6 ? '#d8b46a' : '#c9a35a'); R(c, rx, ry + i + 2, rw, 1, '#a8843f'); for (let x = rx + 7; x < rx + rw; x += 14) R(c, x, ry + i, 1, 2, '#a8843f'); }
      R(c, rx - 1, ry + rh, rw + 2, 2, '#6e5a2a');
      for (const lx of [rx + 2, rx + rw - 4]) R(c, lx, ry + 1, 2, rh - 1, '#8a6238');
      // hut at the back-left of the raft
      for (const px of [rx + 3, rx + 30]) R(c, px, ry - 12, 2, 14, '#6e4a28');
      for (let i = 0; i < 9; i++) { const ins = 9 - i; R(c, rx - 1 + ins, ry - 22 + i, 37 - ins * 2, 1, i % 2 ? '#c9a35a' : '#e4c47e'); }
      R(c, rx - 2, ry - 13, 39, 2, '#a8843f'); for (let x = rx - 2; x < rx + 37; x += 2) R(c, x, ry - 11, 1, 1 + (x % 4 === 0), '#a8843f');
      R(c, rx + 6, ry - 6, 22, 6, '#e8553f'); R(c, rx + 6, ry - 6, 22, 1, '#ff7a6a'); R(c, rx + 16, ry - 6, 1, 6, '#f4d35e');
      R(c, rx + 42, ry + 6, 10, 4, '#6e4224'); R(c, rx + 42, ry + 5, 10, 1, '#a8703f');
      for (const cx of [rx + 44, rx + 49]) { PX.ellipse(c, cx, ry + 4, 2, 2, '#7a9a3a'); R(c, cx, ry + 1, 1, 2, '#f6efe0'); }
      R(c, rx + 36, ry - 14, 1, 16, '#3b2414'); R(c, rx + 34, ry - 18, 5, 5, '#ff8a3a'); R(c, rx + 35, ry - 17, 3, 3, '#ffd77a'); this.lanterns.push([rx + 36, ry - 15]);
      potPalm(c, rx + 56, ry + 8);
      for (const [bx, by] of [[rx + rw + 14, ry + 6], [rx + rw + 14, ry + 18]]) { emptyBoat(c, bx, by, 20); R(c, rx + rw, by - 1, 4, 1, '#d8b46a'); }

      // ── dispatch dock on the right
      R(c, 352, 96, 48, 56, '#a8784a'); for (let y = 98; y < 152; y += 4) R(c, 352, y, 48, 1, '#8a5e36');
      R(c, 352, 96, 48, 1, '#c99a64'); R(c, 352, 151, 48, 2, '#5a3518');
      for (const [px, py] of [[352, 150], [352, 120], [352, 98]]) { R(c, px - 2, py - 4, 4, 10, '#6e4a28'); R(c, px - 2, py - 4, 4, 1, '#a8784a'); }
      lamp(c, 362, 116); this.lamps = [[362, 116]];
      R(c, 380, 138, 9, 7, '#c9a35a'); R(c, 380, 138, 9, 1, '#e4c47e'); R(c, 390, 140, 7, 5, '#4f9a3f'); R(c, 392, 140, 1, 5, '#e4c47e');
      R(c, 392, 100, 1, 12, '#6e4a28'); R(c, 393, 100, 6, 4, '#ff9ad5');

      // ── bottom boardwalk: rail posts at the water edge, stalls, lamps, centre pier
      for (let x = 4; x < 400; x += 18) if (x > 64 && x < 290) { R(c, x, 166, 4, 12, '#6e4a28'); R(c, x, 166, 4, 1, '#a8784a'); }
      R(c, 64, WATER_BOT, 226, 2, '#6e4a28');
      R(c, 176, WATER_BOT, 48, 58, '#a8784a'); for (let y = WATER_BOT + 2; y < 230; y += 4) R(c, 176, y, 48, 1, '#8a5e36');
      for (const px of [176, 222]) R(c, px, WATER_BOT - 4, 3, 60, '#6e4a28');
      R(c, 190, 206, 20, 8, '#8a5630'); R(c, 190, 206, 20, 1, '#b07a44'); flowers(c, 200, 203, rnd); bush(c, 200, 202, .8);
      for (const x of [143, 273]) lamp(c, x, 206); this.lamps.push([143, 206], [273, 206]);
      stall(c, 4, 150, 58, ['#e8553f', '#f6efe0'], this);
      stall(c, 296, 156, 40, ['#3a7bd5', '#f6efe0'], this);
      stall(c, 340, 152, 56, ['#e8553f', '#f6efe0'], this);
      for (const x of [74, 96, 118, 240]) potPalm(c, x, 200);
      bush(c, 8, 226, 1); bush(c, 392, 226, 1); flowers(c, 110, 214, rnd); flowers(c, 290, 214, rnd);

      // late-morning light: warm multiply, soft edges, gentle rays from the top-left
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#fff2dc'; c.fillRect(0, 0, 400, 240);
      const v = c.createRadialGradient(170, 110, 110, 200, 120, 270); v.addColorStop(0, '#ffffff'); v.addColorStop(1, '#8a7a9a');
      c.fillStyle = v; c.fillRect(0, 0, 400, 240); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const [x0, w] of [[-40, 26], [40, 14], [110, 30], [210, 12], [260, 22]]) {
        c.fillStyle = 'rgba(255,210,140,.05)';
        c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + w, 0); c.lineTo(x0 + w + 160, 240); c.lineTo(x0 + 160, 240); c.closePath(); c.fill();
      }
      c.restore();
      for (const [x, y] of this.lanterns) PX.glow(c, x, y + 4, 12, '255,170,80', .28, .6);
      for (const [x, y] of this.lamps) PX.glow(c, x + 1, y - 2, 22, '255,190,110', .25, .45);
    },

    drawAmbient(c, t) {
      // flowing ripples, gentle rings around the raft
      for (const r of ripples) {
        const x = Math.round((r.x + t * r.v) % 410) - 5;
        if (onRaft(x, r.y) || (x > 350 && r.y > 94 && r.y < 154)) continue;
        if (Math.sin(t * 1.5 + r.p) > -.4) R(c, x, r.y, r.l, 1, 'rgba(210,250,245,.5)');
      }
      for (let i = 0; i < 6; i++) { const k = (t * .25 + i / 6) % 1; c.fillStyle = `rgba(220,255,250,${.4 * (1 - k)})`; c.fillRect(RAFT.x - 4 - k * 6 + i * 14, RAFT.y + RAFT.h + 2 + k * 2, 4, 1); }
      for (const l of leaves) { const x = Math.round((l.x + t * l.v) % 410) - 5; if (!onRaft(x, l.y)) { R(c, x, l.y, 3, 2, '#5aa04a'); R(c, x + 1, l.y, 1, 1, '#8fd06a'); } }
      // bunting between the houses and over the left stall
      swag(c, 112, 22, 158, 22, 8, t); swag(c, 242, 22, 286, 22, 8, t); swag(c, 0, 26, 26, 26, 4, t); swag(c, 386, 26, 400, 26, 3, t);
      // stall vendors waving behind their counters (counter front redrawn so it hides their legs)
      [[32, 184, '#e8553f'], [316, 190, '#3a7bd5'], [368, 186, '#2f9a57']].forEach(([x, y, col], i) => vendor(c, { x, y, id: 50 + i, color: col, isSub: false, mode: 'work', flip: i === 2 }, 0, t + i * .4, false));
      for (const [x, cy, w] of this.stallFronts) { R(c, x, cy, w, 12, '#8a5630'); R(c, x, cy, w, 3, '#b07a44'); for (let i = x + 3; i < x + w; i += 6) R(c, i, cy + 4, 1, 8, '#6e4224'); for (let k = 0; k < w - 6; k += 5) PX.ellipse(c, x + 5 + k, cy - 1, 2, 2, FRUIT[(k / 5) % 5]); }
    },
    drawWeather(c, t) {
      // sun sparkles drifting along the canal
      for (let i = 0; i < 26; i++) {
        const x = (i * 53 + t * 6) % 400, y = WATER_TOP + 8 + ((i * 37) % (WATER_BOT - WATER_TOP - 16)), on = Math.sin(t * 3 + i * 1.7);
        if (onRaft(x, y)) continue;
        if (on > .6) { R(c, x, y, 1, 1, '#fff8dc'); if (on > .9) { R(c, x - 1, y, 3, 1, '#fff2c0'); R(c, x, y - 1, 1, 3, '#fff2c0'); } }
      }
      for (const [x, y] of this.lanterns) PX.glow(c, x, y, 5 + Math.sin(t * 4 + x) * .8, '255,200,110', .25, 1);
      for (const [x, y] of this.lamps) PX.glow(c, x + 1, y - 26, 8 + Math.sin(t * 3 + x), '255,220,140', .28, 1);
      // two egrets gliding across now and then
      for (let i = 0; i < 2; i++) {
        const k = ((t * .03 + i * .5) % 1), x = -20 + k * 440, y = 30 + i * 18 + Math.sin(t * .8 + i) * 4, f = Math.floor(t * 4 + i) % 2;
        PX.ellipse(c, Math.round(x), Math.round(y + 50), 3, 1, 'rgba(20,60,60,.18)');
        R(c, x - 2, y, 5, 2, '#ffffff'); R(c, x + 3, y - 1, 2, 1, '#ffffff'); R(c, x + 5, y - 1, 2, 1, '#f2b02a');
        R(c, x - 4, y + (f ? -2 : 1), 4, 1, '#f0f0f0'); R(c, x, y + (f ? -2 : 1), 3, 1, '#e6e6e6');
      }
    },

    leadSeat: { x: 200, y: 64 },
    drawLeadChar(c, L, t) { vendor(c, { x: L.x, y: L.y, flip: L.flip, walking: L.walking, id: 99, color: '#c0392b', isSub: false, mode: L.wave > 0 ? 'work' : 'idle' }, L.frame, t, true); },
    drawLead(c, t, busy, L) {
      const x = 200, y = 64;
      if (L.atDesk) PX.person(c, x, y, { top: '#c0392b', pants: '#5a2a5a', hair: '#1e140e', skin: '#e2a878', face: 'cool', hat: 'none', work: busy || L.wave > 0 || L.stamp > 0, t });
      if (L.atDesk) { R(c, x + 1, y - 19, 5, 4, '#24160f'); R(c, x + 2, y - 18, 3, 2, '#3a2418'); R(c, x + 2, y - 17, 3, 1, '#e74c6a'); }
      R(c, x - 14, y - 3, 28, 7, '#6e4224'); R(c, x - 14, y - 4, 28, 2, '#a8703f');
      R(c, x - 11, y - 7, 9, 4, '#3a3a44'); R(c, x - 10, y - 6, 7, 2, '#7fb6d9'); R(c, x + 3, y - 6, 5, 2, '#f6efe0'); R(c, x + 9, y - 6, 3, 2, '#c9a35a');
    },

    drawCarrier(c, car, t) {
      let ox = 0, alpha = 1;
      if (car.phase === 'leaving') { ox = car.t * car.t * 22; alpha = Math.max(0, 1 - car.t / 2.2); }
      else if (car.phase === 'gone') return;
      else if (car.phase === 'returning') alpha = Math.min(1, car.t / 2);
      c.globalAlpha = alpha;
      const x = Math.round(318 + ox), y = 120 + Math.round(Math.sin(t * 1.8) * .6);
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
      c.globalAlpha = 1;
    },

    drawChar(c, a, frame, t) {
      if (a.mode === 'error') { a = { ...a, flip: Math.sin(t * 10) > 0 }; }
      // waiting on the raft: on foot, no boat. Any trip off the raft is by boat.
      vendor(c, a, frame, t, a.walking || !onRaft(a.x, a.y));
    },
    drawPortrait(c, a) { vendor(c, a, 0, 0, false); },
    drawCarry(c, x, y) { R(c, x - 2, y - 5, 5, 3, '#4f9a3f'); R(c, x, y - 5, 1, 3, '#e4c47e'); },
    drawLeadPortrait(c, x, y) {
      PX.person(c, x, y, { top: '#c0392b', pants: '#5a2a5a', hair: '#1e140e', skin: '#e2a878', face: 'cool', hat: 'none' });
      R(c, x + 1, y - 19, 5, 4, '#24160f'); R(c, x + 2, y - 18, 3, 2, '#3a2418'); R(c, x + 2, y - 17, 3, 1, '#e74c6a');
    },
  });
})();
