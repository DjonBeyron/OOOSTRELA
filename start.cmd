@echo off
rem Double-click to start Strela AI (build web + run gateway). Keep this window open.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
echo.
echo Server stopped. Press any key to close this window.
pause >nul
