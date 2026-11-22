/* Engine: simulates agents and renders whatever theme is active.
   Agent activity is expressed only as ROLES: intake, read, edit, bash, web, permission, wrap, deliver, idle.
   Later, real Claude Code hook events replace the simulated "life" generators below. */
(() => {
  const W = PX.W, H = PX.H, $ = s => document.querySelector(s);
  const cv = $('#map'), ctx = cv.getContext('2d');
  const stageBox = $('#stagebox'), overlay = $('#overlay'), mapCell = $('#mapcell');
  const mini = $('#mini'), mctx = mini.getContext('2d');
  const staticLayer = document.createElement('canvas'); staticLayer.width = W; staticLayer.height = H;
  const sctx = staticLayer.getContext('2d', { willReadFrequently: true });

  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
  const val = v => typeof v === 'function' ? v() : v;
  const fmt = (s, o) => s.replace('%s', o.s ?? '').replace('%n', o.n ?? '');

  const TOOLS = [
    { k: 'read', w: 3, acts: ['Read src/App.tsx', 'Grep "TODO"', 'Glob **/*.css', 'Read package.json'] },
    { k: 'edit', w: 4, acts: ['Edit src/App.tsx', 'Write Button.tsx', 'Edit styles.css', 'Edit api/login.ts'] },
    { k: 'bash', w: 2, acts: ['Bash npm test', 'Bash npm run build', 'Bash git status', 'Bash tsc --noEmit'] },
    { k: 'web', w: 1, acts: ['WebSearch "react hooks"', 'WebFetch mdn docs', 'WebSearch "css grid"'] },
  ];
  const DANGER = ['Bash git push', 'Bash rm -rf dist', 'Bash npm install lodash', 'WebFetch api.example.com', 'Bash git commit'];
  const TASKS = ['แก้บั๊กหน้า login', 'เพิ่ม dark mode', 'เขียนเทส API', 'ทำหน้า dashboard', 'อัปเดต README', 'รีแฟกเตอร์ utils', 'แก้ CSS มือถือ', 'เพิ่มปุ่ม export'];
  const CREW = [['Bobby', '#2f9a57'], ['Lily', '#3a7bd5'], ['Max', '#d8443a'], ['Momo', '#e0a526'], ['Pip', '#9b59b6'], ['Juni', '#1aa39a'], ['Cocoa', '#b86a2c']];
  const MODE_NAME = { live: 'ทำงาน', work: 'ทำงาน', walk: 'เดิน', follow: 'เดิน', perm: 'รออนุมัติ', error: 'error', compact: 'บีบ context', deposit: 'ส่งของ', idle: 'ว่าง' };
  const MODE_COL = { live: '#5fd16f', work: '#5fd16f', walk: '#6fb6ff', follow: '#6fb6ff', perm: '#ffd54a', error: '#ff5a4e', compact: '#ff9ad5', deposit: '#ffa94d', idle: '#9a8f80' };

  let theme, speed = 1, autoApprove = true, delivered = 0, toolCalls = 0, clock = 0, nextId = 0, crewNext = 0, scale = 1;
  const agents = [], permQueue = [], particles = [], logItems = [];
  const car = { count: 0, phase: 'ready', t: 0 };
  const w = () => theme.words;

  /* ---------------- log ---------------- */
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtTime = ts => new Date(ts || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  function log(a, msg, cls = '', ts = null) {
    const d = document.createElement('div'); d.className = 'li ' + cls;
    d.innerHTML = `<i style="background:${a ? a.color : 'var(--accent)'}"></i><div><b>${a ? esc(a.name) : '⚙️ ระบบ'}</b> <span class="msg">${msg}</span><time>${fmtTime(ts)}</time></div>`;
    $('#log').prepend(d); while ($('#log').children.length > 50) $('#log').lastChild.remove();
    return d;
  }

  /* ---------------- agents ---------------- */
  function makeAgent(o) {
    const a = { id: nextId++, name: o.name, color: o.color, crewIdx: o.crewIdx ?? 0, isSub: !!o.parent, parent: o.parent || null,
      x: o.x, y: o.y, flip: false, ctx: .08, mode: 'idle', status: 'ว่าง', task: o.task || null, kids: 0, carry: false, walking: false, cur: null, t: 0, target: null };
    a.live = !!o.live; a.sid = o.sid || null; a.project = o.project || ''; a.inbox = []; a.tools = new Map();
    a.gen = a.live ? liveLife(a) : a.isSub ? subLife(a) : life(a);
    a.bub = document.createElement('div'); a.bub.className = 'bub';
    a.bub.innerHTML = '<span class="ic"></span><span class="tx"></span><i class="bar"><b></b></i>';
    a.bub.onclick = () => approve(a, true);
    a.tag = document.createElement('div'); a.tag.className = 'tag' + (a.isSub ? ' sub' : ''); a.tag.textContent = a.name; a.tag.style.setProperty('--c', a.color);
    overlay.append(a.bub, a.tag);
    agents.push(a); renderCards();
    return a;
  }
  function addAgent() {
    if (crewNext >= CREW.length) return;
    const [n, c] = CREW[crewNext]; const p = theme.places.idle;
    const a = makeAgent({ name: n, color: c, crewIdx: crewNext++, x: p.x + rnd(-30, 30), y: p.y + rnd(-4, 4) });
    log(a, 'เข้ากะทำงาน 👋'); bossGreet(a);
    $('#addAgent').disabled = crewNext >= CREW.length;
  }
  function spawnSub(p) {
    p.kids++;
    makeAgent({ name: fmt(w().helperName, { s: p.name }), color: p.color, crewIdx: p.crewIdx, parent: p, x: p.x + 8, y: p.y + 2, task: 'ช่วยหาข้อมูล' });
  }

  const go = (role, jx, jy) => ({ type: 'walk', role, jx, jy });

  /* ---------------- the lead (Santa / Head Chef / ป้าแดง) ---------------- */
  // Jobs: approve permissions at the desk, inspect every finished task, greet new agents, patrol when idle.
  const boss = { x: 0, y: 0, atDesk: true, mode: 'desk', t: 0, target: null, flip: false, walking: false, frame: 0, wave: 0, stamp: 0, patrolIn: 6 };
  const inspectQueue = [];
  const bossBub = document.createElement('div'); bossBub.className = 'bub boss'; bossBub.innerHTML = '<span class="ic"></span><span class="tx"></span>';
  overlay.appendChild(bossBub);
  let bossSayUntil = 0;
  function bossSay(icon, text, dur = 2.6) {
    bossBub.querySelector('.ic').textContent = icon; bossBub.querySelector('.tx').textContent = text;
    bossSayUntil = performance.now() + dur * 1000 / Math.max(speed, .5);
  }
  function bossFront() { const p = theme.places.permission; return { x: p.x, y: p.y }; }
  function bossHome() { boss.atDesk = true; boss.mode = 'desk'; boss.target = null; boss.walking = false; }
  function bossGreet(a) { boss.wave = 1.8; bossSay('👋', `ยินดีต้อนรับ ${a.name}!`); }
  function tickBoss(dt) {
    boss.wave = Math.max(0, boss.wave - dt); boss.stamp = Math.max(0, boss.stamp - dt);
    const needDesk = permQueue.length > 0 || inspectQueue.length > 0;
    if (boss.atDesk) {
      const a = inspectQueue[0];
      if (a && a.inspArrived && boss.stamp <= 0) {
        inspectQueue.shift(); a.inspected = true; boss.stamp = .7;
        const p = bossFront(); puff(p.x + 4, p.y - 22, '✅'); bossSay('✅', `${a.name} ผ่าน!`, 1.6);
      }
      if (!needDesk) {
        boss.patrolIn -= dt;
        if (boss.patrolIn <= 0) {
          boss.patrolIn = rnd(12, 20);
          const busy = agents.filter(x => !x.isSub && (x.mode === 'work' || x.mode === 'live'));
          if (busy.length) {
            const f = bossFront(); boss.x = f.x; boss.y = f.y;
            boss.atDesk = false; boss.mode = 'toAgent'; boss.target = pick(busy);
            bossSay('👀', `ไปดู ${boss.target.name} หน่อย`);
          }
        }
      }
      return;
    }
    if (needDesk && boss.mode !== 'return') { boss.mode = 'return'; bossSay('🏃', 'มีงานรอที่โต๊ะ!', 1.5); }
    let tx = null, ty = null;
    if (boss.mode === 'toAgent') {
      const a = boss.target;
      if (!agents.includes(a)) boss.mode = 'return';
      else { tx = a.x + (a.x >= boss.x ? -11 : 11); ty = a.y + 1; }
    }
    if (boss.mode === 'watch') { boss.t += dt; if (boss.t > 2.6) boss.mode = 'return'; }
    if (boss.mode === 'return') { const f = bossFront(); tx = f.x; ty = f.y; }
    if (tx != null) {
      const dx = tx - boss.x, dy = ty - boss.y, d = Math.hypot(dx, dy), v = 34 * dt;
      if (d > 1) { const k = Math.min(1, v / d); boss.x += dx * k; boss.y += dy * k; if (Math.abs(dx) > .3) boss.flip = dx < 0; boss.walking = true; }
      else {
        boss.walking = false;
        if (boss.mode === 'toAgent') { boss.mode = 'watch'; boss.t = 0; boss.flip = boss.target.x < boss.x; boss.wave = 1; bossSay('👍', pick(['เยี่ยมมาก!', 'ทำต่อเลย', 'สู้ๆ นะ', 'งานสวย!'])); }
        else if (boss.mode === 'return') bossHome();
      }
    } else boss.walking = false;
  }

  /* ---------------- live mode: real Claude Code events ---------------- */
  let mode = 'demo', connected = false, rate = null, gotSnapshot = false, account = null, lastEventAt = null, revealUntil = 0;
  const bySid = new Map(), byAid = new Map();
  const ROLE = t => {
    if (/^(Read|Grep|Glob|LS|NotebookRead)$/.test(t)) return 'read';
    if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(t)) return 'edit';
    if (/^(Bash|PowerShell|BashOutput|KillShell|Monitor)$/.test(t)) return 'bash';
    if (/^(WebFetch|WebSearch)$/.test(t) || (/^mcp__/.test(t) && !/^mcp__ccd_/.test(t))) return 'web';
    return null; // planning/bookkeeping tools: work where they stand
  };
  function liveAgent(sid, project, ctxTokens, quiet) {
    let a = bySid.get(sid);
    if (a) return a;
    const [n, c] = CREW[crewNext % CREW.length]; const p = theme.places.idle;
    a = makeAgent({ name: n, color: c, crewIdx: crewNext++ % CREW.length, x: p.x + rnd(-30, 30), y: p.y + rnd(-4, 4), live: true, sid, project });
    if (ctxTokens) { a.ctxTokens = ctxTokens; a.ctx = Math.min(1, ctxTokens / (ctxTokens > 200000 ? 1000000 : 200000)); }
    bySid.set(sid, a); if (!quiet) { log(a, `เปิด session ใน ${esc(project || 'โปรเจกต์')} 👋`); bossGreet(a); }
    return a;
  }
  function liveSub(parent, aid, atype) {
    parent.kids++;
    const s = makeAgent({ name: atype ? atype.slice(0, 12) : fmt(w().helperName, { s: parent.name }), color: parent.color, crewIdx: parent.crewIdx,
      parent, x: parent.x + 8, y: parent.y + 2, live: true, task: 'ช่วยงาน ' + parent.name });
    byAid.set(aid, s); log(s, `มาช่วย ${parent.name} แล้ว`);
    return s;
  }
  function settlePerm(a) {
    if (a.permReq) { a.permReq.settled = true; a.permReq = null; }
    if (a.cur && a.cur.type === 'perm' && !a.approved) {
      a.approved = true; const i = permQueue.indexOf(a); if (i >= 0) permQueue.splice(i, 1);
      const p = theme.places.permission; puff(p.x, p.y - 20, '✅'); log(a, 'ได้รับอนุมัติในแอปแล้ว ✅', 'good');
    }
  }
  function onLive(e) {
    if (e.ev !== 'Snapshot' && e.ev !== 'StatusLine') lastEventAt = Date.now();
    if (e.ev === 'Snapshot') {
      rate = e.rate; account = e.account; if (e.lastHookAt) lastEventAt = e.lastHookAt;
      if (!gotSnapshot) { gotSnapshot = true; setMode('live'); }
      if (mode === 'live') {
        e.sessions.forEach(s => liveAgent(s.sid, s.project, s.ctxTokens, true));
        $('#log').innerHTML = ''; turnLines.clear();
        (e.history || []).forEach(h => activity(h, true));
      }
      return;
    }
    if (e.ev === 'StatusLine') { if (e.rate) rate = e.rate; const a = bySid.get(e.sid); if (a && e.ctxPct != null) { a.ctx = e.ctxPct / 100; a.ctxExact = true; } return; }
    if (mode !== 'live' || !e.sid) return;
    if (e.ev === 'SessionEnd') { activity(e); const a = bySid.get(e.sid); if (a) a.inbox.push({ kind: 'leave' }); return; }
    let a = liveAgent(e.sid, e.project);
    activity(e);
    if (e.ctxTokens) { a.ctxTokens = e.ctxTokens; if (!a.ctxExact) a.ctx = Math.min(1, e.ctxTokens / (e.ctxTokens > 200000 ? 1000000 : 200000)); }
    if (e.aid) {
      let s = byAid.get(e.aid);
      if (e.ev === 'SubagentStop') { if (s) { s.inbox.push({ kind: 'end' }); byAid.delete(e.aid); } return; }
      if (!s) s = liveSub(a, e.aid, e.atype);
      a = s;
    }
    if (e.ev === 'SubagentStart') return;
    if (['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'UserPromptSubmit', 'Stop'].includes(e.ev)) settlePerm(a);
    switch (e.ev) {
      case 'UserPromptSubmit': a.inbox.push({ kind: 'prompt', text: e.prompt }); break;
      case 'PreToolUse': {
        toolCalls++;
        const it = { kind: 'tool', role: ROLE(e.tool), tool: e.tool, label: e.label, done: false, spawn: e.tool === 'Agent' || e.tool === 'Task' };
        if (e.tuid) a.tools.set(e.tuid, it);
        a.inbox.push(it); break;
      }
      case 'PostToolUse': case 'PostToolUseFailure': {
        const it = e.tuid && a.tools.get(e.tuid);
        if (it) { it.done = true; a.tools.delete(e.tuid); }
        else { const x = a.inbox.find(x => x.kind === 'tool' && !x.done) || (a.cur && a.cur.item); if (x) x.done = true; }
        if (e.failed) a.inbox.push({ kind: 'error' });
        break;
      }
      case 'Notification':
        if (e.ntype === 'permission_prompt' || (!e.ntype && /permission/i.test(e.msg || ''))) a.permReq = { text: e.msg || 'ขออนุญาต', settled: false };
        break;
      case 'PreCompact': a.inbox.push({ kind: 'compact' }); break;
      case 'Stop': a.inbox.push({ kind: 'stop' }); break;
    }
  }
  const turnLines = new Map(); // sid -> { el, chips } : one line per turn listing the tools used
  function who(sid, project) { return bySid.get(sid) || { name: project || 'session', color: '#8a8a8a' }; }
  function activity(e, replay) {
    if (e.aid || !e.sid) return;
    const a = who(e.sid, e.project), ts = e.ts;
    switch (e.ev) {
      case 'UserPromptSubmit':
        turnLines.delete(e.sid);
        log(a, `💬 คุณ: <span class="q">“${esc(e.prompt || '…')}”</span>`, 'you', ts); break;
      case 'PreToolUse': {
        const role = ROLE(e.tool), spawn = e.tool === 'Agent' || e.tool === 'Task';
        if (!role && !spawn) return;
        let t = turnLines.get(e.sid);
        if (!t || !t.el.isConnected) { t = { chips: [], el: log(a, '', 'tools', ts) }; turnLines.set(e.sid, t); }
        t.chips.push(`${spawn ? '📣' : theme.toolIcons[role]} <span class="q">${esc(e.label || e.tool.replace(/^mcp__.+?__/, ''))}</span>`);
        const shown = t.chips.slice(-8), more = t.chips.length - shown.length;
        t.el.querySelector('.msg').innerHTML = `🛠️ ${t.chips.length} ครั้ง: ` + (more ? `… ` : '') + shown.join(' · ');
        t.el.querySelector('time').textContent = fmtTime(ts);
        break;
      }
      case 'PostToolUseFailure': if (e.failed) log(a, `💥 ${esc(e.tool)} ไม่สำเร็จ`, 'bad', ts); break;
      case 'Stop':
        turnLines.delete(e.sid);
        log(a, `🤖 ตอบ: <span class="q">“${esc(e.reply || 'เสร็จแล้ว')}”</span>`, 'reply', ts); break;
      case 'SessionStart': if (replay) log(a, `เปิด session ใน ${esc(e.project)}`, '', ts); break;
      case 'SessionEnd': log(a, 'ปิด session แล้ว', '', ts); break;
    }
  }
  function* liveLife(a) {
    while (true) {
      if (a.permReq) { const pr = a.permReq; if (!pr.settled) yield { type: 'perm', text: pr.text }; if (a.permReq === pr) a.permReq = null; continue; }
      const it = a.inbox.shift();
      if (!it) {
        if (a.busy) yield { type: 'idle', dur: .3, icon: '💭', text: 'กำลังคิด…', st: 'กำลังคิด', think: true };
        else { if (!a.rested) { a.rested = true; if (!a.isSub) yield go('idle'); } yield { type: 'idle', dur: .3, icon: () => w().restIcon, text: () => w().rest }; }
        continue;
      }
      a.rested = false;
      // falling behind? skip finished tool calls so the scene catches up with reality
      if (it.kind === 'tool' && it.done && a.inbox.filter(x => x.kind === 'tool').length >= 2) continue;
      switch (it.kind) {
        case 'prompt':
          a.busy = true; a.task = it.text || 'งานใหม่';
          yield go('intake', 6, 3);
          yield { type: 'work', dur: .8, icon: '✉️', text: () => w().intake, st: 'รับงานใหม่' };
          break;
        case 'tool':
          a.busy = true;
          if (it.role && !it.spawn) yield go(it.role);
          yield { type: 'live', item: it, icon: it.spawn ? '📣' : (it.role ? theme.toolIcons[it.role] : '📝'),
            text: it.spawn ? w().helper : `${it.tool.replace(/^mcp__.+?__/, '')} ${it.label || ''}`.trim() };
          if (!it.done && a.permReq) a.inbox.unshift(it);
          break;
        case 'error': yield { type: 'error' }; break;
        case 'compact': yield { type: 'compact' }; break;
        case 'stop':
          yield go('wrap', 5, 2);
          yield { type: 'work', dur: 1.2, icon: () => w().wrapIcon, text: () => w().wrap, st: 'สรุปงาน' };
          a.carry = true; yield { type: 'inspect' }; yield go('deliver', 8, 3); yield { type: 'deposit' }; a.carry = false;
          a.task = null; a.busy = false;
          break;
        case 'end':
          yield { type: 'follow' };
          yield { type: 'work', dur: .8, icon: '📋', text: 'ส่งผลให้ ' + a.parent.name, st: 'ส่งผลลัพธ์' };
          puff(a.x, a.y - 10, '✨'); a.parent.kids = Math.max(0, a.parent.kids - 1);
          return;
        case 'leave': yield go('idle'); log(a, 'ปิด session แล้ว'); return;
      }
    }
  }
  function clearAgents() {
    for (const a of agents) { a.bub.remove(); a.tag.remove(); }
    agents.length = 0; permQueue.length = 0; bySid.clear(); byAid.clear(); crewNext = 0;
    delivered = 0; toolCalls = 0; car.count = 0; car.phase = 'ready'; inspectQueue.length = 0; bossHome();
  }
  function setMode(m) {
    mode = m; clearAgents(); $('#log').innerHTML = '';
    const applyHide = on => { document.body.classList.toggle('hideText', on); $('#hideTxt').textContent = on ? '🙈' : '👁️'; $('#hideTxt').title = on ? 'กำลังซ่อนข้อความ: คลิกเพื่อแสดง' : 'คลิกเพื่อซ่อนข้อความ (ก่อนแคปหน้าจอ)'; };
  applyHide(localStorage.getItem('av-hide') === '1');
  $('#hideTxt').onclick = () => { const on = !document.body.classList.contains('hideText'); localStorage.setItem('av-hide', on ? '1' : '0'); applyHide(on); };
  $('#acct').onclick = () => { revealUntil = Date.now() + 5000; updatePanels(); };
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
    $('#addAgent').style.display = m === 'demo' ? '' : 'none';
    $('#demoCtrl').style.display = m === 'demo' ? '' : 'none';
    if (m === 'live') document.querySelector('#speed button[data-s="1"]').click();
    $('#addAgent').disabled = false;
    if (m === 'demo') { for (let i = 0; i < 4; i++) addAgent(); log(null, '🎲 โหมดจำลอง'); }
    else { turnLines.clear(); if (gotSnapshot) connect(); } // fresh Snapshot re-adds sessions + replays history
    renderCards();
  }
  let es = null;
  function connect() {
    if (es) es.close();
    es = new EventSource('/stream');
    es.onopen = () => { connected = true; };
    es.onerror = () => { connected = false; };
    es.onmessage = m => { try { onLive(JSON.parse(m.data)); } catch (err) { console.error(err); } };
  }


  function* life(a) {
    yield { type: 'idle', dur: rnd(.3, 2.5) };
    while (true) {
      yield go('intake', 6, 3);
      a.task = pick(TASKS);
      yield { type: 'work', dur: 1.2, icon: '✉️', text: () => w().intake, st: 'รับงานใหม่' };
      log(a, `รับงาน “${a.task}”`); a.ctx = .12;
      if (Math.random() < .4 && agents.filter(x => x.isSub).length < 3) {
        yield { type: 'work', dur: .9, icon: '📣', text: () => w().helper, st: 'แตก subagent' };
        spawnSub(a);
      }
      const n = Math.floor(rnd(3, 6));
      for (let i = 0; i < n; i++) {
        const t = pickTool();
        if ((t.k === 'bash' || t.k === 'web') && Math.random() < .45) {
          const d = pick(DANGER);
          yield { type: 'perm', text: d };
          yield go(t.k);
          yield { type: 'work', dur: rnd(2, 3.5), tool: t.k, text: d };
        } else {
          yield go(t.k);
          yield { type: 'work', dur: rnd(1.8, 3.8), tool: t.k, text: pick(t.acts) };
        }
        a.ctx = Math.min(1, a.ctx + rnd(.1, .2));
        if (Math.random() < .13) yield { type: 'error' };
        if (a.ctx > .85) yield { type: 'compact' };
      }
      while (a.kids > 0) yield { type: 'idle', dur: .4, icon: '⏳', text: 'รอผู้ช่วย' };
      yield go('wrap', 5, 2);
      yield { type: 'work', dur: 2, icon: () => w().wrapIcon, text: () => w().wrap, st: 'สรุปงาน' };
      a.carry = true;
      yield { type: 'inspect' };
      yield go('deliver', 8, 3);
      yield { type: 'deposit' };
      a.carry = false; log(a, fmt(w().delivered, { s: a.task }), 'good'); a.task = null;
      yield go('idle');
      yield { type: 'idle', dur: rnd(2, 5), icon: () => w().restIcon, text: () => w().rest };
    }
  }
  function* subLife(a) {
    log(a, `มาช่วย ${a.parent.name} แล้ว`);
    const n = Math.floor(rnd(2, 4));
    for (let i = 0; i < n; i++) {
      const t = Math.random() < .6 ? TOOLS[0] : TOOLS[3];
      yield go(t.k);
      yield { type: 'work', dur: rnd(1.5, 3), tool: t.k, text: pick(t.acts) };
      a.ctx = Math.min(1, a.ctx + .2);
    }
    yield { type: 'follow' };
    yield { type: 'work', dur: 1, icon: '📋', text: 'ส่งผลให้ ' + a.parent.name, st: 'ส่งผลลัพธ์' };
    log(a, `ส่งผลให้ ${a.parent.name} แล้วกลับ`, 'good');
    puff(a.x, a.y - 10, '✨');
    a.parent.kids--;
  }
  function pickTool() { let r = Math.random() * TOOLS.reduce((s, t) => s + t.w, 0); for (const t of TOOLS) if ((r -= t.w) < 0) return t; return TOOLS[0]; }

  /* ---------------- action runner ---------------- */
  function setBub(a, icon, text, bar) {
    if (!icon) { a.bub.style.display = 'none'; return; }
    a.bub.style.display = 'block';
    a.bub.querySelector('.ic').textContent = icon;
    a.bub.querySelector('.tx').textContent = text || '';
    a.bub.querySelector('.bar').style.display = bar ? 'block' : 'none';
    a.bub.querySelector('.bar b').style.width = '0%';
  }
  function targetXY(a) {
    const c = a.cur;
    if (c && c.type === 'perm') { const p = theme.places.permission, i = Math.max(0, permQueue.indexOf(a)), q = theme.queue || { dx: -14, gap: 10, alt: 3 };
      return { x: p.x + q.dx - i * q.gap, y: p.y + (i % 2 ? q.alt : 0) }; }
    if (c && c.type === 'follow') return { x: a.parent.x + 9, y: a.parent.y + 2 };
    if (c && c.type === 'inspect') { const p = theme.places.permission, q = theme.queue || { dx: -14, gap: 10 }, i = Math.max(0, inspectQueue.indexOf(a)); return { x: p.x - q.dx + i * q.gap, y: p.y + 1 }; }
    if (!a.target) return { x: a.x, y: a.y };
    const p = theme.places[a.target.role];
    return { x: p.x + a.target.ox, y: p.y + a.target.oy };
  }
  function begin(a, c) {
    a.t = 0; a.mode = c.type;
    switch (c.type) {
      case 'walk': {
        const p = theme.places[c.role];
        const jx = c.jx ?? p.jx ?? 8, jy = c.jy ?? p.jy ?? 3;
        a.target = { role: c.role, ox: rnd(-jx, jx), oy: rnd(-jy, jy) };
        setBub(a, null); a.status = a.carry ? w().carry : 'กำลังเดิน'; break;
      }
      case 'idle': setBub(a, val(c.icon), val(c.text), false); a.status = c.st || val(c.text) || 'ว่าง'; a.thinking = !!c.think; break;
      case 'live': setBub(a, c.icon, c.text, true); a.status = c.text; a.thinking = false; break;
      case 'work': {
        const icon = c.tool ? theme.toolIcons[c.tool] : val(c.icon);
        if (c.tool) toolCalls++;
        setBub(a, icon, val(c.text), true); a.status = c.st || val(c.text); break;
      }
      case 'perm': a.approved = false; permQueue.push(a); setBub(a, '✋', c.text, false); a.status = 'รออนุมัติ: ' + c.text;
        log(a, `✋ ${esc(w().permAsk)}: ${esc(c.text)}`, 'warn'); break;
      case 'error': setBub(a, w().errorIcon, w().error, false); a.status = w().error; confetti(a.x, a.y - 8); log(a, w().error, 'bad'); break;
      case 'compact': setBub(a, w().compactIcon, w().compact, true); a.status = 'compact context'; log(a, w().compact, 'warn'); break;
      case 'deposit': setBub(a, null); a.status = w().waitCarrier; break;
      case 'inspect': a.inspected = false; a.inspArrived = false; inspectQueue.push(a); setBub(a, '📋', w().inspect || 'ส่งตรวจ', false); a.status = w().inspect || 'ส่งตรวจ'; break;
      case 'follow': setBub(a, null); a.status = 'กลับไปหา ' + a.parent.name; break;
    }
  }
  function step(a, dt) {
    const c = a.cur; a.t += dt;
    const moving = c.type === 'walk' || c.type === 'perm' || c.type === 'follow' || c.type === 'inspect';
    if (moving) {
      const tg = targetXY(a), dx = tg.x - a.x, dy = tg.y - a.y, d = Math.hypot(dx, dy), v = (a.isSub ? 46 : 38) * dt;
      if (d > .8) { const k = Math.min(1, v / d); a.x += dx * k; a.y += dy * k; if (Math.abs(dx) > .3) a.flip = dx < 0; a.walking = true; }
      else { a.walking = false; if (c.type === 'inspect') a.inspArrived = true; else if (c.type !== 'perm') return true; }
    } else a.walking = false;
    switch (c.type) {
      case 'idle': return a.t >= c.dur;
      case 'inspect': return a.inspected;
      case 'live': {
        const b = a.bub.querySelector('.bar b');
        b.style.width = c.item.done ? '100%' : ((a.t * 70) % 100) + '%';
        if (a.permReq) return true;
        return c.item.done && a.t >= (a.inbox.length > 2 ? .25 : .7);
      }
      case 'work': a.bub.querySelector('.bar b').style.width = Math.min(100, a.t / c.dur * 100) + '%'; return a.t >= c.dur;
      case 'error': return a.t >= 1.8;
      case 'compact': a.bub.querySelector('.bar b').style.width = Math.min(100, a.t / 1.4 * 100) + '%';
        if (a.t >= 1.4) { a.ctx = .3; puff(a.x, a.y - 14, '✨'); return true; } return false;
      case 'perm':
        if (mode === 'demo' && autoApprove && a.t > 6 && permQueue[0] === a) approve(a, false);
        return a.approved;
      case 'deposit':
        if (car.phase === 'ready') { car.count++; if (car.count >= 5) { car.phase = 'leaving'; car.t = 0; } return true; }
        return false;
    }
    return false;
  }
  function approve(a, byUser) {
    if (mode === 'live') { if (byUser && a.cur && a.cur.type === 'perm') log(a, 'กดอนุมัติในแอป Claude นะ (หน้านี้แสดงผลอย่างเดียว)', 'warn'); return; }
    if (!a.cur || a.cur.type !== 'perm' || a.approved) return;
    a.approved = true; permQueue.splice(permQueue.indexOf(a), 1);
    const p = theme.places.permission; puff(p.x, p.y - 20, '✅');
    log(a, byUser ? w().youApprove : w().leadAuto, 'good');
  }
  function tickCarrier(dt) {
    if (car.phase === 'ready') return;
    car.t += dt;
    if (car.phase === 'leaving' && car.t > 2.5) { log(null, fmt(w().carrierGone, { n: car.count }), 'good'); delivered += car.count; car.count = 0; car.phase = 'gone'; car.t = 0; }
    else if (car.phase === 'gone' && car.t > 2) { car.phase = 'returning'; car.t = 0; }
    else if (car.phase === 'returning' && car.t > 2) { car.phase = 'ready'; car.t = 0; }
  }

  /* ---------------- fx ---------------- */
  function confetti(x, y) {
    const cols = ['#ff5a4e', '#ffd54a', '#6fd3ff', '#9fe0a8', '#ff9ad5', '#fff'];
    for (let i = 0; i < 18; i++) particles.push({ x, y, vx: rnd(-30, 30), vy: rnd(-45, -10), life: 1, col: pick(cols) });
  }
  function puff(x, y, ch) {
    const p = document.createElement('div'); p.className = 'puff'; p.textContent = ch;
    p.style.left = x * scale + 'px'; p.style.top = y * scale + 'px';
    overlay.appendChild(p); setTimeout(() => p.remove(), 1000);
  }

  /* ---------------- layout ---------------- */
  function fit() {
    const r = mapCell.getBoundingClientRect();
    scale = Math.max(1, Math.min((r.width - 8) / W, (r.height - 8) / H));
    stageBox.style.width = W * scale + 'px'; stageBox.style.height = H * scale + 'px';
    document.querySelectorAll('.sign').forEach(s => { s.style.left = s.dataset.x * scale + 'px'; s.style.top = s.dataset.y * scale + 'px'; });
    document.documentElement.style.setProperty('--px', scale);
  }
  addEventListener('resize', fit);

  /* ---------------- theme switching ---------------- */
  function setTheme(id) {
    theme = THEMES[id] || THEMES[THEME_ORDER[0]];
    sctx.clearRect(0, 0, W, H); theme.drawStatic(sctx);
    for (const [k, v] of Object.entries(theme.ui)) document.documentElement.style.setProperty('--' + k, v);
    $('#title').textContent = theme.title; $('#titleIcon').textContent = theme.icon; $('#loc').textContent = theme.location;
    document.querySelectorAll('.unitIcon').forEach(e => e.textContent = theme.unitIcon);
    $('#missionTitle').textContent = theme.mission.title;
    overlay.querySelectorAll('.sign').forEach(s => s.remove());
    overlay.dataset.signs = theme.signStyle || '';
    for (const s of theme.signs) {
      const d = document.createElement('div'); d.className = 'sign' + (s.small ? ' small' : '');
      d.dataset.x = s.x; d.dataset.y = s.y;
      d.innerHTML = `<span class="si">${s.icon}</span><span><b>${s.text}</b><small>${s.sub}</small></span>`;
      overlay.prepend(d);
    }
    document.querySelectorAll('.themeBtn,.tb').forEach(b => b.classList.toggle('on', b.dataset.id === theme.id));
    bossHome();
    for (const a of agents) { const p = targetXY(a); a.x = p.x; a.y = p.y; if (a.cur && a.cur.type === 'perm') { const q = targetXY(a); a.x = q.x; a.y = q.y; } }
    history.replaceState(null, '', '#' + theme.id);
    renderCards(); fit();
    if (agents.length) log(null, `สลับธีมเป็น ${theme.icon} ${theme.name}`);
  }

  /* ---------------- panels ---------------- */
  function portrait(drawFn) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 25; c.className = 'pt';
    const g = c.getContext('2d'); drawFn(g); return c;
  }
  function renderCards() {
    if (!theme) return;
    const bar = $('#agents'); bar.innerHTML = '';
    const lead = document.createElement('div'); lead.className = 'card lead';
    lead.appendChild(portrait(g => theme.drawLeadPortrait(g, 8, 23)));
    lead.insertAdjacentHTML('beforeend', `<div class="cb"><div class="nm">${theme.lead.name}</div><div class="rl">${theme.lead.title}</div><div class="st"><i></i><span></span></div></div>`);
    bar.appendChild(lead);
    for (const a of agents.filter(a => !a.isSub)) {
      const c = document.createElement('div'); c.className = 'card'; c.style.setProperty('--c', a.color);
      c.appendChild(portrait(g => (theme.drawPortrait || theme.drawChar).call(theme, g, { ...a, x: 8, y: 23, flip: false, mode: 'idle', walking: false, carry: false }, 0, 0)));
      c.insertAdjacentHTML('beforeend', `<div class="cb"><div class="nm">${a.name}</div><div class="rl">${a.project ? '📁 ' + a.project : theme.crew[a.crewIdx]}</div><div class="st"><i></i><span></span></div><div class="ctx" title="context"><b></b></div><div class="subs"></div></div>`);
      c.onclick = () => approve(a, true);
      a.card = c; bar.appendChild(c);
    }
    $('#leadCard')?.remove(); lead.id = 'leadCard';
  }
  // Tab title + favicon carry the "waiting for you" state, so it is visible from the taskbar while you work in Claude.
  let favChar = '', lastTitle = '';
  function setFavicon(ch) {
    if (ch === favChar) return; favChar = ch;
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.font = '52px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 32, 36);
    $('#favicon').href = c.toDataURL();
  }
  function updateAttention() {
    const pq = permQueue.filter(a => agents.includes(a)), n = pq.length;
    const title = n ? `✋ (${n}) รออนุมัติ — ${pq[0].name}` : `${theme.icon} ${theme.title} · Agent Village`;
    if (title !== lastTitle) { document.title = title; lastTitle = title; }
    setFavicon(n ? '✋' : theme.icon);
    const band = $('#permBand');
    band.hidden = !n;
    if (n) {
      const a = pq[0];
      band.querySelector('.who').textContent = a.name;
      band.querySelector('.what').textContent = String(a.status || '').replace(/^รออนุมัติ:\s*/, '');
      band.querySelector('.how').textContent = mode === 'live' ? '→ กดอนุมัติในแอป Claude' : '→ คลิกตัวละครเพื่ออนุมัติ (จำลอง)';
      band.querySelector('.more').textContent = n > 1 ? `+${n - 1} รายการ` : '';
    }
  }
  function updatePanels() {
    updateAttention();
    for (const a of agents.filter(a => !a.isSub && a.card)) {
      const c = a.card, i = c.querySelector('.st i');
      i.style.background = MODE_COL[a.mode] || '#999'; i.title = MODE_NAME[a.mode] || '';
      c.querySelector('.st span').textContent = a.status;
      const b = c.querySelector('.ctx b'); b.style.width = a.ctx * 100 + '%'; b.classList.toggle('full', a.ctx > .8);
      c.querySelector('.ctx').title = a.ctxTokens ? `context ${Math.round(a.ctxTokens / 1000)}k tokens` : 'context';
      if (a.thinking) i.style.background = '#c9a0ff';
      c.classList.toggle('perm', a.mode === 'perm' && !a.approved);
      const subs = agents.filter(s => s.parent === a);
      c.querySelector('.subs').textContent = subs.length ? '↳ ' + subs.map(s => s.status).join(' · ') : '';
    }
    const lead = $('#leadCard');
    if (lead) {
      lead.querySelector('.st i').style.background = permQueue.length ? '#ffd54a' : '#5fd16f';
      lead.querySelector('.st span').textContent = permQueue.length ? fmt(w().leadBusy, { n: permQueue.length })
        : inspectQueue.length ? `ตรวจงาน ${inspectQueue.length} ชิ้น` : !boss.atDesk ? (boss.mode === 'return' ? 'กลับโต๊ะ' : `👀 เดินดู ${boss.target ? boss.target.name : ''}`) : boss.wave > 0 ? '👋 ทักทาย' : w().leadIdle;
    }
    const main = agents.filter(a => !a.isSub);
    $('#sDone').textContent = delivered;
    $('#sRate').textContent = clock > 20 ? '+' + Math.round(delivered / clock * 3600) + '/ชม.' : '';
    $('#sTools').textContent = toolCalls;
    $('#sCtx').textContent = main.length ? Math.round(main.reduce((s, a) => s + a.ctx, 0) / main.length * 100) + '%' : '0%';
    $('#sPerm').textContent = permQueue.length; $('#permPill').classList.toggle('hot', permQueue.length > 0);
    const lp = $('#limitPill');
    if (rate && (rate.five_hour || rate.seven_day)) {
      lp.style.display = '';
      const f = rate.five_hour, s7 = rate.seven_day;
      $('#sLimit').textContent = [f ? `5 ชม. ${Math.round(f.used_percentage)}%` : '', s7 ? `7 วัน ${Math.round(s7.used_percentage)}%` : ''].filter(Boolean).join(' · ');
      lp.title = f ? 'ลิมิต 5 ชม. รีเซ็ตเวลา ' + new Date(f.resets_at * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
    } else lp.style.display = 'none';
    $('#liveDot').className = 'ld ' + (mode === 'live' ? (connected ? 'on' : 'off') : 'demo');
    let lt;
    if (mode === 'demo') lt = 'ข้อมูลจำลอง: สุ่มในหน้าเว็บ ไม่เรียก Claude';
    else if (!connected) lt = 'ยังต่อ server ในเครื่องไม่ได้';
    else if (!lastEventAt) lt = 'ต่อ server แล้ว แต่ยังไม่มีเหตุการณ์จาก Claude Code';
    else { const s = Math.round((Date.now() - lastEventAt) / 1000); lt = 'ได้รับเหตุการณ์จริงล่าสุด ' + (s < 60 ? s + ' วิ' : Math.round(s / 60) + ' นาที') + 'ที่แล้ว'; }
    $('#liveText').textContent = lt;
    if (account && account.email) {
      const [u, d] = account.email.split('@');
      const shown = revealUntil > Date.now() ? account.email : u.slice(0, 5) + '•••@' + d;
      $('#acct').textContent = '👤 ' + shown + (account.billing === 'stripe_subscription' ? ' · แพ็กเกจสมาชิก' : '');
      $('#acct').title = revealUntil > Date.now() ? '' : 'คลิกเพื่อดูอีเมลเต็ม 5 วินาที';
    } else $('#acct').textContent = '';
    $('#liveDot').className = 'ld ' + (mode === 'live' ? (connected && lastEventAt && Date.now() - lastEventAt < 120000 ? 'on' : 'off') : 'demo');
    $('#emptyHint').style.display = mode === 'live' && !agents.length ? '' : 'none';
    $('#sWorking').textContent = agents.filter(a => a.mode !== 'idle').length + '/' + agents.length;
    const g = theme.mission.goal, pct = Math.min(100, delivered / g * 100);
    $('#missionBar').style.width = pct + '%'; $('#missionNum').textContent = `${delivered} / ${g}`;
    if (theme.mission.countdown === 'christmas') {
      const now = new Date(), xm = new Date(now.getFullYear(), 11, 25); if (now > xm) xm.setFullYear(xm.getFullYear() + 1);
      $('#missionTime').textContent = `⏱ อีก ${Math.ceil((xm - now) / 864e5)} วันถึงคริสต์มาส`;
    } else $('#missionTime').textContent = theme.mission.timeText || '';
    const d = new Date(); $('#clock').textContent = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    // minimap
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(staticLayer, 0, 0, mini.width, mini.height);
    const k = mini.width / W;
    for (const a of agents) { mctx.fillStyle = '#000'; mctx.fillRect(a.x * k - 2, a.y * k - 4, 5, 5); mctx.fillStyle = a.color; mctx.fillRect(a.x * k - 1, a.y * k - 3, 3, 3); }
  }

  /* ---------------- controls ---------------- */
  const tl = $('#themeList');
  for (const id of THEME_ORDER) {
    const t = THEMES[id], b = document.createElement('button');
    b.className = 'themeBtn'; b.dataset.id = id; b.innerHTML = `<span>${t.icon}</span>${t.name}`;
    b.onclick = () => setTheme(id); tl.appendChild(b);
  }
  document.querySelectorAll('#speed button').forEach(b => b.onclick = () => {
    speed = +b.dataset.s; document.querySelectorAll('#speed button').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#auto').onchange = e => autoApprove = e.target.checked;
  // compact layout (≤1280px): move the few controls the left column held into the top bar / activity panel
  for (const id of THEME_ORDER) {
    const t = THEMES[id], b = document.createElement('button');
    b.className = 'tb'; b.dataset.id = id; b.textContent = t.icon; b.title = t.name; b.setAttribute('aria-label', t.name);
    b.onclick = () => setTheme(id); $('#themeMini').appendChild(b);
  }
  const compactQ = matchMedia('(max-width:1280px)');
  function applyCompact() {
    const on = compactQ.matches, team = $('#teamPanel'), add = $('#addAgent');
    document.body.classList.toggle('compact', on);
    if (on) { $('#compactBar').append($('#modeSeg'), add); $('#actFoot').append($('#demoCtrl'), $('.liveStat'), $('#acct'), $('.hint')); }
    else {
      $('.modeRow').appendChild($('#modeSeg')); $('.top').appendChild($('#demoCtrl'));
      team.insertBefore($('.liveStat'), $('.legend')); team.insertBefore($('#acct'), $('.legend'));
      team.insertBefore(add, $('.legend')); team.insertBefore($('.hint'), $('.legend'));
    }
    fit();
  }
  compactQ.addEventListener('change', applyCompact); applyCompact();
  $('#addAgent').onclick = addAgent;
  document.querySelectorAll('#modeSeg button').forEach(b => b.onclick = () => setMode(b.dataset.m));
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale;
    let best = null, bd = 12;
    for (const a of agents) { const d = Math.hypot(a.x - x, a.y - 6 - y); if (d < bd) { bd = d; best = a; } }
    if (best) approve(best, true);
  });

  /* ---------------- main loop ---------------- */
  ctx.imageSmoothingEnabled = false;
  setTheme(location.hash.slice(1));
  setMode('demo');
  connect();

  let last = performance.now(), panelT = 0;
  function frame(now) {
    const rdt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = Math.max(last, now);
    const dt = rdt * speed; clock += dt;
    const t = now / 1000;
    for (const a of [...agents]) {
      if (!a.cur) {
        const r = a.gen.next();
        if (r.done) { a.bub.remove(); a.tag.remove(); agents.splice(agents.indexOf(a), 1); if (inspectQueue.includes(a)) inspectQueue.splice(inspectQueue.indexOf(a), 1); if (a.sid && bySid.get(a.sid) === a) bySid.delete(a.sid); renderCards(); continue; }
        a.cur = r.value; begin(a, a.cur);
      }
      if (step(a, dt)) a.cur = null;
    }
    tickCarrier(dt);
    tickBoss(dt);

    ctx.drawImage(staticLayer, 0, 0);
    theme.drawAmbient(ctx, t);
    theme.drawCarrier(ctx, car, t);
    boss.frame = boss.walking ? (Math.floor(t * 8) % 2 ? 1 : 2) : 0;
    theme.drawLead(ctx, t, permQueue.length > 0, boss);
    const drawList = [...agents]; if (!boss.atDesk) drawList.push({ isBoss: true, y: boss.y });
    for (const a of drawList.sort((p, q) => p.y - q.y)) {
      if (a.isBoss) { theme.drawLeadChar(ctx, boss, t); continue; }
      const frameN = a.walking ? (Math.floor(t * 8) % 2 ? 1 : 2) : 0;
      const jit = a.mode === 'error' ? Math.round(Math.sin(t * 30)) : 0;
      theme.drawChar(ctx, { ...a, x: a.x + jit }, frameN, t);
      if (a.carry) theme.drawCarry(ctx, Math.round(a.x), Math.round(a.y));
      a.bub.style.transform = `translate(${a.x * scale}px,${(a.y - 22) * scale}px) translate(-50%,-100%)`;
      a.tag.style.transform = `translate(${a.x * scale}px,${(a.y + 1) * scale}px) translate(-50%,0)`;
      a.bub.classList.toggle('perm', a.mode === 'perm' && !a.approved);
      a.bub.classList.toggle('err', a.mode === 'error');
      a.bub.style.zIndex = a.tag.style.zIndex = 100 + Math.round(a.y);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.x += p.vx * rdt; p.y += p.vy * rdt; p.vy += 90 * rdt; p.life -= rdt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    theme.drawWeather(ctx, t, rdt);
    { const seat = theme.leadSeat || bossFront(), bx = boss.atDesk ? seat.x : boss.x, by = boss.atDesk ? seat.y : boss.y;
      bossBub.style.display = performance.now() < bossSayUntil ? 'block' : 'none';
      bossBub.style.transform = `translate(${bx * scale}px,${(by - 23) * scale}px) translate(-50%,-100%)`; }
    panelT += rdt; if (panelT > .25) { panelT = 0; updatePanels(); }
    if (!stepping) requestAnimationFrame(frame);
  }
  let stepping = false;
  requestAnimationFrame(frame);
  // debug helper: fast-forward the simulation without the browser's frame timer
  window.__ws = { agents, setTheme, car, get clock() { return clock; },
    advance(sec) { stepping = true; let t = last; for (let i = 0; i < sec * 20; i++) { t += 50; frame(t); } stepping = false; } };
})();
