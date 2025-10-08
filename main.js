const {
  app,
  BrowserWindow,
  session,
  systemPreferences,
  ipcMain,
} = require("electron");
const path = require("path");

let mainWindow;
let isKioskMode = true;
let isExiting = false;

// Enable media features
app.commandLine.appendSwitch("enable-features", "MediaStreamTrack");
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

async function checkMicrophonePermission() {
  if (process.platform === "darwin") {
    const status = systemPreferences.getMediaAccessStatus("microphone");
    console.log("Microphone permission status:", status);

    if (status === "not-determined") {
      const granted = await systemPreferences.askForMediaAccess("microphone");
      console.log("Microphone permission granted:", granted);
      return granted;
    }

    return status === "granted";
  }
  return true;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    kiosk: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: false, // Disable devtools in kiosk mode
    },
  });

  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      console.log(
        `[Permission Request] ${permission} from ${details.requestingUrl}`
      );

      if (
        permission === "media" ||
        permission === "audioCapture" ||
        permission === "microphone"
      ) {
        const url = new URL(details.requestingUrl || "");
        const allowed = ["humo.neovex.uz"].includes(url.hostname);
        console.log(
          `[Permission] ${allowed ? "Granted" : "Denied"}: ${permission}`
        );
        return callback(allowed);
      }

      callback(false);
    }
  );

  // Log console messages from the renderer
  mainWindow.webContents.on(
    "console-message",
    (event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] ${message}`);
    }
  );

  mainWindow.loadURL("https://humo.neovex.uz/");

  mainWindow.webContents.once("dom-ready", () => {
    mainWindow.webContents.executeJavaScript(`
      const exitButton = document.createElement('button');
      exitButton.innerHTML = 'Exit';
      exitButton.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        background: transparent;
        color: transparent;
        border: none;
        padding: 30px 40px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
      \`;
      
      let holdTimer = null;
      const requiredHoldTime = 5000; // 5 seconds
      let isHolding = false;
      
      // Function to start hold
      const startHold = () => {
        if (isHolding) return;
        isHolding = true;
        
        holdTimer = setTimeout(() => {
          // Send message to main process to exit application
          require('electron').ipcRenderer.send('request-exit');
        }, requiredHoldTime);
      };
      
      // Function to cancel hold
      const cancelHold = () => {
        isHolding = false;
        
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      };
      
      // Mouse events
      exitButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startHold();
      });
      
      exitButton.addEventListener('mouseup', (e) => {
        e.preventDefault();
        cancelHold();
      });
      
      exitButton.addEventListener('mouseleave', (e) => {
        e.preventDefault();
        cancelHold();
      });
      
      // Touch events for touch panels
      exitButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHold();
      }, { passive: false });
      
      exitButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        cancelHold();
      }, { passive: false });
      
      exitButton.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        cancelHold();
      }, { passive: false });
      
      // Prevent context menu on long press
      exitButton.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
      
      // Add to page
      document.body.appendChild(exitButton);
    `);
  });

  // Security features for kiosk mode
  // Prevent navigation away from the site
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    if (!navigationUrl.includes("humo.neovex.uz")) {
      event.preventDefault();
    }
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  // Block all downloads
  mainWindow.webContents.session.on("will-download", (event) => {
    event.preventDefault();
  });

  // Disable right-click context menu
  mainWindow.webContents.on("context-menu", (event) => {
    event.preventDefault();
  });

  // Prevent window from being closed
  mainWindow.on("close", (event) => {
    if (isKioskMode && !isExiting) {
      event.preventDefault();
    }
  });

  // Block keyboard shortcuts
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (isKioskMode && input.type === "keyDown") {
      // Block all keys except specific allowed ones
      const allowedKeys = [];

      // Block function keys
      if (input.key.startsWith("F")) {
        event.preventDefault();
        return;
      }

      // Block system shortcuts
      if (input.control || input.meta || input.alt) {
        // Block Ctrl+W, Ctrl+Q, Alt+F4, etc.
        if (["w", "W", "q", "Q", "F4"].includes(input.key)) {
          event.preventDefault();
          return;
        }

        // Block Alt+Tab
        if (input.alt && input.key === "Tab") {
          event.preventDefault();
          return;
        }

        // Block Windows key combinations
        if (input.meta) {
          event.preventDefault();
          return;
        }

        // Block Ctrl+Shift+Esc (Task Manager)
        if (input.control && input.shift && input.key === "Escape") {
          event.preventDefault();
          return;
        }
      }

      // Block Escape key
      if (input.key === "Escape") {
        event.preventDefault();
        return;
      }
    }
  });
}

app.whenReady().then(async () => {
  await checkMicrophonePermission();
  createWindow();

  // Handle exit request from button
  ipcMain.on("request-exit", () => {
    // Set exiting flag and close window
    isExiting = true;
    mainWindow.close();
  });
});

// Prevent app from quitting in kiosk mode
app.on("before-quit", (event) => {
  if (isKioskMode && !isExiting) {
    event.preventDefault();
  }
});

// Handle window closing
app.on("window-all-closed", () => {
  if (isExiting || process.platform !== "darwin") {
    app.quit();
  }
  // Otherwise keep it running in kiosk mode
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
