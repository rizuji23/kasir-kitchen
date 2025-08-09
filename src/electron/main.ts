import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  SaveDialogOptions,
  shell,
} from "electron";
import {
  getNotificationSound,
  getPreloadPath,
  getUIPath,
} from "./pathResolver.js";
import { isDev } from "./utils.js";
import log from "electron-log";
import { WebSocketServer } from "ws";
import http from "http";
import { getLocalIPAddress } from "./module/networks.js";
import { KitchenOrderType, WebsocketKitchenType } from "./types/index.js";
import StrukWindow from "./module/struk.js";
import { prisma } from "./database.js";
import Responses from "./lib/responses.js";
import StrukBarWindow from "./module/struk_bar.js";
import soundPlay from "sound-play";
import { Prisma } from "@prisma/client";
import { generateExcelReportKitchen } from "./module/generate-report.js";
import ExcelJS from "exceljs";
import { promises as fs } from "fs";

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
      fullscreen: true,
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
                    category_name: el.menucafe.category_menu.name,
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
                keterangan: el.keterangan,
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
                status_kitchen: "NO_PROCESSED",
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

            const makanan = kitchen.order.filter(
              (item) => item.menucafe.category_name === "Makanan",
            );
            const minuman = kitchen.order.filter(
              (item) => item.menucafe.category_name === "Minuman",
            );

            console.log("kitchen", JSON.stringify(kitchen));

            console.log("Makanan", makanan);
            console.log("Minuman", minuman);

            // if (makanan.length !== 0) {
            //   StrukWindow({
            //     ...kitchen,
            //     order: makanan,
            //   } as unknown as KitchenOrderType);
            // }

            // if (minuman.length !== 0) {
            //   setTimeout(() => {
            //     StrukBarWindow({
            //       ...kitchen,
            //       order: minuman,
            //     } as unknown as KitchenOrderType);
            //   }, 5000);
            // }
            soundPlay
              .play(getNotificationSound(), 1)
              .then(() => console.log("Playback finished"))
              .catch(console.error);

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

