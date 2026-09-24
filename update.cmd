@echo off
rem Double-click to update Strela AI from GitHub and restart. Close the old server window first.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update.ps1"
echo.
echo Server stopped. Press any key to close this window.
pause >nul
