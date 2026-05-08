import pino from "pino";
import { join } from "path";

/**
 * Create the main logger instance with CLI-friendly configuration
 */
export const root = pino({
  level: "warn",
  transport: {
    target: join(__dirname, "pino-pretty-transport.js"),
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname", // Hide only noisy system fields
      hideObject: false, // Show all object properties
      singleLine: false, // Allow multi-line output for better readability
    },
  },
});
