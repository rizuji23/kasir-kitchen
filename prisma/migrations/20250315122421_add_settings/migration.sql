-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_settings" TEXT NOT NULL,
    "label_settings" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_settings_key" ON "Settings"("id_settings");
