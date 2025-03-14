interface ApiAPI {
  onMessageChange: (callback: (data: string) => void) => void;
  onPrintStruk: (callback: (data: Struk) => void) => void;
  removePrintStruk: () => void;
}

declare global {
  interface Window {
    api: ApiAPI;
  }
}
