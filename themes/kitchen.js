/* Theme pack: Restaurant Kitchen — same engine, different skin. */
(() => {
  const R = PX.rect;
  const FOOD = ['#e8553f', '#7fc35a', '#f2a03a', '#c9863f', '#f4d35e'];

  function counter(c, x, y, w, h, top = '#cdd6dc', edge = '#6e7b85', drawers = true) {
    R(c, x + 2, y + h, w, 2, 'rgba(0,0,0,.2)');
    R(c, x, y, w, h, edge); R(c, x, y, w, 6, top); R(c, x, y, w, 1, PX.shade(top, .4)); R(c, x, y + 6, w, 1, PX.shade(edge, -.3));
    if (drawers) for (let i = x + 2; i < x + w - 8; i += 14) {
      R(c, i, y + 8, 12, h - 10, PX.shade(edge, .12)); R(c, i, y + h - 3, 12, 1, PX.shade(edge, -.25)); R(c, i + 5, y + 10, 3, 1, PX.shade(top, .5));
    }
  }
  function plant(c, x, y, s = 1) {
    R(c, x - 3 * s, y - 5 * s, 7 * s, 5 * s, '#b5562e'); R(c, x - 3 * s, y - 5 * s, 7 * s, 1, '#d8743e'); R(c, x - 3 * s, y - 1, 7 * s, 1, '#8a3e20');
    const leaves = [[-3, -8, '#2f7d3a'], [1, -9, '#3f9a46'], [-1, -11, '#4fae52'], [3, -7, '#2f7d3a'], [-4, -6, '#3f9a46'], [0, -13, '#5cbf5c']];
    for (const [dx, dy, col] of leaves) R(c, x + dx * s, y + dy * s, 2 * s + 1, 3 * s, col);
  }
  function plate(c, x, y, food) {
    PX.ellipse(c, x, y, 6, 3, '#9aa3aa'); PX.ellipse(c, x, y - 1, 6, 2, '#ffffff');
    PX.ellipse(c, x, y - 2, 3, 1, food); R(c, x - 1, y - 3, 2, 1, PX.shade(food, .35)); R(c, x + 1, y - 2, 1, 1, '#7bc96f');
  }
  function bowl(c, x, y, food) {
    R(c, x - 5, y - 3, 10, 4, '#e8e2d6'); R(c, x - 4, y + 1, 8, 1, '#b8b0a2');
    for (let i = 0; i < 4; i++) R(c, x - 4 + i * 2, y - 5 + (i % 2), 3, 2, i % 2 ? food : PX.shade(food, .25));
  }
  function jar(c, x, y, fill) {
    R(c, x, y, 7, 9, '#cfe2ea'); R(c, x + 1, y + 3, 5, 5, fill); R(c, x + 1, y + 1, 1, 6, '#ffffff99');
    R(c, x - 1, y - 2, 9, 2, '#c58b4f'); R(c, x, y - 3, 7, 1, '#e0a868');
  }
  function sconce(c, x, y) { R(c, x - 1, y, 3, 3, '#6b4424'); R(c, x - 2, y - 6, 5, 6, '#ffd77a'); R(c, x - 2, y - 7, 5, 1, '#6b4424'); R(c, x - 1, y - 5, 2, 2, '#fff4c9'); }

  const steam = Array.from({ length: 48 }, () => ({ k: Math.random(), s: Math.random() }));

  registerTheme({
    id: 'kitchen',
    name: 'Restaurant Kitchen',
    icon: '🍳',
    title: 'Agent Kitchen',
    location: 'ครัวหลังร้าน',
    ui: { bg: '#16191c', bg2: '#2a2f33', panel: '#2c3439', edge: '#111517', line: '#55636b', accent: '#ff9f43', text: '#f6f2ea', sub: '#b9c4ca', chip: '#1e2427' },
    unitIcon: '🍽️',
    toolIcons: { read: '📖', edit: '🔪', bash: '🔥', web: '🧺' },
    crew: ['Sous Chef', 'Pastry Chef', 'Line Cook', 'Expo Chef', 'Prep Cook', 'Saucier', 'Grill Cook'],
    lead: { name: 'Head Chef', title: 'หัวหน้าเชฟ' },
    mission: { title: 'เสิร์ฟ 20 จานรอบดินเนอร์', goal: 20, timeText: '⏱ รอบดินเนอร์ 18:00–22:00' },
    words: {
      intake: 'รับใบออเดอร์', helper: 'ตะโกนเรียกลูกมือ', helperName: 'ลูกมือ %s',
      wrap: 'ตรวจจาน · สรุปงาน', wrapIcon: '✅', carry: 'ยกจานไปช่องเสิร์ฟ',
      delivered: 'วาง “%s” ที่ช่องเสิร์ฟแล้ว', carrierGone: '🛎️ เสิร์ฟออกไป %n จาน!', waitCarrier: 'รอพนักงานเสิร์ฟ',
      rest: 'ชิมซุปที่โต๊ะกลาง', restIcon: '🥄',
      permAsk: 'ขอให้หัวหน้าเชฟชิมก่อน', leadAuto: 'หัวหน้าเชฟพยักหน้าให้ ✅', youApprove: 'คุณอนุมัติแทนหัวหน้าเชฟ ✅',
      error: 'ไฟลุกกระทะ! ทำใหม่', errorIcon: '🔥', compact: 'เคาน์เตอร์ล้น! เคลียร์ context', compactIcon: '🧽',
      leadIdle: 'ยืนคุมไลน์', inspect: 'ยกจานให้หัวหน้าเชฟชิม', leadBusy: 'มีจานรอชิม %n',
    },
    places: {
      intake: { x: 200, y: 193 }, read: { x: 42, y: 112 }, edit: { x: 74, y: 64 }, bash: { x: 326, y: 64 },
      web: { x: 356, y: 112 }, permission: { x: 200, y: 66 }, wrap: { x: 92, y: 142 }, deliver: { x: 318, y: 150 },
      idle: { x: 200, y: 146, jx: 40, jy: 5 },
    },
    signStyle: 'big',
    signs: [
      { x: 74, y: 9, text: 'Prep Station', sub: 'Edit · Write', icon: '🔪' },
      { x: 200, y: 9, text: 'Head Chef Pass', sub: 'Permission', icon: '👨‍🍳' },
      { x: 326, y: 9, text: 'Stove Line', sub: 'Bash · Test', icon: '🔥' },
      { x: 32, y: 70, text: 'Recipe Books', sub: 'Read · Grep', icon: '📖' },
      { x: 372, y: 70, text: 'Pantry', sub: 'Web search', icon: '🧺', small: true },
      { x: 90, y: 176, text: 'Quality Check', sub: 'สรุปงาน', icon: '✅' },
      { x: 366, y: 142, text: 'Service Hatch', sub: 'ส่งงาน', icon: '🛎️' },
      { x: 200, y: 222, text: 'Order Tickets', sub: 'งานใหม่', icon: '🎫' },
      { x: 334, y: 222, text: 'Cleaning Station', sub: 'ล้าง · เก็บ', icon: '✨', small: true },
    ],

    drawStatic(c) {
      const rnd = PX.rng(77);
      // terracotta tile floor
      for (let y = 34; y < 218; y += 8) for (let x = 0; x < 400; x += 8) {
        const base = ((x + y) / 8) % 2 ? '#c98a5c' : '#bd7d50';
        R(c, x, y, 8, 8, base); R(c, x, y, 8, 1, PX.shade(base, .12)); R(c, x, y + 7, 8, 1, '#a0643f'); R(c, x + 7, y, 1, 8, '#a0643f');
      }
      PX.speckle(c, 0, 34, 400, 184, ['#00000014', '#ffffff14'], .04, rnd);
      // back wall: warm brick, a dark beam and a baseboard
      R(c, 0, 0, 400, 35, '#c27a4c');
      for (let y = 0; y < 34; y += 4) { R(c, 0, y + 3, 400, 1, '#a35f36'); for (let x = (y / 4) % 2 * 5; x < 400; x += 10) R(c, x, y, 1, 3, '#a35f36'); }
      PX.speckle(c, 0, 0, 400, 34, ['#d18a5a', '#b56c40'], .05, rnd);
      R(c, 0, 18, 400, 3, '#5c3a22'); R(c, 0, 18, 400, 1, '#7a5030');
      R(c, 0, 32, 400, 3, '#4a2e1c'); R(c, 0, 32, 400, 1, '#6b4424');
      this.sconces = [[12, 30], [140, 30], [260, 30], [388, 30]];
      for (const [x, y] of this.sconces) sconce(c, x, y);
      // hanging planters over the pass
      for (const x of [146, 254]) { R(c, x, 0, 1, 10, '#3b2a1e'); R(c, x - 4, 10, 9, 4, '#7a4a26'); for (let i = 0; i < 5; i++) R(c, x - 5 + i * 2, 6 + (i % 2), 2, 5, i % 2 ? '#3f9a46' : '#2f7d3a'); R(c, x - 2, 14, 5, 2, '#ffd77a'); }
      // side + bottom walls
      R(c, 0, 34, 4, 184, '#4a2e20'); R(c, 396, 34, 4, 184, '#4a2e20');
      R(c, 0, 214, 400, 26, '#3d2b20'); for (let x = 0; x < 400; x += 10) R(c, x, 214, 1, 26, '#33241a'); R(c, 0, 214, 400, 2, '#5c4232');
      // mats in front of each station
      for (const [x, y, w] of [[48, 60, 52], [176, 60, 48], [300, 60, 52], [172, 132, 56]]) {
        R(c, x, y, w, 10, '#3a3f45'); R(c, x + 1, y + 1, w - 2, 8, '#4a3a34'); for (let i = x + 3; i < x + w - 2; i += 3) R(c, i, y + 2, 1, 6, '#5a463e');
      }

      // cool blue-tile backsplash behind the work stations
      for (const [x0, x1] of [[20, 128], [274, 378]]) {
        R(c, x0, 22, x1 - x0, 13, '#a9cfdc');
        for (let y = 22; y < 35; y += 4) { R(c, x0, y + 3, x1 - x0, 1, '#7fa8b8'); for (let x = x0 + ((y - 22) / 4 % 2) * 3; x < x1; x += 6) R(c, x, y, 1, 3, '#7fa8b8'); }
        R(c, x0, 22, x1 - x0, 1, '#d6eef5'); R(c, x0 - 1, 21, 1, 14, '#5c3a22'); R(c, x1, 21, 1, 14, '#5c3a22');
      }
      // ── Prep station: utensil rail, boards of veg, salad bowl, little sink
      R(c, 30, 22, 96, 1, '#2b2b30');
      for (let i = 0; i < 9; i++) { const x = 34 + i * 10; R(c, x, 23, 1, 3, '#2b2b30');
        if (i % 3 === 0) { PX.ellipse(c, x, 29, 3, 2, '#3a3a40'); } else if (i % 3 === 1) { R(c, x, 26, 1, 5, '#9aa3aa'); PX.ellipse(c, x, 31, 2, 1, '#9aa3aa'); } else { R(c, x - 1, 26, 2, 6, '#c8ced3'); R(c, x - 1, 26, 2, 2, '#6b4424'); } }
      counter(c, 22, 36, 104, 20);
      R(c, 28, 38, 24, 5, '#c58b4f'); R(c, 28, 42, 24, 1, '#8f6234');
      R(c, 56, 38, 22, 5, '#c58b4f'); R(c, 56, 42, 22, 1, '#8f6234');
      for (const [x, col] of [[31, '#4fae52'], [36, '#3f9a46'], [42, '#e8553f'], [46, '#e8553f']]) PX.ellipse(c, x, 39, 2, 2, col);
      for (let i = 0; i < 5; i++) R(c, 59 + i * 3, 39, 2, 2, i % 2 ? '#f2a03a' : '#e8553f');
      R(c, 70, 39, 5, 1, '#c8ced3'); R(c, 75, 39, 2, 1, '#3b2212');
      bowl(c, 89, 41, '#7fc35a');
      R(c, 104, 37, 18, 6, '#8e9aa3'); R(c, 106, 38, 14, 4, '#5c6b75'); R(c, 112, 33, 2, 5, '#c8ced3'); R(c, 112, 33, 5, 1, '#c8ced3');

      // ── Head chef pass: dark gantry with heat lamps (counter + plates drawn in drawLead)
      R(c, 156, 20, 88, 3, '#2b2b30'); R(c, 156, 20, 2, 24, '#2b2b30'); R(c, 242, 20, 2, 24, '#2b2b30');
      for (const x of [170, 186, 214, 230]) { R(c, x, 23, 1, 6, '#2b2b30'); R(c, x - 3, 29, 7, 3, '#2b2b30'); R(c, x - 2, 32, 5, 2, '#ffd77a'); }
      R(c, 162, 34, 8, 8, '#cfd6db'); R(c, 163, 35, 6, 5, '#7fb6d9');
      R(c, 232, 34, 6, 8, '#e8e2d6'); R(c, 233, 35, 4, 2, '#9aa3aa');
      plant(c, 146, 58); plant(c, 254, 58);

      // ── Stove line: range with knobs, pots, spice shelf
      R(c, 280, 22, 92, 2, '#6b4424'); for (let i = 0; i < 10; i++) R(c, 284 + i * 9, 18, 5, 4, ['#e8553f', '#f4d35e', '#7fc35a', '#c9863f', '#ffffff'][i % 5]);
      R(c, 276, 36, 100, 20, '#2e2e33'); R(c, 276, 46, 100, 10, '#3a3a42'); R(c, 276, 55, 100, 1, '#1c1c20'); R(c, 276, 36, 100, 1, '#55555c');
      for (let x = 281; x < 374; x += 8) { PX.ellipse(c, x, 50, 1, 1, '#c8ced3'); R(c, x - 2, 53, 5, 1, '#202024'); }
      this.burners = [];
      for (let i = 0; i < 4; i++) { const bx = 288 + i * 24; PX.ellipse(c, bx, 42, 6, 3, '#18181b'); PX.ellipse(c, bx, 42, 4, 2, '#3c3c44'); this.burners.push([bx, 42]); }
      R(c, 282, 34, 12, 7, '#7e8a94'); PX.ellipse(c, 288, 34, 6, 2, '#9aa3aa'); PX.ellipse(c, 288, 34, 5, 1, '#c9a23a');
      PX.ellipse(c, 336, 40, 7, 3, '#3a3a40'); PX.ellipse(c, 336, 39, 5, 2, '#f2a03a'); R(c, 343, 40, 7, 1, '#3a3a40');
      R(c, 366, 30, 10, 6, '#c58b4f'); R(c, 367, 31, 8, 4, '#e6dcc8');
      plant(c, 268, 58, 1);

      // ── Recipe books: tall shelf + reading stool and plant
      R(c, 4, 80, 28, 62, '#5c3a22'); R(c, 6, 82, 24, 58, '#3b2414');
      for (let y = 82; y < 138; y += 14) { R(c, 6, y + 12, 24, 2, '#7a4a26');
        for (let x = 7; x < 29; x += 3) { const h = 9 + (rnd() < .4 ? 2 : 0); R(c, x, y + 12 - h, 2, h, ['#e8553f', '#3a7bd5', '#f4d35e', '#7fc35a', '#9b59b6', '#f2a03a'][Math.floor(rnd() * 6)]); } }
      R(c, 34, 116, 10, 3, '#a8703f'); R(c, 35, 119, 1, 6, '#6b4424'); R(c, 42, 119, 1, 6, '#6b4424');
      plant(c, 40, 98); plant(c, 12, 160, 1); R(c, 6, 150, 14, 2, '#a8703f'); R(c, 8, 152, 1, 8, '#6b4424'); R(c, 17, 152, 1, 8, '#6b4424');
      jar(c, 8, 141, '#3a7bd5');

      // ── Pantry: shelf of jars + sacks
      R(c, 368, 80, 28, 50, '#5c3a22'); R(c, 370, 82, 24, 46, '#3b2414');
      for (let y = 85, r = 0; y < 126; y += 14, r++) { R(c, 370, y + 11, 24, 2, '#7a4a26'); for (let k = 0; k < 3; k++) jar(c, 371 + k * 8, y + 2, ['#e8553f', '#7fc35a', '#f2a03a', '#c9863f'][(r + k) % 4]); }
      for (const [x, col] of [[358, '#d9c29b'], [362, '#c9ad80']]) { R(c, x - 3, 118, 8, 12, col); R(c, x - 2, 116, 6, 2, PX.shade(col, -.2)); R(c, x - 3, 129, 8, 1, PX.shade(col, -.3)); }

      // ── Island: bowls, board with veg, bottles, tray
      counter(c, 150, 100, 100, 28);
      bowl(c, 162, 104, '#e8553f'); bowl(c, 176, 103, '#7fc35a'); bowl(c, 236, 104, '#7fc35a');
      R(c, 188, 98, 2, 6, '#3a3a40'); R(c, 192, 97, 3, 7, '#8a2a22'); R(c, 192, 96, 3, 1, '#f4d35e');
      R(c, 198, 100, 14, 5, '#c58b4f'); PX.ellipse(c, 203, 101, 2, 1, '#e8553f'); PX.ellipse(c, 208, 102, 2, 1, '#4fae52');
      R(c, 216, 99, 12, 6, '#a8703f'); R(c, 217, 100, 10, 4, '#e6dcc8'); R(c, 219, 101, 2, 2, '#e8553f'); R(c, 223, 101, 2, 2, '#f4d35e');

      // ── Quality check: counter with plates lined up, plants and a bin
      counter(c, 50, 146, 86, 18);
      R(c, 54, 138, 1, 8, '#2b2b30'); R(c, 130, 138, 1, 8, '#2b2b30'); R(c, 54, 138, 77, 1, '#2b2b30');
      for (const x of [66, 84, 102, 120]) plate(c, x, 150, FOOD[(x / 18 | 0) % 5]);
      plant(c, 46, 168); plant(c, 140, 150, 1); R(c, 140, 156, 7, 9, '#5c6b75'); R(c, 139, 155, 9, 2, '#8e9aa3');

      // ── Service hatch: wooden pass-through with warm lamps under the counter lip
      R(c, 278, 150, 4, 22, '#5c3a22'); plant(c, 272, 170);
      R(c, 282, 156, 112, 16, '#5c3a22'); R(c, 282, 150, 112, 6, '#a8703f'); R(c, 282, 150, 112, 1, '#d09a60'); R(c, 282, 156, 112, 1, '#3b2414');
      for (let x = 286; x < 392; x += 10) R(c, x, 158, 1, 12, '#4a2e1c');
      R(c, 290, 146, 8, 4, '#e6dcc8'); R(c, 291, 147, 6, 2, '#fffdf5');
      this.hatchLamps = [[348, 163], [384, 163]];
      for (const [x, y] of this.hatchLamps) { R(c, x - 3, y - 3, 7, 6, '#2b1a10'); R(c, x - 2, y - 2, 5, 4, '#ffd77a'); }

      // ── Order tickets: cashier counter with POS screen and ticket spike
      counter(c, 164, 196, 72, 18, '#e6dcc8', '#7a5030');
      R(c, 172, 190, 8, 8, '#fffbe8'); R(c, 173, 192, 6, 1, '#9aa3aa'); R(c, 173, 194, 4, 1, '#9aa3aa'); R(c, 170, 196, 2, 1, '#8a2a22');
      R(c, 182, 194, 3, 3, '#e8553f'); R(c, 186, 193, 2, 4, '#f4d35e');
      R(c, 220, 182, 14, 11, '#2b2b30'); R(c, 221, 183, 12, 8, '#4a6a7a'); R(c, 222, 184, 5, 2, '#8fc0d6'); R(c, 226, 193, 2, 3, '#2b2b30');
      R(c, 206, 194, 8, 3, '#7fc35a'); R(c, 207, 192, 2, 2, '#4fae52');
      this.counterLamps = [[168, 222], [232, 222]];
      for (const [x, y] of this.counterLamps) { R(c, x - 3, y - 4, 7, 7, '#2b1a10'); R(c, x - 2, y - 3, 5, 5, '#ffd77a'); }

      // ── Cleaning station: dish rack, double sink, dishwasher
      R(c, 284, 186, 96, 22, '#7e8a94'); R(c, 284, 186, 96, 5, '#c8ced3'); R(c, 284, 186, 96, 1, '#eef2f4'); R(c, 284, 207, 96, 2, 'rgba(0,0,0,.2)');
      for (let i = 0; i < 5; i++) { PX.ellipse(c, 292, 180 - i * 2, 6, 2, '#9aa3aa'); PX.ellipse(c, 292, 179 - i * 2, 6, 1, '#ffffff'); }
      R(c, 302, 188, 18, 5, '#5c6b75'); R(c, 324, 188, 18, 5, '#5c6b75'); R(c, 304, 189, 14, 3, '#7fb6d9'); R(c, 305, 189, 4, 1, '#cfe8f5');
      for (const x of [311, 333]) { R(c, x, 179, 1, 9, '#c8ced3'); R(c, x, 179, 4, 1, '#c8ced3'); R(c, x + 3, 180, 1, 2, '#c8ced3'); }
      for (let x = 288; x < 344; x += 14) { R(c, x, 194, 12, 11, '#8e9aa3'); R(c, x + 5, 196, 3, 1, '#c8ced3'); }
      R(c, 348, 188, 14, 19, '#3a5a8a'); R(c, 349, 190, 12, 2, '#5a7aaa'); R(c, 353, 194, 4, 1, '#c8ced3');
      R(c, 364, 180, 14, 27, '#3a5a8a'); R(c, 365, 182, 12, 11, '#2b4a78'); R(c, 365, 195, 12, 10, '#2b4a78'); R(c, 375, 186, 1, 3, '#c8ced3');
      plant(c, 276, 208); plant(c, 388, 208, 1);

      // corner plants
      plant(c, 12, 66, 1); plant(c, 388, 66, 1); plant(c, 12, 212, 1);

      // dinner service: warm room, light pools from sconces, heat lamps, stove and hatch
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#e6c9a4'; c.fillRect(0, 0, 400, 240);
      const v = c.createRadialGradient(200, 120, 90, 200, 120, 260); v.addColorStop(0, '#ffffff'); v.addColorStop(1, '#6a4440');
      c.fillStyle = v; c.fillRect(0, 0, 400, 240); c.restore();
      this.pendants = [[176, 86], [224, 86], [96, 118], [330, 120]];
      for (const [x, y] of this.pendants) PX.glow(c, x, y + 14, 30, '255,190,120', .26, .55);
      for (const [x, y] of this.sconces) PX.glow(c, x, y + 2, 18, '255,200,120', .3, .6);
      for (const [x, y] of [...this.hatchLamps, ...this.counterLamps]) PX.glow(c, x, y, 16, '255,200,120', .3, .6);
      PX.glow(c, 200, 50, 46, '255,150,70', .22, .4);
      PX.glow(c, 326, 48, 50, '255,130,50', .24, .45);
    },

    drawAmbient(c, t) {
      // flames
      this.burners.forEach(([x, y], i) => {
        if (i === 0 || i === 2) return;
        for (let k = 0; k < 5; k++) {
          const h = 2 + ((Math.sin(t * 14 + k * 2 + i) + 1) * 1.5) | 0;
          R(c, x - 4 + k * 2, y - h + 1, 1, h, k % 2 ? '#ffb43a' : '#ff6a2a');
        }
      });
      // heat lamps + sconces
      for (const x of [170, 186, 214, 230]) { R(c, x - 2, 32, 5, 2, '#ffe9a8'); R(c, x, 32, 1, 1, '#ffffff'); }
      for (const [x, y] of this.sconces) R(c, x - 1, y - 5, 2, 2, Math.sin(t * 3 + x) > -.8 ? '#fffbe0' : '#ffe9a8');
      // bubbling soup
      if (Math.floor(t * 4) % 2) R(c, 286 + Math.floor(t * 7) % 5, 33, 1, 1, '#f4d35e');
      // steam
      steam.forEach((s, i) => {
        const k = (t * .3 + s.k) % 1, src = [[288, 32], [336, 37], [312, 186]][i % 3];
        c.fillStyle = `rgba(255,255,255,${(i % 3 === 2 ? .3 : .5) * (1 - k)})`;
        c.fillRect(Math.round(src[0] + Math.sin(k * 7 + s.s * 6) * 4), Math.round(src[1] - k * (i % 3 === 2 ? 14 : 26)), 2, 2);
      });
    },
    drawWeather(c, t) {
      this.burners.forEach(([x, y], i) => { if (i === 1 || i === 3) PX.glow(c, x, y - 2, 12 + Math.sin(t * 13 + i * 2) * 2, '255,120,40', .22, .7); });
      for (const x of [170, 186, 214, 230]) PX.glow(c, x, 40, 8 + Math.sin(t * 5 + x), '255,160,60', .2, .7);
      for (const [x, y] of this.pendants) {
        PX.glow(c, x, y, 7, '255,220,150', .35, 1);
        PX.ellipse(c, x, y, 5, 3, '#24160f'); PX.ellipse(c, x, y, 4, 2, '#2f5b4a'); PX.ellipse(c, x, y - 1, 2, 1, '#4f8a72'); PX.rect(c, x - 1, y + 1, 3, 1, '#ffe9a8');
      }
    },

    leadSeat: { x: 200, y: 50 },
    drawLeadChar(c, L, t) { PX.person(c, L.x, L.y, { top: '#2b2b30', pants: '#2b2b30', hat: 'chefLead', collar: '#fff', frame: L.frame, flip: L.flip, work: L.wave > 0, t }); },
    drawLead(c, t, busy, L) {
      if (L.atDesk) PX.person(c, 200, 50, { top: '#2b2b30', pants: '#2b2b30', hat: 'chefLead', collar: '#fff', work: busy || L.wave > 0 || L.stamp > 0, t });
      R(c, 158, 48, 84, 2, 'rgba(0,0,0,.2)');
      R(c, 156, 44, 88, 12, '#6b5a4a'); R(c, 156, 44, 88, 5, '#e6dcc8'); R(c, 156, 44, 88, 1, '#fff6e4'); R(c, 156, 49, 88, 1, '#4a3a2e');
      for (let i = 162; i < 238; i += 14) { R(c, i, 51, 12, 4, '#7a6858'); R(c, i + 5, 52, 3, 1, '#e7c98f'); }
      plate(c, 172, 47, '#e8553f'); plate(c, 228, 47, '#f2a03a'); R(c, 186, 44, 10, 3, '#c58b4f'); R(c, 208, 44, 6, 4, '#fffdf5');
    },

    drawCarrier(c, car, t) {
      let ox = 0, alpha = 1;
      if (car.phase === 'leaving') { ox = car.t * car.t * 12; alpha = Math.max(0, 1 - car.t / 2.5); }
      else if (car.phase === 'gone') return;
      else if (car.phase === 'returning') { alpha = car.t / 2; }
      c.globalAlpha = alpha;
      const x = Math.round(328 + ox), y = 154;
      R(c, x - 2, y, 7, 1, '#d4a017'); PX.ellipse(c, x + 1, y - 2, 3, 2, '#e7b142'); R(c, x, y - 4, 1, 1, '#fff3c4'); // bell
      for (let i = 0; i < car.count; i++) {
        const px = x + 12 + (i % 4) * 13, py = y - Math.floor(i / 4) * 3;
        PX.ellipse(c, px, py, 6, 2, '#ffffff'); PX.ellipse(c, px, py - 1, 3, 1, FOOD[i % 5]);
      }
      c.globalAlpha = 1;
    },

    drawChar(c, a, frame, t) {
      PX.person(c, a.x, a.y, { top: '#f6f4ee', apron: a.color, pants: '#30343a', hat: a.isSub ? 'none' : 'toque', collar: a.isSub ? a.color : null,
        frame, work: a.mode === 'work', t, flip: a.flip });
      if (a.isSub) { R(c, a.x - 4, a.y - 14, 8, 1, a.color); }
    },
    drawCarry(c, x, y) { PX.ellipse(c, x + 6, y - 7, 6, 2, '#24160f'); PX.ellipse(c, x + 6, y - 7, 5, 1, '#fff'); PX.ellipse(c, x + 6, y - 9, 3, 1, '#e8553f'); PX.rect(c, x + 5, y - 10, 2, 1, '#7bc96f'); },
    drawLeadPortrait(c, x, y) { PX.person(c, x, y, { top: '#2b2b30', pants: '#2b2b30', hat: 'chefLead', collar: '#fff' }); },
  });
})();
