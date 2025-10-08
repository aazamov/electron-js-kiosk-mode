# Installation Instructions for Secure Kiosk

## Problem: Can't Install Because Previous Version Won't Uninstall?

### **QUICK FIX** (Recommended):

1. **Right-click** on `cleanup-old-version.bat`
2. Select **"Run as administrator"**
3. Wait for it to finish (it will automatically close and clean everything)
4. Then run your new installer: `Secure Kiosk Setup 1.0.1.exe`

---

## Manual Fix (If Quick Fix Doesn't Work):

### Step 1: Force Close the App

1. Press `Ctrl + Alt + Delete`
2. Click **"Task Manager"**
3. Find **"Secure Kiosk"** in the list
4. Click it, then click **"End Task"**
5. Click **"End Task"** again if it asks

### Step 2: Uninstall Old Version

1. Press `Windows Key + R`
2. Type: `appwiz.cpl`
3. Press `Enter`
4. Find **"Secure Kiosk"** in the list
5. Double-click it to uninstall
6. Follow the prompts

### Step 3: Install New Version

1. Double-click `Secure Kiosk Setup 1.0.1.exe`
2. Follow the installation wizard

---

## What We Fixed:

The new version (1.0.1) now:

- ✅ Automatically forces close any running instances before installing
- ✅ Handles upgrades without requiring manual uninstall
- ✅ Includes better cleanup on uninstall
- ✅ Waits longer for processes to close before installing

---

## For Developers:

To rebuild with the new fixes:

```bash
npm run dist:win
```

The installer will be in: `dist/Secure Kiosk Setup 1.0.1.exe`
