import { app, BrowserWindow } from "electron";
import { KitchenOrderType } from "../types/index.js";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../utils.js";
import path from "path";

export default function StrukWindow(data: KitchenOrderType) {
  try {
    const printWindow = new BrowserWindow({
      show: true,
      webPreferences: {
        preload: getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    printWindow.webContents.openDevTools();

    if (isDev()) {
      printWindow.loadURL("http://localhost:5124/#/struk");
    } else {
      printWindow.loadFile(
        path.join(app.getAppPath(), "/dist-react/index.html"),
        { hash: "struk" },
      );
    }

    printWindow.webContents.on("did-finish-load", () => {
      setTimeout(() => {
        printWindow.webContents.send("print_struk", data);
      }, 1000);
    });
  } catch (err) {
    console.error("Error in StrukWindow:", err);
    throw err;
  }
}
