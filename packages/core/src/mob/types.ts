// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

export interface HarmTracks {
  injury: number;
  exhaustion: number;
  wear: number;
  morale: number;
}

/** Boxes of each harm type a single blow marks, such as 1-injury and 2-wear. */
export type HarmInflicted = Partial<Record<"injury" | "exhaustion" | "wear", number>>;

/** A single average member: someone who represents the majority of the mob. */
export interface MobMember {
  harmTracks: HarmTracks;
  harmInflicted: HarmInflicted;
}

export type MobSize = "small" | "medium" | "large";

export interface Mob extends MobMember {
  size: MobSize;
}
