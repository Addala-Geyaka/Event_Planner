@echo off
title CelebratAI Frontend Dev Server
cd /d "%~dp0event-planner-frontend"
echo ====================================================
echo Starting CelebratAI Frontend Server on port 5173...
echo ====================================================
npm run dev
pause
