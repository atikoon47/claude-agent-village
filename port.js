// Which port Agent Village uses. Order: PORT env var > ~/.claude/agent-village/config.json > 5179.
// Change it with:  node install.js --port 6001   (the hooks read the same config file)
// Run directly (node port.js) to print the port; start.bat uses that.
const fs = require('fs'), path = require('path'), os = require('os');
const DEFAULT = 5179;
const CONFIG = path.join(os.homedir(), '.claude', 'agent-village', 'config.json');
const valid = n => Number.isInteger(n) && n >= 1024 && n <= 65535;
function readConfigPort() {
  try { const n = +JSON.parse(fs.readFileSync(CONFIG, 'utf8')).port; return valid(n) ? n : null; } catch { return null; }
}
function getPort() {
  const env = +process.env.PORT;
  return valid(env) ? env : readConfigPort() || DEFAULT;
}
module.exports = { getPort, valid, CONFIG, DEFAULT };
if (require.main === module) process.stdout.write(String(getPort()));
