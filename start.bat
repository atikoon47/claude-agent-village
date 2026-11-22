@echo off
rem Agent Village - double-click to start. Close this window to stop.
cd /d "%~dp0"
title Agent Village (close this window to stop)
where node >nul 2>nul || (
  echo Node.js is not installed. Get it from https://nodejs.org then run this again.
  pause
  exit /b 1
)
echo Starting Agent Village at http://localhost:5179
echo Keep this window open while you use it. Close it to stop.
start "" http://localhost:5179
node server.js
echo.
echo Server stopped. If it says the port is in use, Agent Village is already running.
pause
