import { IResponses } from "./lib/responses.ts";
import { KitchenOrderType } from "./types/index.ts";

interface UpdateAPI {
  get_version: () => string;
}

interface ApiAPI {
  onMessageChange: (callback: (data: string) => void) => void;
  onPrintStruk: (callback: (data: Struk) => void) => void;
  removePrintStruk: () => void;
  get_local_network: () => string | null;
  receive: (channel: string, callback: (data: string[]) => void) => void;
  get_printer: (
    type_printer: "KITCHEN" | "BAR",
  ) => Promise<IResponses<unknown>>;
  save_printer: (
    id: string | null,
    label_settings: string,
    content: string,
  ) => Promise<IResponses<unknown>>;
  confirm: (title?: string) => Promise<boolean>;
  history_list: () => Promise<
    IResponses<{
      all: KitchenOrderType[];
      one_hours: KitchenOrderType[];
    }>
  >;
  order_list: () => Promise<
    IResponses<{
      new_order: KitchenOrderType[];
      on_progress: KitchenOrderType[];
    }>
  >;
  print_struk: (
    data: KitchenOrderType,
    type_status: "ACCEPT" | "REJECT" | "DONE" | "PRINT",
  ) => void;
  open_url: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    api: ApiAPI;
    update: UpdateAPI;
  }
}
