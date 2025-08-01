/**
 * Core playbook data structures and types
 */

export interface Playbook {
  archetype: string;
  background: {
    homeOptions: string[];
    motivationOptions: string[];
  };
  nature: {
    stats: number[];
    statNames: string[];
  };
  moves: string[];
  equipment: {
    startingValue: number;
    items: string[];
  };
  feats: string[];
  weaponSkills: string[];
  species: string[];
  rawText: string;
  pageNumber: number;
}
