@echo off
title Study Saathi - Local AI Study Companion

echo ========================================
echo     Study Saathi - Starting Up...
echo ========================================
echo.

:: Start FastAPI backend in a new window
echo [1/2] Starting Backend (FastAPI on port 8000)...
start "Study Saathi - Backend" cmd /k "cd /d %~dp0backend && python main.py"

:: Wait a moment for backend to boot
timeout /t 3 /nobreak >nul

:: Start Vite frontend in a new window
echo [2/2] Starting Frontend (Vite on port 5173)...
start "Study Saathi - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo  Study Saathi is running!
echo  Open: http://localhost:5173
echo ========================================
echo.
pause
