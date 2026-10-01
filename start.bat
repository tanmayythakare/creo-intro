@echo off
title Creo SPA Local Server
cd /d "%~dp0"
echo ===================================================
echo Starting Creo SPA at http://localhost:3000 ...
echo ===================================================
start http://localhost:3000/
node server.js
pause
