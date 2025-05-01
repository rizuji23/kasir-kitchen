import { app, BrowserWindow, dialog } from "electron";
import { KitchenOrderType } from "../types/index.js";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../utils.js";
import path from "path";
import { prisma } from "../database.js";

export default async function StrukBarWindow(data: KitchenOrderType) {
  try {
    const printWindowBar = new BrowserWindow({
      show: false,
      webPreferences: {
        preload: getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    // printWindowBar.webContents.openDevTools();

    if (isDev()) {
      printWindowBar.loadURL("http://localhost:5124/#/struk_bar");
    } else {
      printWindowBar.loadFile(
        path.join(app.getAppPath(), "/dist-react/index.html"),
        { hash: "struk_bar" },
      );
    }

    printWindowBar.webContents.on("did-finish-load", () => {
      prisma.settings
        .findFirst({
          where: {
            id_settings: "PRINTER_BAR",
          },
        })
        .then((result) => {
          if (result) {
            printWindowBar.webContents.send("print_struk", data);
            setTimeout(() => {
              printWindowBar.webContents.print({
                silent: true,
                printBackground: true,
                deviceName: result.content || "Microsoft Print to PDF",
                copies: 0,
                margins: {
                  marginType: "none",
                },
                scaleFactor: 84,
              });
            }, 2000);
            return true;
          } else {
            dialog.showErrorBox("Terjadi Kesalahan", "Printer tidak ditemukan");
            return false;
          }
        })
        .catch((err) => {
          dialog.showErrorBox(
            "Terjadi Kesalahan",
            `Error StrukWindow: ${JSON.stringify(err)}`,
          );
          return false;
        });
    });
  } catch (err) {
    console.error("Error in StrukWindow:", err);
    throw err;
  }
}
