import { IResponses } from "./lib/responses.ts";

interface ApiAPI {
  onMessageChange: (callback: (data: string) => void) => void;
  onPrintStruk: (callback: (data: Struk) => void) => void;
  removePrintStruk: () => void;
  get_local_network: () => Promise<string | null>;
  receive: (channel: string, callback: (data: string) => void) => void;
  get_printer: () => Promise<IResponses<unknown>>;
  save_printer: (
    id: string | null,
    label_settings: string,
    content: string,
  ) => Promise<IResponses<unknown>>;
  confirm: (title?: string) => Promise<boolean>;
}

declare global {
  interface Window {
    api: ApiAPI;
  }
}
