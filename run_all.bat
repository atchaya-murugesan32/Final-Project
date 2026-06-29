@echo off
REM One-click launcher for CafeMonitor backend and frontend (Windows)
REM Double-click this file to start backend (uvicorn) and frontend (Expo) in separate windows.

setlocal
set "ROOT_DIR=%~dp0"
echo Starting CafeMonitor services from %ROOT_DIR%

:: Start Backend in a new window using the helper script
start "CafeMonitor Backend" cmd /k "cd /d "%ROOT_DIR%CAFEMONITOR" && call "%ROOT_DIR%CAFEMONITOR\backend_start.bat""

:: Start Frontend in a new window using the helper script
start "ZenBrew Frontend" cmd /k "cd /d "%ROOT_DIR%FRONTEND" && call "%ROOT_DIR%FRONTEND\frontend_start.bat""

:: Open health check and frontend web page in the default browser after a short delay
echo Waiting for services to start...
timeout /t 8 /nobreak > nul
start "" "http://127.0.0.1:8000/health"
start "" "http://127.0.0.1:8081"
echo Done. Two windows should be open for backend and frontend, and browser tabs should open for the API health check and Expo web UI.
pause
endlocal
