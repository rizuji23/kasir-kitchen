import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import log from "electron-log";
import { app } from "electron";
import path from "path";
import dotenv from "dotenv";

// Define the path for the SQLite database inside userData
const databasePath = path.join(app.getPath("userData"), "kitchen.sqlite");

// Override DATABASE_URL in environment variables
process.env.DATABASE_URL = `file:${databasePath}`;

// Load environment variables
dotenv.config();

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
