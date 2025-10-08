@echo off
echo ============================================
echo Secure Kiosk - Cleanup Tool
echo ============================================
echo.
echo This script will:
echo 1. Force close any running Secure Kiosk instances
echo 2. Attempt to uninstall the old version
echo 3. Clean up leftover files
echo.
echo Please make sure to run this as Administrator!
echo.
pause

echo.
echo [Step 1] Closing Secure Kiosk...
taskkill /F /IM "Secure Kiosk.exe" /T 2>nul
if %errorlevel% equ 0 (
    echo Successfully closed Secure Kiosk
) else (
    echo Secure Kiosk was not running or already closed
)
timeout /t 2 /nobreak >nul

echo.
echo [Step 2] Attempting to uninstall via Windows Installer...
wmic product where name="Secure Kiosk" call uninstall /nointeractive 2>nul
if %errorlevel% equ 0 (
    echo Successfully uninstalled via Windows Installer
) else (
    echo Could not uninstall via Windows Installer (may not be installed)
)
timeout /t 2 /nobreak >nul

echo.
echo [Step 3] Cleaning up leftover files...

if exist "C:\Program Files\Secure Kiosk" (
    echo Removing: C:\Program Files\Secure Kiosk
    rd /s /q "C:\Program Files\Secure Kiosk" 2>nul
)

if exist "%APPDATA%\Secure Kiosk" (
    echo Removing: %APPDATA%\Secure Kiosk
    rd /s /q "%APPDATA%\Secure Kiosk" 2>nul
)

if exist "%LOCALAPPDATA%\Secure Kiosk" (
    echo Removing: %LOCALAPPDATA%\Secure Kiosk
    rd /s /q "%LOCALAPPDATA%\Secure Kiosk" 2>nul
)

if exist "%LOCALAPPDATA%\electron-js-test" (
    echo Removing: %LOCALAPPDATA%\electron-js-test
    rd /s /q "%LOCALAPPDATA%\electron-js-test" 2>nul
)

echo.
echo ============================================
echo Cleanup Complete!
echo ============================================
echo.
echo You can now install the new version of Secure Kiosk.
echo.
pause
