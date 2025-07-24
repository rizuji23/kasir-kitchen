const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("update", {
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
  get_printer: (type_printer: "KITCHEN" | "BAR") =>
    ipcRenderer.invoke("get_printer", type_printer),
  save_printer: (id: string | null, label_settings: string, content: string) =>
    ipcRenderer.invoke("save_printer", id, label_settings, content),
  confirm: (title?: string) => ipcRenderer.invoke("confirm", title),
  history_list: () => ipcRenderer.invoke("history_list"),
  order_list: () => ipcRenderer.invoke("order_list"),
  print_struk: (data: unknown, type_status: string) =>
    ipcRenderer.invoke("print_struk", data, type_status),
  open_url: (url: string) => ipcRenderer.invoke("open_url", url),
  save_timer_food: (content: string) =>
    ipcRenderer.invoke("save_timer_food", content),
  save_timer_drink: (content: string) =>
    ipcRenderer.invoke("save_timer_drink", content),
  get_timer: () => ipcRenderer.invoke("get_timer"),
  exportExcel: (params: {
    type_export: "today" | "weekly" | "monthly" | "annual" | "custom";
    start_date: string;
    end_date: string;
  }) => ipcRenderer.invoke("export_excel", params),
});
