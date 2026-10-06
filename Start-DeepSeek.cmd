@echo off
powershell.exe -NoExit -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-DeepSeek.ps1"
if errorlevel 1 pause
