// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// pino-pretty, with a multiline `context` starting on its own line.
module.exports = (opts) =>
  require("pino-pretty")({
    ...opts,
    customPrettifiers: {
      context: (value) => {
        if (typeof value === "string" && value.includes("\n")) {
          return "\n" + value;
        }
        return String(value);
      },
    },
  });
