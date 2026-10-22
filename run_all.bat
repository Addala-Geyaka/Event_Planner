@echo off
title CelebratAI Starter
echo ====================================================
echo Launching CelebratAI Full-Stack Application...
echo ====================================================

start "CelebratAI Backend" cmd /k ""%~dp0run_backend.bat""
timeout /t 3 >nul

start "CelebratAI Frontend" cmd /k ""%~dp0run_frontend.bat""
timeout /t 4 >nul

echo Opening browser...
start http://localhost:5173
