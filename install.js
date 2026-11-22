// Agent Village installer.
//   node install.js           copy hooks/ to ~/.claude/agent-village and register them in ~/.claude/settings.json
//   node install.js --remove  take them out again
// settings.json is backed up before every change. Only Agent Village's own entries are touched.
const fs = require('fs'), path = require('path'), os = require('os');

const claudeDir = path.join(os.homedir(), '.claude');
const settingsPath = path.join(claudeDir, 'settings.json');
const target = path.join(claudeDir, 'agent-village');           // stable copy, so moving/deleting the repo can't break Claude
const targetFwd = target.split(path.sep).join('/');
const FILES = ['hook.js', 'statusline.js'];
const EVENTS = ['SessionStart', 'SessionEnd', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
  'Notification', 'SubagentStart', 'SubagentStop', 'Stop', 'PreCompact'];
const isOurs = g => JSON.stringify(g).includes('agent-village/hook.js');

let s = {};
if (fs.existsSync(settingsPath)) {
  try { s = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
  catch { console.error('Could not parse ' + settingsPath + ' - fix it first, nothing was changed.'); process.exit(1); }
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  fs.copyFileSync(settingsPath, settingsPath + '.bak-agent-village-' + stamp);
  console.log('Backed up settings.json -> settings.json.bak-agent-village-' + stamp);
}
const save = () => { fs.mkdirSync(claudeDir, { recursive: true }); fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2)); };

if (process.argv.includes('--remove')) {
  for (const ev of EVENTS) if (s.hooks && s.hooks[ev]) { s.hooks[ev] = s.hooks[ev].filter(g => !isOurs(g)); if (!s.hooks[ev].length) delete s.hooks[ev]; }
  if (s.hooks && !Object.keys(s.hooks).length) delete s.hooks;
  if (s.statusLine && String(s.statusLine.command).includes('agent-village')) delete s.statusLine;
  save();
  for (const f of FILES) fs.rmSync(path.join(target, f), { force: true });
  try { fs.rmdirSync(target); } catch { }
  console.log('Removed Agent Village hooks. Claude Code is back to how it was.');
  process.exit(0);
}

fs.mkdirSync(target, { recursive: true });
for (const f of FILES) fs.copyFileSync(path.join(__dirname, 'hooks', f), path.join(target, f));

s.hooks = s.hooks || {};
for (const ev of EVENTS) {
  s.hooks[ev] = (s.hooks[ev] || []).filter(g => !isOurs(g));
  s.hooks[ev].push({ hooks: [{ type: 'command', command: 'node', args: [targetFwd + '/hook.js'], async: true, timeout: 5 }] });
}
if (!s.statusLine) s.statusLine = { type: 'command', command: `node "${targetFwd}/statusline.js"` };
else if (!String(s.statusLine.command).includes('agent-village')) console.log('You already have a status line - left it unchanged.');
save();
console.log('Installed. Start the page with start.bat (or: npm start) and open http://localhost:5179');
