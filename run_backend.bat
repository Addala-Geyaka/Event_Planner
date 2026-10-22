@echo off
title CelebratAI Backend Server
cd /d "%~dp0event-planner-backend"
echo ====================================================
echo Starting CelebratAI Backend Server on port 8000...
echo ====================================================
python -m uvicorn main:app --reload --port 8000
pause
