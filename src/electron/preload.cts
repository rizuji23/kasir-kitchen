const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("update", {
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  downloadUpdate: () => ipcRenderer.send("download-update"),
  quitAndInstall: () => ipcRenderer.send("quit-and-install"),
  onUpdateAvailable: (
    callback: (info: { version: string; releaseNotes: string }) => void,
  ) =>
    ipcRenderer.on("update-available", (_: any, info: any) => callback(info)),
  onUpdateNotAvailable: (callback: () => void) =>
    ipcRenderer.on("update-not-available", () => callback()),
  onUpdateDownloaded: (callback: () => void) =>
    ipcRenderer.on("update-downloaded", () => callback()),
  onUpdateError: (callback: (error: Error) => void) =>
    ipcRenderer.on("update-error", (_: any, error: any) => callback(error)),
  onDownloadProgress: (
    callback: (progress: {
      percent: number;
      bytesPerSecond: number;
      transferred: number;
      total: number;
    }) => void,
  ) =>
    ipcRenderer.on("download-progress", (_: any, progress: any) =>
      callback(progress),
    ),
  get_version: () => ipcRenderer.invoke("get_version"),
});

contextBridge.exposeInMainWorld("api", {
  onMessageChange: (callback: (data: any) => void) => {
    ipcRenderer.on("on_message_receive", (_: any, data: string) =>
      callback(data),
    );
  },
  onPrintStruk: (callback: (data: any) => void) => {
    ipcRenderer.on("print_struk", (_: any, data: any) => callback(data));
  },
  removePrintStruk: () => {
    ipcRenderer.removeAllListeners("print_struk");
  },
  get_local_network: () => ipcRenderer.invoke("get_local_network"),
  receive: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_: any, data: any) => callback(data));
  },
  get_printer: () => ipcRenderer.invoke("get_printer"),
  save_printer: (id: string | null, label_settings: string, content: string) =>
    ipcRenderer.invoke("save_printer", id, label_settings, content),
  confirm: (title?: string) => ipcRenderer.invoke("confirm", title),
  history_list: () => ipcRenderer.invoke("history_list"),
  print_struk: (data: unknown) => ipcRenderer.invoke("print_struk", data),
});
