// Agent Village status line — Claude Code itself passes plan usage (rate_limits) here.
// No login token is read. Prints a short line for the terminal, then forwards the numbers locally.
const http = require('http');
// Port comes from config.json next to this script (written by install.js --port), else 5179.
const PORT = (() => { try { const n = +JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'config.json'), 'utf8')).port; return n >= 1024 && n <= 65535 ? n : 5179; } catch { return 5179; } })();
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => raw += d).on('end', () => {
  let e = {}; try { e = JSON.parse(raw); } catch { }
  const cw = e.context_window || {}, rl = e.rate_limits || null;
  const parts = [];
  if (cw.used_percentage != null) parts.push(`ctx ${Math.round(cw.used_percentage)}%`);
  if (rl && rl.five_hour) parts.push(`5h ${Math.round(rl.five_hour.used_percentage)}%`);
  if (rl && rl.seven_day) parts.push(`7d ${Math.round(rl.seven_day.used_percentage)}%`);
  process.stdout.write('🏡 ' + (parts.join(' · ') || 'agent village'));
  const body = JSON.stringify({ ev: 'StatusLine', sid: e.session_id, project: '', ctxPct: cw.used_percentage ?? null, rate: rl, ts: Date.now() });
  const req = http.request({ host: '127.0.0.1', port: PORT, path: '/hook', method: 'POST', timeout: 500,
    headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) } }, r => r.resume());
  req.on('error', () => { }); req.on('timeout', () => req.destroy()); req.end(body);
});
