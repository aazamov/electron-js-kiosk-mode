# Windows Installation Troubleshooting Guide

## Common Installation Issues and Solutions

### 1. Prerequisites

Before installing the Electron app on Windows, ensure you have:

- Windows 10 or later (64-bit)
- Node.js installed (v16 or later)
- Visual C++ Redistributable (usually installed with Node.js)
- Administrator rights for installation

### 2. Building the Application

To build the Windows installer:

```bash
# Option 1: Using the batch file
build-win.bat

# Option 2: Using npm directly
npm install
npm run dist:win
```

### 3. Common Issues and Solutions

#### Issue: "Windows Defender SmartScreen prevented an unrecognized app"

**Solution**:

- Click "More info" and then "Run anyway"
- This occurs because the app isn't digitally signed
- For production, consider code signing the application

#### Issue: "Please close Secure Kiosk manually and try again"

**Solution**:

- The installer now automatically closes the running application
- If the message still appears, manually close the app from Task Manager:
  - Press Ctrl+Shift+Esc to open Task Manager
  - Find "Secure Kiosk.exe" in the Processes tab
  - Right-click and select "End Task"
  - Run the installer again
- The installer includes automatic process termination via the `installer.nsh` script

#### Issue: Installation fails with permission errors

**Solution**:

- Run the installer as Administrator
- Ensure you have write permissions to the installation directory
- The installer now uses "asInvoker" execution level to reduce UAC prompts

#### Issue: App crashes on startup

**Solution**:

- Check if you have internet connectivity (the app tries to load an external URL)
- The app now includes a fallback to a local HTML file
- Check Windows Event Viewer for specific error messages

#### Issue: Build fails with "cannot find module"

**Solution**:

```bash
# Clean install dependencies
rmdir /s /q node_modules
del package-lock.json
npm install
```

#### Issue: NSIS installer errors

**Solution**:

- Ensure the icon file exists at `build/icon.ico`
- Icon should be a proper .ico file (not renamed .png)
- Use online converters to create proper .ico files from PNG

### 4. Testing the Installation

After building:

1. The installer will be in the `dist` folder
2. File name: `Secure Kiosk Setup 1.0.0.exe`
3. Run the installer (may require admin rights)
4. The app will install to Program Files by default
5. Desktop and Start Menu shortcuts will be created

### 5. Network Requirements

The application attempts to load `https://humo.neovex.uz/`:

- Ensure firewall allows outbound HTTPS connections
- If no internet, the app will show a local fallback page
- For offline-only deployment, modify `main.js` to only load the local HTML

### 6. Debugging Tips

Enable developer tools temporarily:

1. Edit `main.js`
2. Change `devTools: false` to `devTools: true`
3. Press F12 in the app to open DevTools
4. Remember to disable for production!

### 7. Creating a Proper Icon

For Windows, you need a multi-resolution .ico file:

```bash
# Using ImageMagick (if installed)
magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 build/icon.ico

# Or use online tools like:
# - https://convertio.co/png-ico/
# - https://www.icoconverter.com/
```

### 8. Code Signing (Production)

For production releases without SmartScreen warnings:

1. Obtain a code signing certificate
2. Add to package.json:

```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password"
}
```

### 9. Silent Installation

For enterprise deployment:

```bash
"Secure Kiosk Setup 1.0.0.exe" /S
```

### 10. Uninstallation

- Use Windows Add/Remove Programs
- Or run the uninstaller from the installation directory
- Registry entries are cleaned up automatically
