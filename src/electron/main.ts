import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev } from "./utils.js";
import log from "electron-log";
import { WebSocketServer } from "ws";
import http from "http";
import { getLocalIPAddress } from "./module/networks.js";
import { KitchenOrderType, WebsocketKitchenType } from "./types/index.js";
import StrukWindow from "./module/struk.js";
import { prisma } from "./database.js";
import Responses from "./lib/responses.js";

log.initialize();

log.info("App starting...");

let mainWindow: BrowserWindow | null = null;
const gotTheLock = app.requestSingleInstanceLock();

const port = 4321;
const server = http.createServer();
const wss = new WebSocketServer({ server });

const connectedClients: Set<string> = new Set();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

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

    wss.on("connection", (ws, req) => {
      const clientIP = req.socket.remoteAddress || "Unknown IP";
      connectedClients.add(clientIP);

      console.log(`New WebSocket connection from: ${clientIP}`);
      sendClientListToRenderer();

      ws.on("message", async (message) => {
        const data = message.toString();
        console.log("Received:", data);

        try {
          const json = JSON.parse(data);

          if (json.type === "kitchen") {
            const data_kitchen: WebsocketKitchenType<KitchenOrderType> = json;

            const menuCafeData = await Promise.all(
              data_kitchen.data.order.map(async (el) => {
                return await prisma.menuCafe.create({
                  data: {
                    name: el.menucafe.name,
                    price: el.menucafe.price,
                    price_modal: el.menucafe.price_modal,
                    price_profit: el.menucafe.price_profit,
                  },
                });
              }),
            );

            const cafe_data = data_kitchen.data.order.map((el, index) => {
              return {
                id_order_cafe: el.id_order_cafe,
                name: el.name,
                subtotal: el.subtotal,
                qty: el.qty,
                total: el.total,
                cash: el.cash,
                change: el.change,
                status: el.status,
                shift: el.shift,
                menucafe: { connect: { id: menuCafeData[index].id } },
              };
            });

            const item_order_data = data_kitchen.data.item.map((el) => {
              return {
                id_order_cafe_item: el.id_order_cafe_item,
                name_menu: el.name_menu,
                qty: el.qty,
              };
            });

            const kitchen = await prisma.kitchenData.create({
              data: {
                order_type: data_kitchen.data.order_type,
                ip: data_kitchen.ip,
                name_cashier: data_kitchen.name,
                order: {
                  create: cafe_data,
                },
                item: {
                  create: item_order_data,
                },
                no_billiard: data_kitchen.data.no_billiard,
                no_meja: data_kitchen.data.no_meja,
              },
              include: {
                order: {
                  include: {
                    menucafe: true,
                  },
                },
                item: true,
              },
            });

            console.log("kitchen", JSON.stringify(kitchen));

            StrukWindow(kitchen as unknown as KitchenOrderType);

            if (mainWindow) {
              mainWindow.webContents.send("on_message_receive", data);
            }
          }
        } catch (err) {
          console.log("Received non-JSON message:", data, err);
        }

        ws.send("Message received");
      });

      ws.on("close", () => {
        connectedClients.delete(clientIP);
        console.log(`Client ${clientIP} disconnected`);
        sendClientListToRenderer();
      });
    });

    server.listen(port, () => {
      log.info(
        `WebSocket server running on ws://${getLocalIPAddress()}:${port}`,
      );
      console.log(
        `WebSocket server running on ws://${getLocalIPAddress()}:${port}`,
      );
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("get_local_network", async () => {
  return getLocalIPAddress();
});

function sendClientListToRenderer() {
  if (mainWindow) {
    mainWindow.webContents.send(
      "update_client_list",
      Array.from(connectedClients),
    );
  }
}

ipcMain.handle("get_printer", async (_, id: number | null) => {
  const printers = await mainWindow?.webContents.getPrintersAsync();

  const settings = await prisma.settings.findFirst({
    where: {
      id: id || undefined,
    },
  });

  return Responses({
    code: 200,
    data: {
      printers,
      settings,
    },
  });
});

ipcMain.handle(
  "save_printer",
  async (_, id: string | null, label_settings: string, content: string) => {
    try {
      const check_id = await prisma.settings.findFirst({
        where: {
          id_settings: id || undefined,
        },
      });

      let res;

      if (check_id) {
        res = await prisma.settings.update({
          where: { id_settings: check_id?.id_settings },
          data: {
            id_settings: "PRINTER",
            label_settings: label_settings,
            content: content,
          },
        });
      } else {
        res = await prisma.settings.create({
          data: {
            id_settings: "PRINTER",
            label_settings: label_settings,
            content: content,
            url: "",
          },
        });
      }

      return Responses({
        code: 200,
        data: res,
        detail_message: "Printer berhasil disimpan atau diperbarui",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengupdate data: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
    }
  },
);

ipcMain.handle("history_list", async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const all = await prisma.kitchenData.findMany({
      include: {
        order: {
          include: {
            menucafe: true,
          },
        },
        item: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const one_minute = await prisma.kitchenData.findMany({
      where: {
        created_at: {
          gte: oneMinuteAgo,
        },
      },
      include: {
        order: {
          include: {
            menucafe: true,
          },
        },
        item: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return Responses({
      code: 200,
      data: {
        all,
        one_minute,
      },
      detail_message: "Printer berhasil disimpan atau diperbarui",
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Responses({
        code: 500,
        detail_message: `Gagal mengupdate data: ${err.message}`,
      });
    }
    return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
  }
});

ipcMain.handle("print_struk", async (_, data: KitchenOrderType) => {
  try {
    return StrukWindow(data);
  } catch (err) {
    if (err instanceof Error) {
      return Responses({
        code: 500,
        detail_message: `Gagal mengupdate data: ${err.message}`,
      });
    }
    return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
  }
});

ipcMain.handle("confirm", async (_, title: string = "Apakah anda yakin?") => {
  const result = await dialog.showMessageBox(mainWindow!, {
    type: "question",
    buttons: ["Cancel", "OK"],
    defaultId: 1,
    title: "Konfirmasi",
    message: title,
  });

  return (result as unknown as Electron.MessageBoxReturnValue).response === 1;
});

ipcMain.handle("open_url", async (_, url: string) => {
  return shell.openExternal(url);
});

ipcMain.handle("get_version", () => {
  return app.getVersion();
});
