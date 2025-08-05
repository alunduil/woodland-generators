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
  details: {
    pronouns: string[];
    appearance: string[];
    accessories: string[];
  };
  demeanor: string[];
  rawText: string;
  pageNumber: number;
}
