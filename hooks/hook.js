// Agent Village hook — forwards a SMALL summary of Claude Code events to the local page.
// Safety: prints nothing (so nothing reaches Claude's context), never blocks (runs async),
// only talks to 127.0.0.1, and never sends file contents, diffs or command output.
// It does send the first 120 chars of your prompt and the first 150 chars of Claude's final reply (shown on the local page).
const http = require('http'), path = require('path');
// Port comes from config.json next to this script (written by install.js --port), else 5179.
const PORT = (() => { try { const n = +JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'config.json'), 'utf8')).port; return n >= 1024 && n <= 65535 ? n : 5179; } catch { return 5179; } })();
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => { if (raw.length < 2e6) raw += d; }).on('end', () => {
  let e; try { e = JSON.parse(raw); } catch { return; }
  const ti = e.tool_input || {};
  const short = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  // Turn Claude's markdown reply into one plain sentence-ish line for the activity feed.
  const summary = (txt, n) => {
    let t = String(txt || '')
      .replace(/```[\s\S]*?```/g, ' ')            // code blocks
      .replace(/`([^`]*)`/g, '$1')                // inline code
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')   // links / images -> text
      .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, '') // headings, quotes, list markers
      .replace(/\*\*|__|~~/g, '')                 // bold / strike
      .replace(/(^|\s)[*_]([^*_\n]+)[*_]/g, '$1$2') // italics
      .replace(/^\s*\|.*\|\s*$/gm, ' ')            // table rows
      .replace(/^\s*[-=]{3,}\s*$/gm, ' ');         // rules
    const para = t.split(/\n\s*\n/).map(x => x.replace(/\s+/g, ' ').trim()).find(Boolean) || '';
    if (para.length <= n) return para;
    const cut = para.slice(0, n);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '), cut.lastIndexOf('ครับ '), cut.lastIndexOf('ค่ะ '));
    if (end > n * 0.4) return cut.slice(0, end + (cut[end] === 'ค' ? (cut.startsWith('ครับ', end) ? 4 : 3) : 1)).trim();
    const sp = cut.lastIndexOf(' ');
    return (sp > n * 0.5 ? cut.slice(0, sp) : cut).trim() + '…';
  };
  let label = '';
  if (ti.file_path || ti.notebook_path) label = path.basename(String(ti.file_path || ti.notebook_path));
  else if (ti.command) label = short(ti.command, 40);
  else if (ti.pattern) label = short(ti.pattern, 30);
  else if (ti.url) { try { label = new URL(ti.url).host; } catch { } }
  else if (ti.query) label = short(ti.query, 30);
  else if (ti.description) label = short(ti.description, 40);
  const ev = e.hook_event_name;
  const out = {
    ev, sid: e.session_id, aid: e.agent_id || null, atype: e.agent_type || null,
    project: e.cwd ? path.basename(e.cwd) : '', tool: e.tool_name || '', label, tuid: e.tool_use_id || null,
    ntype: e.notification_type || null, msg: short(e.message, 80),
    prompt: ev === 'UserPromptSubmit' ? short(e.prompt, 120) : undefined,
    reply: ev === 'Stop' && !e.agent_id ? summary(e.last_assistant_message, 150) : undefined,
    failed: ev === 'PostToolUseFailure' && !e.is_interrupt,
    transcript: e.transcript_path || null, ts: Date.now(),
  };
  const body = JSON.stringify(out);
  const req = http.request({ host: '127.0.0.1', port: PORT, path: '/hook', method: 'POST', timeout: 800,
    headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) } }, r => r.resume());
  req.on('error', () => { }); req.on('timeout', () => req.destroy()); req.end(body);
});
