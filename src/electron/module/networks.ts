import os from "os";

export const getLocalIPAddress = (): string | null => {
  const interfaces = os.networkInterfaces();

  for (const key in interfaces) {
    for (const netInfo of interfaces[key] || []) {
      if (netInfo.family === "IPv4" && !netInfo.internal) {
        return netInfo.address; // Returns the device's IP address
      }
    }
  }

  return null; // If no IP is found
};
