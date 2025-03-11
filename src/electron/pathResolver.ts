import path from "path";
import { app } from "electron";
import { isDev } from "./utils.js";

export function getPreloadPath() {
  const preloadPath = isDev()
    ? path.join(app.getAppPath(), ".", "/dist-electron/preload.cjs") // Development path
    : path.join(app.getAppPath(), "/dist-electron/preload.cjs"); // Production path

  console.log("Preload Path:", preloadPath); // Debugging
  return preloadPath;
}

export function getUIPath() {
  return path.join(app.getAppPath(), "/dist-react/index.html");
}

export function getAssetPath() {
  return path.join(app.getAppPath(), isDev() ? "." : "..", "/src/assets");
}
