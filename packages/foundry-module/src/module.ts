// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/* global Hooks */
const MODULE_ID = "woodland-generators";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | initialized`);
});
