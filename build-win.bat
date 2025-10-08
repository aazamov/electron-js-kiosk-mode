@echo off
echo Building Secure Kiosk for Windows...
echo.

REM Clean previous builds
if exist dist rmdir /s /q dist

REM Install dependencies if needed
call npm install

REM Build for Windows
call npm run dist:win

echo.
echo Build complete! Check the 'dist' folder for the installer.
echo The installer will be named 'Secure Kiosk Setup 1.0.0.exe'
pause
