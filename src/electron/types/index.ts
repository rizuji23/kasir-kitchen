export interface WebsocketKitchenType<T> {
  type: "kitchen";
  ip: string;
  data: T;
  name: string;
}

export interface MenuCafeCategoryType {
  id: number;
  name: string;
  created_at: string;
}

export interface MenuCafeType {
  id: number;
  name: string;
  price: number;
  categoryMenuId?: number;
  category_menu: MenuCafeCategoryType;
  category_name: string;
  price_profit: number;
  price_modal: number;
  created_at: Date;
  updated_at: Date;
}

export enum StatusTransaction {
  PAID = "PAID",
  NOPAID = "NOPAID",
}

export interface OrderCafeType {
  id: number;
  id_order_cafe: string;
  menu_cafe: number;
  menucafe: MenuCafeType;
  total: number;
  subtotal: number;
  name: string;
  cash: number;
  change: number;
  qty: number;
  bookingId: number;
  status: StatusTransaction;
  userId: number;
  created_at: Date;
  updated_at: Date;
  shift: string;
  keterangan: string;
}

export type GroupedCafeItem = {
  id_order_cafe_item: string;
  orderId: number;
  menu_cafe: number;
  price: number;
  shift: string;
  name_menu: string;
  qty: number;
};

export interface KitchenOrderType {
  id: number;
  order_type: "CAFE" | "TABLE";
  order: OrderCafeType[];
  item: GroupedCafeItem[];
  created_at: Date;
  name_cashier: string;
  no_billiard: string;
  no_meja: string;
  status_kitchen: "NO_PROCESSED" | "PROCESSED" | "REJECT" | "DONE";
  status_timer: "NO_STARTED" | "STARTED" | "REJECT" | "DONE";
  start_timer: string;
  end_timer: string;
}

export interface IPrinters {
  description: string;
  displayName: string;
  name: string;
  isDefault: boolean;
  status: number;
}

export interface Settings {
  id: number;
  id_settings: string;
  label_settings: string;
  url: string;
  content?: string;
  created_at: Date;
  updated_at: Date;
}
