-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category_name" TEXT NOT NULL DEFAULT 'Makanan',
    "price" INTEGER NOT NULL,
    "price_modal" INTEGER NOT NULL,
    "price_profit" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_MenuCafe" ("created_at", "id", "name", "price", "price_modal", "price_profit", "updated_at") SELECT "created_at", "id", "name", "price", "price_modal", "price_profit", "updated_at" FROM "MenuCafe";
DROP TABLE "MenuCafe";
ALTER TABLE "new_MenuCafe" RENAME TO "MenuCafe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
