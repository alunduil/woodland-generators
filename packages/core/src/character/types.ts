// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { Details } from "../details";

export interface Character {
  name: string;
  playbook: string;
  species: string;
  details: Details;
  demeanor: string[];
}
