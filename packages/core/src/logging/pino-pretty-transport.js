// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

// Custom pino-pretty transport that handles multiline context formatting
module.exports = (opts) =>
  require("pino-pretty")({
    ...opts,
    customPrettifiers: {
      // Preserve multiline formatting for context property
      context: (value) => {
        if (typeof value === "string" && value.includes("\n")) {
          return "\n" + value;
        }
        return String(value);
      },
    },
  });
