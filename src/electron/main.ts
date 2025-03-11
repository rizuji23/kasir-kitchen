import { app, BrowserWindow } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev } from "./utils.js";

let mainWindow: BrowserWindow | null = null;

app.on("ready", async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
    focusable: true,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5124");
  } else {
    mainWindow.loadFile(getUIPath());
  }
});
