const { contextBridge, ipcRenderer } = require("electron");

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
});
