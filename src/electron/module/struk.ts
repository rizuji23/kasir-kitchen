import { app, BrowserWindow, dialog } from "electron";
import { KitchenOrderType } from "../types/index.js";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../utils.js";
import path from "path";
import { prisma } from "../database.js";

export default function StrukWindow(data: KitchenOrderType) {
  try {
    const printWindow = new BrowserWindow({
      show: false,
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
        prisma.settings
          .findFirst({
            where: {
              id_settings: "PRINTER",
            },
          })
          .then((result) => {
            if (result) {
              printWindow.webContents.send("print_struk", data);
              printWindow.webContents.print({
                silent: true,
                printBackground: true,
                deviceName: result.content || "Microsoft Print to PDF",
                copies: 0,
                margins: {
                  marginType: "custom",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
              });
            } else {
              dialog.showErrorBox(
                "Terjadi Kesalahan",
                "Printer tidak ditemukan",
              );
              return false;
            }
          });
      }, 1000);
    });
  } catch (err) {
    console.error("Error in StrukWindow:", err);
    throw err;
  }
}
