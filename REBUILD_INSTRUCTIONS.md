# How to Rebuild the Windows Installer

## Quick Rebuild Steps

After making the fixes for the "close manually" issue, you need to rebuild the installer:

### Step 1: Clean Previous Build

```bash
# On Windows
rmdir /s /q dist
rmdir /s /q node_modules
del package-lock.json

# On Mac/Linux (for cross-platform build)
rm -rf dist
rm -rf node_modules
rm package-lock.json
```

### Step 2: Reinstall Dependencies

```bash
npm install
```

### Step 3: Build the Installer

```bash
# Using the batch file (Windows)
build-win.bat

# Or using npm directly
npm run dist:win
```

### Step 4: Test the New Installer

1. If the app is currently running, close it completely
2. Navigate to the `dist` folder
3. Run the new `Secure Kiosk Setup 1.0.0.exe`
4. The installer should now automatically close any running instances

## What Was Fixed

The following changes were made to fix the "close manually" issue:

1. **installer.nsh** - New NSIS script that:

   - Automatically detects if the app is running
   - Tries to close it gracefully first
   - Force closes if necessary
   - Runs before installation and uninstallation

2. **package.json** - Updated NSIS configuration:
   - Added `"include": "installer.nsh"` to load the custom script
   - Added `"runAfterFinish": false` to prevent auto-launch after install
   - Added `"deleteAppDataOnUninstall": false` to preserve user data

## Verification

To verify the fix works:

1. Install the app using the new installer
2. Launch the app
3. Try to run the installer again (update/reinstall)
4. The installer should automatically close the running app without prompting

## Troubleshooting

If you still see the "close manually" message:

1. **Check Task Manager** - Make sure no instances are running:

   ```
   tasklist | findstr "Secure Kiosk"
   ```

2. **Force kill if needed**:

   ```
   taskkill /F /IM "Secure Kiosk.exe" /T
   ```

3. **Check for orphaned processes** - Sometimes Electron leaves child processes:

   ```
   taskkill /F /IM electron.exe /T
   ```

4. **Rebuild with verbose logging** to see what's happening:
   ```bash
   npm run dist:win -- --verbose
   ```

## Files Modified

- `package.json` - Added NSIS configuration
- `installer.nsh` - New custom NSIS script (auto-close functionality)
- `index.html` - Added fallback HTML page
- `main.js` - Added fallback loading logic
- `WINDOWS_TROUBLESHOOTING.md` - Documentation
- `REBUILD_INSTRUCTIONS.md` - This file

## Next Steps

After rebuilding and testing:

1. Test the installer on a clean Windows machine
2. Test update scenario (install old version, then new version)
3. Test uninstall process
4. Consider code signing for production deployment