ipcMain.handle("get_printer", async (_, type_printer: "KITCHEN" | "BAR") => {
  const printers = await mainWindow?.webContents.getPrintersAsync();

  const settings = await prisma.settings.findFirst({
    where: {
      id_settings:
        type_printer === "KITCHEN" ? "PRINTER_KITCHEN" : "PRINTER_BAR",
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

      console.log("check_id", check_id);

      if (check_id) {
        res = await prisma.settings.update({
          where: { id_settings: check_id?.id_settings },
          data: {
            label_settings: label_settings,
            content: content,
          },
        });
      } else {
        res = await prisma.settings.create({
          data: {
            id_settings: id === "KITCHEN" ? "PRINTER_KITCHEN" : "PRINTER_BAR",
            label_settings: label_settings,
            content: content,
            url: "",
          },
        });
      }
      console.log("res", res);
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

ipcMain.handle("save_timer_food", async (_, content: string) => {
  try {
    const check_id = await prisma.settings.findFirst({
      where: {
        id_settings: "TIMER_FOOD",
      },
    });

    let res;

    if (check_id) {
      res = await prisma.settings.update({
        where: { id_settings: check_id.id_settings },
        data: {
          content: content,
        },
      });
    } else {
      res = await prisma.settings.create({
        data: {
          id_settings: "TIMER_FOOD",
          label_settings: "Timer Food",
          content: content,
          url: "",
        },
      });
    }

    return Responses({
      code: 200,
      data: res,
      detail_message: "Timer berhasil disimpan atau diperbarui",
    });
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

ipcMain.handle("save_timer_drink", async (_, content: string) => {
  try {
    const check_id = await prisma.settings.findFirst({
      where: {
        id_settings: "TIMER_DRINK",
      },
    });

    let res;

    if (check_id) {
      res = await prisma.settings.update({
        where: { id_settings: check_id.id_settings },
        data: {
          content: content,
        },
      });
    } else {
      res = await prisma.settings.create({
        data: {
          id_settings: "TIMER_DRINK",
          label_settings: "Timer Drink",
          content: content,
          url: "",
        },
      });
    }

    return Responses({
      code: 200,
      data: res,
      detail_message: "Timer berhasil disimpan atau diperbarui",
    });
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

ipcMain.handle("get_timer", async () => {
  try {
    const data_timer = await prisma.settings.findMany({
      where: {
        OR: [{ id_settings: "TIMER_DRINK" }, { id_settings: "TIMER_FOOD" }],
      },
    });

    if (data_timer) {
      return Responses({
        code: 200,
        data: {
          data_timer,
        },
        detail_message: "Berhasil mendapatkan data order",
      });
    } else {
      return Responses({
        code: 404,
        detail_message: `Data kosong`,
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      return Responses({
        code: 500,
        detail_message: `Gagal mengambil data: ${err.message}`,
      });
    }
    return Responses({ code: 500, detail_message: "Gagal mengambil data" });
  }
});

ipcMain.handle("order_list", async () => {
  try {
    const new_order = await prisma.kitchenData.findMany({
      where: {
        status_kitchen: "NO_PROCESSED",
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

    const on_progress = await prisma.kitchenData.findMany({
      where: {
        status_kitchen: "PROCESSED",
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
        new_order,
        on_progress,
      },
      detail_message: "Berhasil mendapatkan data order",
    });
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

ipcMain.handle("history_list", async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const all = await prisma.kitchenData.findMany({
      where: {
        status_kitchen: "DONE",
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

    const one_hours = await prisma.kitchenData.findMany({
      where: {
        created_at: {
          gte: oneHourAgo,
        },
        status_kitchen: "DONE",
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
        one_hours,
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

const printStrukNow = async (data: KitchenOrderType) => {
  const makanan = data.order.filter(
    (item) => item.menucafe.category_name === "Makanan",
  );
  const minuman = data.order.filter(
    (item) => item.menucafe.category_name === "Minuman",
  );

  if (makanan.length !== 0) {
    await StrukWindow({
      ...data,
      order: makanan,
    } as unknown as KitchenOrderType);
  }

  if (minuman.length !== 0) {
    await StrukBarWindow({
      ...data,
      order: minuman,
    } as unknown as KitchenOrderType);
  }
};

ipcMain.handle(
  "print_struk",
  async (
    _,
    data: KitchenOrderType,
    type_status: "ACCEPT" | "REJECT" | "DONE" | "PRINT",
  ) => {
    try {
      console.log("type_status", type_status);
      if (type_status === "PRINT") {
        printStrukNow(data);
      } else {
        // Calculate timer values (30 minutes from now for example)
        const data_timer = await prisma.settings.findMany({
          where: {
            OR: [{ id_settings: "TIMER_DRINK" }, { id_settings: "TIMER_FOOD" }],
          },
        });

        if (!data_timer || data_timer.length === 0) {
          return Responses({
            code: 404,
            detail_message: `Data Timer tidak ditemukan, silahkan isi terlebih dahulu di menu Pengaturan`,
          });
        }

        // Extract timer values from settings
        const timerDrink = data_timer.find(
          (item) => item.id_settings === "TIMER_DRINK",
        );
        const timerFood = data_timer.find(
          (item) => item.id_settings === "TIMER_FOOD",
        );

        // Filter orders
        const makanan = data.order.filter(
          (item) => item.menucafe.category_name === "Makanan",
        );
        const minuman = data.order.filter(
          (item) => item.menucafe.category_name === "Minuman",
        );

        // Calculate combined timer
        const startTimer = new Date();
        let durationMinutes = 0;

        // Add food duration if there are food items
        if (makanan.length > 0 && timerFood) {
          durationMinutes += parseInt(timerFood.content || "0");
        }

        // Add drink duration if there are drink items
        if (minuman.length > 0 && timerDrink) {
          durationMinutes += parseInt(timerDrink.content || "0");
        }

        const endTimer = new Date(
          startTimer.getTime() + durationMinutes * 60 * 1000,
        );

        // Define base update data with proper typing
        const baseUpdateData = {
          status_kitchen:
            type_status === "ACCEPT"
              ? "PROCESSED"
              : type_status === "REJECT"
              ? "REJECT"
              : "DONE",
          status_timer:
            type_status === "ACCEPT"
              ? "STARTED"
              : type_status === "DONE"
              ? "DONE"
              : type_status === "REJECT"
              ? "REJECT"
              : "NO_STARTED",
        };

        // Create specific update data based on status
        let updateData: Prisma.KitchenDataUpdateInput;

        if (type_status === "ACCEPT") {
          updateData = {
            ...baseUpdateData,
            start_timer: startTimer,
            end_timer: endTimer,
          };
        } else if (type_status === "DONE") {
          updateData = {
            ...baseUpdateData,
            end_timer: new Date(), // Set end time to now
          };
        } else if (type_status === "REJECT") {
          updateData = {
            ...baseUpdateData,
            end_timer: null, // Clear end timer for rejected orders
          };
        } else {
          updateData = baseUpdateData;
        }

        const update_kitchen = await prisma.kitchenData.update({
          data: updateData,
          where: {
            id: data.id,
          },
        });

        if (update_kitchen) {
          if (type_status !== "REJECT" && type_status !== "DONE") {
            printStrukNow(data);
          }

          // Send updated data to all clients via WebSocket if needed
          // wsServer.clients.forEach(client => client.send(JSON.stringify(update_kitchen)));
        }
      }
    } catch (err) {
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

interface ExportExcelParams {
  type_export: "today" | "weekly" | "monthly" | "annual" | "custom";
  start_date: string;
  end_date: string;
}

ipcMain.handle("export_excel", async (_, params: ExportExcelParams) => {
  try {
    const { type_export, start_date, end_date } = params;

    console.log("params", params);

    const result = await generateExcelReportKitchen(
      type_export,
      start_date,
      end_date,
    );

    if (result.success) {
      return Responses({
        code: 201,
        detail_message: "Export berhasil dilakukan",
      });
    } else {
      return Responses({
        code: 404,
        detail_message: `Data kosong`,
      });
    }
  } catch (error) {
    console.error("Export Excel Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
});

interface IBestSellerParams {
  type_export:
    | "today"
    | "weekly"
    | "monthly"
    | "annual"
    | "custom"
    | "yesterday";
  start_date: string;
  end_date: string;
  sort: "most" | "least";
}

ipcMain.handle("best_seller", async (_, params: IBestSellerParams) => {
  const now = new Date();
  let dateFilter = {};

  switch (params.type_export) {
    case "today":
      dateFilter = {
        created_at: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        },
      };
      break;

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      dateFilter = {
        created_at: {
          gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          lte: new Date(yesterday.setHours(23, 59, 59, 999)),
        },
      };
      break;
    }

    case "weekly": {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      dateFilter = {
        created_at: {
          gte: new Date(firstDay.setHours(0, 0, 0, 0)),
          lte: new Date(lastDay.setHours(23, 59, 59, 999)),
        },
      };
      break;
    }

    case "monthly":
      dateFilter = {
        created_at: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        },
      };
      break;

    case "annual":
      dateFilter = {
        created_at: {
          gte: new Date(now.getFullYear(), 0, 1),
          lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
        },
      };
      break;

    case "custom": {
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);

      if (isNaN(startDate.getTime())) throw new Error("Invalid start date");
      if (isNaN(endDate.getTime())) throw new Error("Invalid end date");

      endDate.setHours(23, 59, 59, 999);
      dateFilter = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };
      break;
    }

    default:
      dateFilter = {};
  }

  const results = await prisma.itemOrder.groupBy({
    by: ["name_menu"],
    where: {
      ...dateFilter,
      kitchenData: {
        status_kitchen: "DONE", // Only count processed orders if needed
      },
    },
    _sum: {
      qty: true,
    },
    orderBy: {
      _sum: {
        qty: params.sort === "most" ? "desc" : "asc",
      },
    },
  });

  // Get menu items with their categories
  const menuItems = await prisma.menuCafe.findMany({
    where: {
      name: {
        in: results.map((item) => item.name_menu),
      },
    },
    select: {
      name: true,
      category_name: true,
    },
  });

  // Combine the data
  const combinedResults = results.map((item) => {
    const menuItem = menuItems.find((menu) => menu.name === item.name_menu);
    return {
      name_menu: item.name_menu,
      category: menuItem?.category_name || "Unknown",
      sum: item._sum.qty || 0,
    };
  });

  // Separate by category
  const makanan = combinedResults.filter((item) => item.category === "Makanan");
  const minuman = combinedResults.filter((item) => item.category === "Minuman");

  return {
    makanan,
    minuman,
  };
});

interface BestSellerItem {
  name_menu: string;
  category: string;
  sum: number;
}

ipcMain.handle("best_seller_excel", async (_, params: IBestSellerParams) => {
  const now = new Date();
  let dateFilter = {};

  switch (params.type_export) {
    case "today":
      dateFilter = {
        created_at: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        },
      };
      break;

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      dateFilter = {
        created_at: {
          gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          lte: new Date(yesterday.setHours(23, 59, 59, 999)),
        },
      };
      break;
    }

    case "weekly": {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      dateFilter = {
        created_at: {
          gte: new Date(firstDay.setHours(0, 0, 0, 0)),
          lte: new Date(lastDay.setHours(23, 59, 59, 999)),
        },
      };
      break;
    }

    case "monthly":
      dateFilter = {
        created_at: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        },
      };
      break;

    case "annual":
      dateFilter = {
        created_at: {
          gte: new Date(now.getFullYear(), 0, 1),
          lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
        },
      };
      break;

    case "custom": {
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);

      if (isNaN(startDate.getTime())) throw new Error("Invalid start date");
      if (isNaN(endDate.getTime())) throw new Error("Invalid end date");

      endDate.setHours(23, 59, 59, 999);
      dateFilter = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };
      break;
    }

    default:
      dateFilter = {};
  }

  const results = await prisma.itemOrder.groupBy({
    by: ["name_menu"],
    where: {
      ...dateFilter,
      kitchenData: {
        status_kitchen: "DONE", // Only count processed orders if needed
      },
    },
    _sum: {
      qty: true,
    },
    orderBy: {
      _sum: {
        qty: params.sort === "most" ? "desc" : "asc",
      },
    },
  });

  // Get menu items with their categories
  const menuItems = await prisma.menuCafe.findMany({
    where: {
      name: {
        in: results.map((item) => item.name_menu),
      },
    },
    select: {
      name: true,
      category_name: true,
    },
  });

  // Combine the data
  const combinedResults = results.map((item) => {
    const menuItem = menuItems.find((menu) => menu.name === item.name_menu);
    return {
      name_menu: item.name_menu,
      category: menuItem?.category_name || "Unknown",
      sum: item._sum.qty || 0,
    };
  });

  // Separate by category
  const makanan = combinedResults.filter((item) => item.category === "Makanan");
  const minuman = combinedResults.filter((item) => item.category === "Minuman");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Your App Name";
  workbook.created = new Date();

  // Helper function to add a worksheet with data
  const addSheet = (name: string, data: BestSellerItem[]) => {
    const worksheet = workbook.addWorksheet(name);

    // Add headers
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Menu", key: "name_menu", width: 30 },
      { header: "Kategori", key: "category", width: 15 },
      { header: "Jumlah Terjual", key: "sum", width: 15 },
    ];

    // Add data with row numbers
    data.forEach((item: BestSellerItem, index: number) => {
      worksheet.addRow({
        no: index + 1,
        name_menu: item.name_menu,
        category: item.category,
        sum: item.sum,
      });
    });

    // Style the header row
    worksheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Add totals row
    const totalRow = worksheet.addRow({
      name_menu: "TOTAL",
      sum: { formula: `SUM(D2:D${data.length + 1})` },
    });
    totalRow.getCell("name_menu").font = { bold: true };
    totalRow.getCell("sum").font = { bold: true };
  };

  // Add sheets for each category
  if (makanan.length > 0) addSheet("Makanan", makanan);
  if (minuman.length > 0) addSheet("Minuman", minuman);

  const excelBuffer = await workbook.xlsx.writeBuffer();
  const bufferData = Buffer.from(excelBuffer);

  // Generate filename
  let defaultFilename = `Laporan Menu Terjual`;
  if (params.type_export === "custom") {
    defaultFilename += ` ${params.start_date} - ${params.end_date}`;
  } else {
    defaultFilename += ` ${params.type_export} ${new Date()
      .toISOString()
      .slice(0, 10)}`;
  }
  defaultFilename += ".xlsx";

  const saveOptions: SaveDialogOptions = {
    title: "Save Excel Report",
    defaultPath: defaultFilename,
    filters: [
      { name: "Excel Files", extensions: ["xlsx"] },
      { name: "All Files", extensions: ["*"] },
    ],
  };

  const filePath = await dialog.showSaveDialog(saveOptions);
  const filePathData: {
    canceled: boolean;
    filePath: string;
  } = filePath as unknown as {
    canceled: boolean;
    filePath: string;
  };
  if (!filePath) {
    return { success: false, error: "Save dialog canceled" };
  }

  await fs.writeFile(filePathData.filePath, bufferData);

  return {
    success: true,
    filePath: filePath,
    message: `Report saved successfully to ${filePath}`,
  };
});
