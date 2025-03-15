-- CreateTable
CREATE TABLE "MenuCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "price_modal" INTEGER NOT NULL,
    "price_profit" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KitchenData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OrderCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "kitchenDataId" INTEGER NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_kitchenDataId_fkey" FOREIGN KEY ("kitchenDataId") REFERENCES "KitchenData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe_item" TEXT NOT NULL,
    "name_menu" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "kitchenDataId" INTEGER NOT NULL,
    CONSTRAINT "ItemOrder_kitchenDataId_fkey" FOREIGN KEY ("kitchenDataId") REFERENCES "KitchenData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
