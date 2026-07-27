@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm run install-all
if errorlevel 1 pause & exit /b 1

echo Starting the To-Do application...
call npm run dev
pause
