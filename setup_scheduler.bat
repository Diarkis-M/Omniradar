@echo off
REM ============================================================
REM Omniradar — Windows Task Scheduler Setup
REM
REM Creates 4 scheduled tasks to run the pipeline daily:
REM   06:00 AM — Morning scan (captures overnight activity)
REM   12:00 PM — Midday scan (captures morning trends)
REM   06:00 PM — Evening scan (captures afternoon trends)
REM   11:30 PM — Night scan (captures full day)
REM
REM Run this script ONCE as Administrator to set up all tasks.
REM To remove: schtasks /delete /tn "Omniradar_Morning" /f (etc.)
REM ============================================================

echo Setting up Omniradar scheduled tasks...
echo.

set PYTHON_PATH=python
set SCRIPT_PATH=%~dp0run_and_deploy.py
set WORK_DIR=%~dp0

echo Creating Morning scan (6:00 AM)...
schtasks /create /tn "Omniradar_Morning" /tr "\"%PYTHON_PATH%\" \"%SCRIPT_PATH%\"" /sc daily /st 06:00 /f

echo Creating Midday scan (12:00 PM)...
schtasks /create /tn "Omniradar_Midday" /tr "\"%PYTHON_PATH%\" \"%SCRIPT_PATH%\"" /sc daily /st 12:00 /f

echo Creating Evening scan (6:00 PM)...
schtasks /create /tn "Omniradar_Evening" /tr "\"%PYTHON_PATH%\" \"%SCRIPT_PATH%\"" /sc daily /st 18:00 /f

echo Creating Night scan (11:30 PM)...
schtasks /create /tn "Omniradar_Night" /tr "\"%PYTHON_PATH%\" \"%SCRIPT_PATH%\"" /sc daily /st 23:30 /f

echo.
echo ============================================================
echo All 4 scheduled tasks created successfully!
echo.
echo   Omniradar_Morning  — 06:00 AM daily
echo   Omniradar_Midday   — 12:00 PM daily
echo   Omniradar_Evening  — 06:00 PM daily
echo   Omniradar_Night    — 11:30 PM daily
echo.
echo To view: schtasks /query /tn "Omniradar_Morning"
echo To delete: schtasks /delete /tn "Omniradar_Morning" /f
echo To run now: schtasks /run /tn "Omniradar_Morning"
echo ============================================================
pause
