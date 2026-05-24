@echo off
title AgriFlow Enterprise Platform

echo.
echo ================================================
echo   AgriFlow Enterprise Platform - Startup
echo ================================================
echo.

REM -- Step 1: Create PostgreSQL database --
echo [1/4] Creating database (if not exists)...
cd /d "d:\PANIMUGIL FARM DEVELOPER PROJECT\backend"
venv\Scripts\python create_db.py
if errorlevel 1 (
    echo ERROR: Could not connect to PostgreSQL!
    echo Make sure PostgreSQL is running on port 5432
    echo Password: 271527
    pause
    exit /b 1
)

REM -- Step 2: Run database seeder (idempotent) --
echo.
echo [2/4] Seeding database (first-run only)...
venv\Scripts\python seed.py
echo.

REM -- Step 3: Start FastAPI Backend --
echo [3/4] Starting Backend API server (port 8005)...
start "AgriFlow Backend" cmd /k "cd /d d:\PANIMUGIL FARM DEVELOPER PROJECT\backend && venv\Scripts\uvicorn app.main:app --reload --port 8005 --host 0.0.0.0"

REM Wait for backend to initialize
ping 127.0.0.1 -n 5 > nul

REM -- Step 4: Start Vite Frontend --
echo [4/4] Starting Frontend dev server (port 5174)...
start "AgriFlow Frontend" cmd /k "cd /d d:\PANIMUGIL FARM DEVELOPER PROJECT\frontend && npm run dev -- --port 5174"

echo.
echo ================================================
echo   Both servers are starting...
echo ================================================
echo.
echo   Landing Page  : http://localhost:5174
echo   Admin Panel   : http://localhost:5174/admin/login
echo   Backend API   : http://localhost:8005
echo   API Docs      : http://localhost:8005/docs
echo.
echo   Admin Login   : admin / 271527
echo ================================================
echo.
ping 127.0.0.1 -n 4 > nul
start http://localhost:5174/
