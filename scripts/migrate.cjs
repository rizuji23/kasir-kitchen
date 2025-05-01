const { execSync } = require("child_process");
const path = require("path");
const os = require("os");

// Get userData path manually
function getUserDataPath() {
  const appName = "kasir-kitchen"; // Change this to your app's name

  if (process.platform === "win32") {
    return path.join(process.env.APPDATA, appName);
  } else if (process.platform === "darwin") {
    return path.join(process.env.HOME, "Library", "Application Support", appName);
  } else {
    return path.join(process.env.HOME, ".config", appName);
  }
}

// Set database path
const databasePath = `file:${path.join(getUserDataPath(), "kitchen.sqlite")}`;

// Get migration name from command-line arguments
const migrationName = process.argv[2] || "default_migration";

console.log(`Running migration on database: ${databasePath} with name: ${migrationName}`);

// Correctly set DATABASE_URL based on OS
const env = { ...process.env, DATABASE_URL: databasePath };

try {
  execSync(`npx prisma migrate dev --name ${migrationName}`, {
    stdio: "inherit",
    shell: true,
    env,
  });
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
