/* Theme pack: Restaurant Kitchen — same engine, different skin. */
(() => {
  const R = PX.rect;
  const FOOD = ['#e8553f', '#7fc35a', '#f2a03a', '#c9863f', '#f4d35e'];

  function counter(c, x, y, w, h, top = '#c3ccd3', edge = '#7e8a94') {
    R(c, x + 2, y + h, w, 2, 'rgba(0,0,0,.18)');
    R(c, x, y, w, h, edge); R(c, x, y, w, h - 3, top); R(c, x, y, w, 1, '#e8eef2');
    for (let i = x + 6; i < x + w - 2; i += 12) R(c, i, y + h - 3, 1, 3, '#5f6a73');
  }

  const steam = Array.from({ length: 40 }, () => ({ k: Math.random(), s: Math.random() }));

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
      wrap: 'จัดจาน · สรุปงาน', wrapIcon: '🍽️', carry: 'ยกจานไปช่องเสิร์ฟ',
      delivered: 'วาง “%s” ที่ช่องเสิร์ฟแล้ว', carrierGone: '🛎️ เสิร์ฟออกไป %n จาน!', waitCarrier: 'รอพนักงานเสิร์ฟ',
      rest: 'ชิมซุปที่โต๊ะกลาง', restIcon: '🥄',
      permAsk: 'ขอให้หัวหน้าเชฟชิมก่อน', leadAuto: 'หัวหน้าเชฟพยักหน้าให้ ✅', youApprove: 'คุณอนุมัติแทนหัวหน้าเชฟ ✅',
      error: 'ไฟลุกกระทะ! ทำใหม่', errorIcon: '🔥', compact: 'เคาน์เตอร์ล้น! เคลียร์ context', compactIcon: '🧽',
      leadIdle: 'ยืนคุมไลน์', inspect: 'ยกจานให้หัวหน้าเชฟชิม', leadBusy: 'มีจานรอชิม %n',
    },
    places: {
      intake: { x: 200, y: 207 }, read: { x: 40, y: 116 }, edit: { x: 74, y: 64 }, bash: { x: 326, y: 64 },
      web: { x: 360, y: 116 }, permission: { x: 200, y: 66 }, wrap: { x: 271, y: 171 }, deliver: { x: 344, y: 186 },
      idle: { x: 200, y: 146, jx: 44, jy: 5 },
    },
    signs: [
      { x: 74, y: 8, text: 'Prep Station', sub: 'Edit · Write', icon: '🔪' },
      { x: 200, y: 8, text: 'Head Chef Pass', sub: 'Permission', icon: '👨‍🍳' },
      { x: 326, y: 8, text: 'Stove Line', sub: 'Bash · Test', icon: '🔥' },
      { x: 30, y: 66, text: 'Recipe Books', sub: 'Read · Grep', icon: '📖' },
      { x: 368, y: 66, text: 'Pantry', sub: 'Web search', icon: '🧺' },
      { x: 200, y: 222, text: 'Order Tickets', sub: 'งานใหม่', icon: '🎫', small: true },
      { x: 271, y: 192, text: 'Plating', sub: 'สรุปงาน', icon: '🍽️', small: true },
      { x: 357, y: 222, text: 'Service Hatch', sub: 'ส่งงาน', icon: '🛎️' },
    ],

    drawStatic(c) {
      const rnd = PX.rng(77);
      // checker floor
      for (let y = 30; y < 218; y += 8) for (let x = 0; x < 400; x += 8) R(c, x, y, 8, 8, ((x + y) / 8) % 2 ? '#d9c7a6' : '#b89a72');
      PX.speckle(c, 0, 30, 400, 188, ['#00000010', '#ffffff18'], .04, rnd);
      // back wall: subway tiles
      R(c, 0, 0, 400, 32, '#eef0ea');
      for (let y = 0; y < 32; y += 4) { R(c, 0, y, 400, 1, '#cfd3cc'); for (let x = (y / 4) % 2 * 4; x < 400; x += 8) R(c, x, y, 1, 4, '#cfd3cc'); }
      R(c, 0, 30, 400, 3, '#5f6a73');
      // hanging pans
      for (const x of [140, 150, 252, 262]) { R(c, x, 4, 1, 6, '#555'); PX.ellipse(c, x, 13, 4, 3, '#3a3a40'); R(c, x - 2, 12, 3, 1, '#666'); }
      // side + bottom walls
      R(c, 0, 30, 6, 188, '#4a3426'); R(c, 394, 30, 6, 188, '#4a3426');
      R(c, 0, 216, 400, 24, '#3d2b20'); for (let x = 0; x < 400; x += 10) R(c, x, 216, 1, 24, '#33241a'); R(c, 0, 216, 400, 2, '#5c4232');
      // prep counter
      counter(c, 22, 36, 104, 18);
      R(c, 32, 39, 22, 9, '#c58b4f'); R(c, 32, 47, 22, 1, '#8f6234');
      R(c, 64, 39, 22, 9, '#c58b4f'); R(c, 64, 47, 22, 1, '#8f6234');
      for (let i = 0; i < 10; i++) R(c, 36 + rnd() * 14, 41 + rnd() * 5, 2, 2, FOOD[i % 3]);
      R(c, 96, 40, 18, 7, '#e6e6e6'); R(c, 98, 41, 14, 4, '#7fc35a');
      // head chef pass with heat lamps
      counter(c, 160, 42, 80, 14, '#d2d9de');
      for (const x of [172, 200, 228]) { R(c, x, 30, 1, 6, '#333'); R(c, x - 4, 35, 9, 3, '#3a3a40'); }
      for (let i = 0; i < 5; i++) R(c, 166 + i * 15, 32, 6, 8, '#fffdf5');
      // stove line
      R(c, 276, 36, 100, 20, '#2e2e33'); R(c, 276, 53, 100, 3, '#1c1c20'); R(c, 276, 36, 100, 1, '#55555c');
      this.burners = [];
      for (let i = 0; i < 4; i++) { const bx = 288 + i * 24; PX.ellipse(c, bx, 44, 6, 3, '#18181b'); PX.ellipse(c, bx, 44, 4, 2, '#3c3c44'); this.burners.push([bx, 44]); }
      PX.ellipse(c, 288, 41, 6, 3, '#9aa3aa'); R(c, 282, 37, 12, 4, '#7e8a94');
      PX.ellipse(c, 336, 42, 7, 3, '#3a3a40'); R(c, 343, 42, 6, 1, '#3a3a40');
      // recipe shelf
      R(c, 6, 72, 20, 90, '#7b4a26'); for (let y = 76; y < 160; y += 14) { R(c, 6, y + 10, 20, 2, '#5a3518');
        for (let x = 8; x < 24; x += 3) R(c, x, y + (rnd() < .3 ? 2 : 0), 2, 10 - (rnd() < .3 ? 2 : 0), FOOD[(x + y) % 5]); }
      // pantry
      R(c, 374, 72, 20, 90, '#6b4424');
      for (let y = 78; y < 158; y += 16) { R(c, 376, y, 16, 10, '#a8703f'); R(c, 376, y + 4, 16, 1, '#7b4a26'); R(c, 380, y - 3, 4, 4, FOOD[(y / 16 | 0) % 5]); R(c, 386, y - 2, 3, 3, '#f4ecd8'); }
      // island
      counter(c, 150, 104, 100, 24, '#c3ccd3');
      for (const [x, col] of [[164, '#e8553f'], [184, '#f4d35e'], [206, '#7fc35a'], [228, '#f2a03a']]) { PX.ellipse(c, x, 112, 6, 3, '#f4f4f4'); PX.ellipse(c, x, 112, 4, 2, col); }
      // plating counter
      counter(c, 236, 176, 70, 14, '#f0f0ec', '#a4acb2');
      for (let i = 0; i < 4; i++) { PX.ellipse(c, 246 + i * 16, 181, 5, 2, '#ffffff'); R(c, 245 + i * 16, 180, 3, 1, FOOD[i]); }
      // ticket rail
      R(c, 168, 216, 64, 3, '#9aa3aa');
      for (let i = 0; i < 6; i++) R(c, 172 + i * 10, 219, 7, 9, i % 2 ? '#fffbe8' : '#fff4c9');
      // service hatch
      R(c, 322, 194, 72, 22, '#2a1d15'); R(c, 324, 196, 68, 16, '#5c3a26');
      R(c, 322, 196, 72, 6, '#ffe7b0'); R(c, 322, 194, 72, 2, '#7e8a94');
      R(c, 322, 200, 72, 6, '#c3ccd3'); R(c, 322, 205, 72, 1, '#7e8a94');
      // mats
      for (const [x, y, w] of [[50, 58, 50], [176, 60, 48], [300, 58, 52]]) { R(c, x, y, w, 10, '#3a3f45'); for (let i = x + 2; i < x + w; i += 4) R(c, i, y + 1, 2, 8, '#454b52'); }
    },

    drawAmbient(c, t) {
      // flames
      this.burners.forEach(([x, y], i) => {
        if (i === 0) return;
        for (let k = 0; k < 5; k++) {
          const h = 2 + ((Math.sin(t * 14 + k * 2 + i) + 1) * 1.5) | 0;
          R(c, x - 4 + k * 2, y - h + 1, 1, h, k % 2 ? '#ffb43a' : '#ff6a2a');
        }
      });
      // heat lamps glow
      for (const x of [172, 200, 228]) { c.fillStyle = `rgba(255,170,60,${.16 + .04 * Math.sin(t * 5 + x)})`; c.fillRect(x - 6, 38, 13, 10); }
      // steam
      steam.forEach((s, i) => {
        const k = (t * .3 + s.k) % 1, src = i % 2 ? [288, 37] : [336, 39];
        c.fillStyle = `rgba(255,255,255,${.5 * (1 - k)})`;
        c.fillRect(Math.round(src[0] + Math.sin(k * 7 + s.s * 6) * 4), Math.round(src[1] - k * 26), 2, 2);
      });
    },
    drawWeather() {},

    leadSeat: { x: 200, y: 50 },
    drawLeadChar(c, L, t) { PX.person(c, L.x, L.y, { top: '#2b2b30', pants: '#2b2b30', hat: 'chefLead', collar: '#fff', frame: L.frame, flip: L.flip, work: L.wave > 0, t }); },
    drawLead(c, t, busy, L) {
      if (L.atDesk) PX.person(c, 200, 50, { top: '#2b2b30', pants: '#2b2b30', hat: 'chefLead', collar: '#fff', work: busy || L.wave > 0 || L.stamp > 0, t });
      R(c, 160, 47, 80, 9, '#7e8a94'); R(c, 160, 47, 80, 6, '#d2d9de'); R(c, 160, 47, 80, 1, '#eef2f4');
      for (let i = 0; i < 5; i++) R(c, 166 + i * 15, 32, 6, 8, '#fffdf5');
    },

    drawCarrier(c, car, t) {
      let ox = 0, alpha = 1;
      if (car.phase === 'leaving') { ox = car.t * car.t * 12; alpha = Math.max(0, 1 - car.t / 2.5); }
      else if (car.phase === 'gone') return;
      else if (car.phase === 'returning') { alpha = car.t / 2; }
      c.globalAlpha = alpha;
      const x = Math.round(330 + ox);
      R(c, x, 199, 4, 1, '#d4a017'); PX.ellipse(c, x + 2, 197, 2, 2, '#e7b142'); // bell
      for (let i = 0; i < car.count; i++) {
        const px = x + 10 + (i % 3) * 16, py = 199 - Math.floor(i / 3) * 4;
        PX.ellipse(c, px, py, 6, 2, '#ffffff'); PX.ellipse(c, px, py - 1, 3, 1, FOOD[i % 5]);
      }
      c.globalAlpha = 1;
    },

    drawChar(c, a, frame, t) {
      PX.person(c, a.x, a.y, { top: '#f6f4ee', apron: a.color, pants: '#30343a', hat: a.isSub ? 'none' : 'toque', collar: a.isSub ? a.color : null,
        frame, work: a.mode === 'work', t, flip: a.flip });
      if (a.isSub) { R(c, a.x - 3, a.y - 11, 6, 2, a.color); }
    },
    drawCarry(c, x, y) { PX.ellipse(c, x, y - 17, 5, 2, '#fff'); PX.ellipse(c, x, y - 18, 3, 1, '#e8553f'); },
    drawLeadPortrait(c, x, y) { PX.person(c, x, y, { top: '#2b2b30', pants: '#2b2b30', hat: 'chefLead', collar: '#fff' }); },
  });
})();
