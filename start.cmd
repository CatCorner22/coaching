@echo off
rem Start Knotty on this computer (Windows).
setlocal
set "NODE_EXE="
node -e "process.exit(process.versions.node.split('.')[0] === '22' ? 0 : 1)" >nul 2>&1
if not errorlevel 1 set "NODE_EXE=node"
if defined NODE_EXE goto launch
if not exist "%LOCALAPPDATA%\node22\node.exe" goto missing
"%LOCALAPPDATA%\node22\node.exe" -e "process.exit(process.versions.node.split('.')[0] === '22' ? 0 : 1)" >nul 2>&1
if not errorlevel 1 set "NODE_EXE=%LOCALAPPDATA%\node22\node.exe"
if not defined NODE_EXE goto missing
:launch
set "KNOTTY_LAUNCHER_PAUSES=1"
"%NODE_EXE%" "%~dp0start.mjs" %*
if not errorlevel 1 exit /b 0
pause
exit /b 1
:missing
echo Node 22 is required. Download Node 22 from https://nodejs.org/en/download/archive/v22
echo Or install it in %%LOCALAPPDATA%%\node22 (including npm.cmd).
pause
exit /b 1
