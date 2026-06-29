@echo off
REM Frontend starter for ZenBrew (Expo)
cd /d "%~dp0"
echo Running frontend in %CD%
if not exist "node_modules\.bin\expo" (
  echo Installing frontend dependencies...
  npm install
)
REM Start Expo in localhost mode to avoid tunnel prompts
call npx expo start --localhost --clear
pause
