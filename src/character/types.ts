/**
 * Core character domain types for Root RPG
 */

import { Details } from "../details";

/**
 * Generated character data structure
 */
export interface Character {
  name: string;
  playbook: string;
  species: string;
  details: Details;
  // Add more character properties as needed
}
