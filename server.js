// Agent Village local server (127.0.0.1 only).
//  - serves the page
//  - POST /hook   : receives event summaries from the Claude Code hook / status line scripts
//  - GET  /stream : pushes those events to the page (Server-Sent Events)
// It never calls Claude or any outside service.
const http = require('http'), fs = require('fs'), path = require('path');
const portCfg = require('./port'), ROOT = __dirname, PORT = portCfg.getPort();
// The hook scripts run inside Claude Code, so they never see this server's PORT env var: they use config.json or 5179.
const HOOK_PORT = (() => { try { const n = +JSON.parse(fs.readFileSync(portCfg.CONFIG, 'utf8')).port; return portCfg.valid(n) ? n : portCfg.DEFAULT; } catch { return portCfg.DEFAULT; } })();
// Safety: only answer requests addressed to this machine by name (blocks DNS-rebinding pages from reading /stream).
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, `[::1]:${PORT}`]);
// Only transcripts inside Claude Code's own projects folder may be read (and only their token counts).
const PROJECTS_DIR = path.join(require('os').homedir(), '.claude', 'projects');
const norm = f => process.platform === 'win32' ? f.toLowerCase() : f;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const clients = new Set();
const sessions = new Map();   // sid -> { sid, project, last, ctxTokens, ended }
let rate = null, statusSeenAt = null;
const BOOT_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); // lets the page tell a restart from a reconnect
const LONG_TOOL_TTL = 3 * 60 * 60 * 1000; // a session with a tool still running may stay silent this long
const SESSION_TTL = 30 * 60 * 1000; // a session with no events for this long is treated as gone (its SessionEnd may never come)

// Is Agent Village's status line the one Claude Code runs? Plan usage (5h / 7d limits) only arrives through it.
function statusLineOwner() {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.claude', 'settings.json'), 'utf8'));
    if (!s.statusLine) return 'none';
    return String(s.statusLine.command || '').includes('agent-village') ? 'ours' : 'other';
  } catch { return 'unknown'; }
}

function whoami() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.claude.json'), 'utf8'));
    const o = j.oauthAccount || {};
    return { email: o.emailAddress || null, billing: o.billingType || null };
  } catch { return { email: null, billing: null }; }
}
let lastHookAt = null;
// recent activity, kept in memory only (never written to disk) so a page reload doesn't lose it
const history = [], HISTORY_EVENTS = ['SessionStart', 'SessionEnd', 'UserPromptSubmit', 'PreToolUse', 'PostToolUseFailure', 'Stop', 'Notification'];

function broadcast(obj) { const s = `data: ${JSON.stringify(obj)}\n\n`; for (const c of clients) c.write(s); }

// Read only the tail of the local transcript to find the latest context size.
function ctxFromTranscript(file) {
  try {
    if (typeof file !== 'string' || !file.endsWith('.jsonl')) return null;
    const full = path.resolve(file);
    if (!norm(full).startsWith(norm(PROJECTS_DIR + path.sep))) return null;
    file = full;
    const st = fs.statSync(file), len = Math.min(st.size, 256 * 1024);
    const fd = fs.openSync(file, 'r'), buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, st.size - len); fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i].includes('"usage"')) continue;
      try { const u = JSON.parse(lines[i]).message?.usage; if (u) return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); } catch { }
    }
  } catch { }
  return null;
}

function onHook(e) {
  if (!e || typeof e !== 'object' || !e.ev) return;
  if (e.ev !== 'StatusLine') lastHookAt = Date.now();
  if (e.ev === 'StatusLine') { statusSeenAt = Date.now(); if (e.rate) rate = e.rate; }
  else if (e.sid) {
    const s = sessions.get(e.sid) || { sid: e.sid, project: e.project, ctxTokens: null, ended: false, running: 0 };
    if (!e.aid) {
      if (e.ev === 'PreToolUse') s.running++;
      else if (e.ev === 'PostToolUse' || e.ev === 'PostToolUseFailure') s.running = Math.max(0, s.running - 1);
      else if (e.ev === 'Stop' || e.ev === 'UserPromptSubmit') s.running = 0;
    }
    s.last = Date.now(); if (e.project) s.project = e.project;
    if (e.ev === 'SessionEnd') s.ended = true; else s.ended = false;
    if (!e.aid && ['PostToolUse', 'PostToolUseFailure', 'Stop', 'UserPromptSubmit', 'SessionStart'].includes(e.ev)) {
      const t = ctxFromTranscript(e.transcript); if (t != null) { s.ctxTokens = t; e.ctxTokens = t; }
    }
    sessions.set(e.sid, s);
    // forget sessions that ended or went silent long ago, so the map can't grow forever
    for (const [k, v] of sessions) if (Date.now() - v.last > (v.ended ? 60 * 1000 : 6 * 60 * 60 * 1000)) sessions.delete(k);
  }
  delete e.transcript;
  if (!e.aid && HISTORY_EVENTS.includes(e.ev)) { history.push(e); if (history.length > 300) history.splice(0, history.length - 300); }
  broadcast(e);
}

http.createServer((req, res) => {
  if (!ALLOWED_HOSTS.has(String(req.headers.host || '').toLowerCase())) { res.writeHead(421); return res.end(); }
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'POST' && url.pathname === '/hook') {
    // The hook scripts are plain Node requests; browsers always add Origin to cross-site POSTs, so reject those.
    if (req.headers.origin || req.headers['sec-fetch-site']) { res.writeHead(403); return res.end(); }
    let body = '';
    req.on('data', d => { body += d; if (body.length > 64 * 1024) req.destroy(); });
    req.on('end', () => { try { onHook(JSON.parse(body)); } catch { } res.writeHead(204); res.end(); });
    return;
  }
  if (url.pathname === '/stream') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    const cutoff = Date.now() - SESSION_TTL;
    const active = [...sessions.values()].filter(s => !s.ended && (s.last > cutoff || (s.running && s.last > Date.now() - LONG_TOOL_TTL)));
    res.write(`data: ${JSON.stringify({ ev: 'Snapshot', sessions: active, rate, account: whoami(), lastHookAt, history,
      sessionTtl: SESSION_TTL, bootId: BOOT_ID, statusLine: statusLineOwner(), statusSeenAt, port: PORT, hookPort: HOOK_PORT })}\n\n`);
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let p; try { p = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end(); }
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  // stay inside the project and never serve dot-folders such as .git or .claude
  if (!file.startsWith(ROOT + path.sep) || path.relative(ROOT, file).split(path.sep).some(x => x.startsWith('.'))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Agent Village → http://localhost:${PORT}`);
  if (HOOK_PORT !== PORT) console.warn(`Warning: the Claude Code hooks send events to port ${HOOK_PORT}, but this server is on ${PORT}, so nothing will show up.
` +
    `Fix: run  node install.js --port ${PORT}  (or start without the PORT env var).`);
});
