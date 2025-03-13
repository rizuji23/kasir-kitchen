import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import path from "path";
import { app } from "electron";
import dotenv from "dotenv";
import fs from "fs";
import log from "electron-log";

// Load environment variables
dotenv.config();

// Ensure the userData directory exists
const userDataDir = app.getPath("userData");
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

// Set the database path
const databasePath = path.join(userDataDir, "kitchen.sqlite");

const databaseUrl = `file:${databasePath}`;

// Override DATABASE_URL globally
process.env.DATABASE_URL = databaseUrl;
log.info(`🛠 Using database path: ${databaseUrl}`);
console.log("🛠 Using database path:", databaseUrl);

// Initialize Prisma Client
const prisma = new PrismaClient();

// Connect to the database
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
    log.info("✅ Database connected successfully!");
  })
  .catch((error: unknown) => {
    console.error("❌ Database connection failed:", error);
    log.error(`❌ Database connection failed: ${error}`);
  });

export { prisma };
