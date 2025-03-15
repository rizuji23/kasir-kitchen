/*
  Warnings:

  - You are about to drop the column `payment_method` on the `OrderCafe` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `KitchenData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KitchenData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_KitchenData" ("id", "order_type") SELECT "id", "order_type" FROM "KitchenData";
DROP TABLE "KitchenData";
ALTER TABLE "new_KitchenData" RENAME TO "KitchenData";
CREATE TABLE "new_OrderCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "kitchenDataId" INTEGER NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_kitchenDataId_fkey" FOREIGN KEY ("kitchenDataId") REFERENCES "KitchenData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("cash", "change", "created_at", "id", "id_order_cafe", "kitchenDataId", "menu_cafe", "name", "qty", "shift", "status", "subtotal", "total", "updated_at") SELECT "cash", "change", "created_at", "id", "id_order_cafe", "kitchenDataId", "menu_cafe", "name", "qty", "shift", "status", "subtotal", "total", "updated_at" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
