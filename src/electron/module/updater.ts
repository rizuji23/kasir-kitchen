import { app, BrowserWindow, ipcMain } from "electron";
import pkg from "electron-updater";
import path from "path";
const { autoUpdater } = pkg;

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.autoDownload = false; // Disable auto-download

  // Set the feed URL (pointing to your update server)
  autoUpdater.setFeedURL({
    provider: "generic",
    url: "https://updatecozypool.rlstudio.my.id/kitchen",
  });

  if (process.env.NODE_ENV === "development") {
    autoUpdater.forceDevUpdateConfig = true; // Force dev update config
    autoUpdater.updateConfigPath = path.join(
      app.getAppPath(),
      "dev-app-update.yml",
    );
  }

  if (process.env.NODE_ENV === "development") {
    autoUpdater.allowPrerelease = true;
  }

  // Listen for download progress
  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("download-progress", progress);
  });

  // Other event listeners (update-available, update-downloaded, etc.)
  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update-available", info);
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.webContents.send("update-downloaded", info);
  });

  autoUpdater.on("error", (error) => {
    mainWindow.webContents.send("update-error", error);
  });

  ipcMain.handle("get_version", () => {
    return app.getVersion();
  });

  // IPC handlers
  ipcMain.on("check-for-updates", () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on("download-update", () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on("quit-and-install", () => {
    autoUpdater.quitAndInstall();
  });
}
