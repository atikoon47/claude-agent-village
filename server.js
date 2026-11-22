// Agent Village local server (127.0.0.1 only).
//  - serves the page
//  - POST /hook   : receives event summaries from the Claude Code hook / status line scripts
//  - GET  /stream : pushes those events to the page (Server-Sent Events)
// It never calls Claude or any outside service.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = 5179;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const clients = new Set();
const sessions = new Map();   // sid -> { sid, project, last, ctxTokens, ended }
let rate = null;

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
    if (!file || !file.endsWith('.jsonl')) return null;
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
  if (e.ev === 'StatusLine') { if (e.rate) rate = e.rate; }
  else if (e.sid) {
    const s = sessions.get(e.sid) || { sid: e.sid, project: e.project, ctxTokens: null, ended: false };
    s.last = Date.now(); if (e.project) s.project = e.project;
    if (e.ev === 'SessionEnd') s.ended = true; else s.ended = false;
    if (!e.aid && ['PostToolUse', 'PostToolUseFailure', 'Stop', 'UserPromptSubmit', 'SessionStart'].includes(e.ev)) {
      const t = ctxFromTranscript(e.transcript); if (t != null) { s.ctxTokens = t; e.ctxTokens = t; }
    }
    sessions.set(e.sid, s);
  }
  delete e.transcript;
  if (!e.aid && HISTORY_EVENTS.includes(e.ev)) { history.push(e); if (history.length > 300) history.splice(0, history.length - 300); }
  broadcast(e);
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'POST' && url.pathname === '/hook') {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 64 * 1024) req.destroy(); });
    req.on('end', () => { try { onHook(JSON.parse(body)); } catch { } res.writeHead(204); res.end(); });
    return;
  }
  if (url.pathname === '/stream') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    const cutoff = Date.now() - 30 * 60 * 1000;
    const active = [...sessions.values()].filter(s => !s.ended && s.last > cutoff);
    res.write(`data: ${JSON.stringify({ ev: 'Snapshot', sessions: active, rate, account: whoami(), lastHookAt, history })}\n\n`);
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }
  let p = decodeURIComponent(url.pathname); if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Agent Village → http://localhost:${PORT}`));
