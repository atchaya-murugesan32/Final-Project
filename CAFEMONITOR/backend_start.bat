@echo off
REM Backend starter for CafeMonitor
cd /d "%~dp0"
echo Running backend in %CD%
if exist .venv\Scripts\activate.bat call .venv\Scripts\activate.bat
if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat
if exist requirements.txt (
  echo Installing Python requirements...
  pip install -r requirements.txt
)

REM Start uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
