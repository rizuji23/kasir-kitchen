import { app, BrowserWindow } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev } from "./utils.js";
import dotenv from "dotenv";
import log from "electron-log";
import path from "path";
import { WebSocketServer } from "ws";
import http from "http";
import { getLocalIPAddress } from "./module/networks.js";
import { KitchenOrderType, WebsocketKitchenType } from "./types/index.js";
import StrukWindow from "./module/struk.js";

log.initialize();

log.info("App starting...");

dotenv.config();
process.env.DATABASE_URL = `file:${path.join(
  app.getPath("userData"),
  "kitchen.sqlite",
)}`;

let mainWindow: BrowserWindow | null = null;
const port = 4321;
const server = http.createServer();
const wss = new WebSocketServer({ server });

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

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
      const data = message.toString();
      console.log("Received:", data);

      try {
        const json = JSON.parse(data);

        if (json.type === "kitchen") {
          const data_kitchen: WebsocketKitchenType<KitchenOrderType> = json;

          StrukWindow(data_kitchen.data);

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
      console.log("Client disconnected");
    });
  });

  server.listen(port, () => {
    log.info(`WebSocket server running on ws://${getLocalIPAddress()}:${port}`);
    console.log(
      `WebSocket server running on ws://${getLocalIPAddress()}:${port}`,
    );
  });
});
