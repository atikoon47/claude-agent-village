@echo off
rem Agent Village - double-click to start. Close this window to stop.
cd /d "%~dp0"
title Agent Village (close this window to stop)
where node >nul 2>nul || (
  echo Node.js is not installed. Get it from https://nodejs.org then run this again.
  pause
  exit /b 1
)
rem Port: PORT env var, else ~/.claude/agent-village/config.json (set with: node install.js --port 15179), else 5179
for /f %%p in ('node port.js') do set AV_PORT=%%p
echo Starting Agent Village at http://localhost:%AV_PORT%
echo Keep this window open while you use it. Close it to stop.
start "" http://localhost:%AV_PORT%
node server.js
echo.
echo Server stopped. If it says the port is in use (EADDRINUSE), Agent Village or another program
echo is already using port %AV_PORT%. Pick another one with:  node install.js --port 15179
pause
