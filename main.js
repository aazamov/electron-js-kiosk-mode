const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
let isKioskMode = true;
let isExiting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

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
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      \`;
      
      let holdTimer = null;
      const requiredHoldTime = 5000; // 5 seconds
      
      // Add mouse down event
      exitButton.addEventListener('mousedown', () => {
        holdTimer = setTimeout(() => {
          // Send message to main process to exit application
          require('electron').ipcRenderer.send('request-exit');
        }, requiredHoldTime);
      });
      
      // Add mouse up event
      exitButton.addEventListener('mouseup', () => {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      });
      
      // Add mouse leave event (in case mouse leaves button area)
      exitButton.addEventListener('mouseleave', () => {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      });
      
      // Add hover effect
      exitButton.addEventListener('mouseenter', () => {
        exitButton.style.background = '#cc3333';
      });
      
      exitButton.addEventListener('mouseleave', () => {
        exitButton.style.background = '#ff4444';
      });
      
      // Add to page
      document.body.appendChild(exitButton);
    `);
  });

  // Prevent navigation away from the site
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    if (navigationUrl !== "https://lh.neovex.uz") {
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

  // Block all external links
  mainWindow.webContents.on("new-window", (event) => {
    event.preventDefault();
  });

  // Prevent window from being closed (but allow when exiting)
  mainWindow.on("close", (event) => {
    if (isKioskMode && !isExiting) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // No global shortcuts registered - completely secure kiosk mode

  // Handle exit request from button
  ipcMain.on("request-exit", () => {
    // Set exiting flag and close window
    isExiting = true;
    mainWindow.close();
  });

  // Additional security measures are already handled in createWindow()

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (isKioskMode) {
      // Allow only Command/Ctrl + Plus/Minus for zoom
      const isZoomIn =
        (input.meta || input.control) &&
        (input.key === "=" || input.key === "+");
      const isZoomOut = (input.meta || input.control) && input.key === "-";
      const isZoomReset = (input.meta || input.control) && input.key === "0";

      // Block all other input
      if (!isZoomIn && !isZoomOut && !isZoomReset) {
        event.preventDefault();
      }
    }
  });

  // Block Windows key and Ctrl+Shift+Esc (Task Manager)
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (isKioskMode) {
      // Block Windows key
      if (input.key === "Meta" || input.key === "Super") {
        event.preventDefault();
      }

      // Block Ctrl+Shift+Esc (Task Manager)
      if (input.control && input.shift && input.key === "Escape") {
        event.preventDefault();
      }

      // Block Alt+Tab (Task Switcher)
      if (input.alt && input.key === "Tab") {
        event.preventDefault();
      }

      // Block Windows+D (Show Desktop)
      if (input.meta && input.key === "d") {
        event.preventDefault();
      }

      // Block Windows+L (Lock Screen)
      if (input.meta && input.key === "l") {
        event.preventDefault();
      }

      // Block Windows+R (Run Dialog)
      if (input.meta && input.key === "r") {
        event.preventDefault();
      }
    }
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Allow app to quit when requested
app.on("before-quit", (event) => {
  // Allow quitting when requested from button
  // Don't prevent the quit event
});

// Handle window closing
app.on("window-all-closed", function () {
  if (isExiting) {
    // Quit the app when exiting via button
    app.quit();
  }
  // Otherwise keep it running in kiosk mode
});

app.on("will-quit", () => {
  // Clean up on quit
});
