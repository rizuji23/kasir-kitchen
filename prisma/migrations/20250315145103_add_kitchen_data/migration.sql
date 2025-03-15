/*
  Warnings:

  - Added the required column `ip` to the `KitchenData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_cashier` to the `KitchenData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KitchenData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_type" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "name_cashier" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_KitchenData" ("created_at", "id", "order_type", "updated_at") SELECT "created_at", "id", "order_type", "updated_at" FROM "KitchenData";
DROP TABLE "KitchenData";
ALTER TABLE "new_KitchenData" RENAME TO "KitchenData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
