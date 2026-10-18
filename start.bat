@echo off
title Sentri Remote Reporting System
echo ===================================================
echo   Starting Sentri Remote Reporting System...
echo ===================================================
echo.
cd /d "%~dp0"
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies (first time only)...
    call npm.cmd install
)
echo.
echo Launching development server on http://localhost:3000...
echo (Press Ctrl+C to stop the server)
echo.
start http://localhost:3000
call npm.cmd run dev -- --port 3000
pause

