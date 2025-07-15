-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KitchenData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_type" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "name_cashier" TEXT NOT NULL,
    "no_billiard" TEXT NOT NULL DEFAULT '-',
    "no_meja" TEXT NOT NULL DEFAULT '-',
    "status_kitchen" TEXT NOT NULL DEFAULT 'NO_PROCESSED',
    "status_timer" TEXT NOT NULL DEFAULT 'NO_STARTED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_KitchenData" ("created_at", "id", "ip", "name_cashier", "no_billiard", "no_meja", "order_type", "status_kitchen", "updated_at") SELECT "created_at", "id", "ip", "name_cashier", "no_billiard", "no_meja", "order_type", "status_kitchen", "updated_at" FROM "KitchenData";
DROP TABLE "KitchenData";
ALTER TABLE "new_KitchenData" RENAME TO "KitchenData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
