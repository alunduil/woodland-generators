// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import pino from "pino";
import { join } from "path";

export const root = pino({
  level: "warn",
  transport: {
    target: join(__dirname, "pino-pretty-transport.js"),
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname", // Hide only noisy system fields
      hideObject: false,
      singleLine: false,
    },
  },
});
