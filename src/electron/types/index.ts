export interface WebsocketKitchenType<T> {
  type: "kitchen";
  ip: string;
  data: T;
}

export interface MenuCafeType {
  id: number;
  name: string;
  price: number;
  categoryMenuId?: number;
  price_sell: number;
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
}

export type GroupedCafeItem = {
  orderId: number;
  menu_cafe: number;
  price: number;
  shift: string;
  name_menu: string;
  qty: number;
};

export interface KitchenOrderType {
  order_type: "CAFE" | "TABLE";
  order: OrderCafeType[];
  item: GroupedCafeItem[];
}
