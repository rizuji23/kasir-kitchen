import { IResponses } from "./lib/responses.ts";
import { KitchenOrderType, Settings } from "./types/index.ts";

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
  save_timer_food: (content: string) => Promise<IResponses<unknown>>;
  save_timer_drink: (content: string) => Promise<IResponses<unknown>>;
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
  get_timer: () => Promise<IResponses<{ data_timer: Settings[] }>>;
  exportExcel: (params: {
    type_export: "today" | "weekly" | "monthly" | "annual" | "custom";
    start_date: string;
    end_date: string;
  }) => Promise<{
    code: number;
    detail_message: string;
    error?: string;
  }>;
  best_seller: (params: {
    type_export: "today" | "weekly" | "monthly" | "annual" | "custom";
    start_date: string;
    end_date: string;
    sort: "most" | "least";
  }) => Promise<{
    makanan: {
      name_menu: string;
      sum: number;
    }[];
    minuman: {
      name_menu: string;
      sum: number;
    }[];
  }>;
  best_seller_excel: (params: {
    type_export: "today" | "weekly" | "monthly" | "annual" | "custom";
    start_date: string;
    end_date: string;
    sort: "most" | "least";
  }) => Promise<{
    success: boolean;
    filePath: string;
    message?: string;
  }>;
}

declare global {
  interface Window {
    api: ApiAPI;
    update: UpdateAPI;
  }
}
