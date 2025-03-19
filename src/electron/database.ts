import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import log from "electron-log";

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
