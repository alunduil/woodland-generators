// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Common options for all generators
 */
export interface GeneratorOptions {
  /** Seed for reproducible random generation */
  seed?: string;
}

/**
 * Configuration options for background generation
 */
export interface BackgroundGeneratorOptions extends GeneratorOptions {
  /** Available home background options */
  homeOptions: string[];
  /** Available motivation background options */
  motivationOptions: string[];
}

/**
 * Background information for character generation
 */
export interface BackgroundInfo {
  home: string | null;
  motivation: string | null;
}

/**
 * Generator for character backgrounds
 */
export class BackgroundGenerator {
  private options: BackgroundGeneratorOptions;

  constructor(options: BackgroundGeneratorOptions) {
    // Copied so updateOptions cannot write through to the caller's object.
    this.options = { ...options };
  }

  /**
   * Generate random background information
   */
  generate(overrides?: GeneratorOptions): BackgroundInfo | null {
    if (!this.isAvailable()) {
      return null;
    }

    // TODO: Use seed for reproducible generation if provided
    const seed = overrides?.seed ?? this.options.seed;
    if (seed) {
      console.log(`Using seed: ${seed} for background generation`);
    }

    const home = this.generateRandomHome();
    const motivation = this.generateRandomMotivation();

    return { home, motivation };
  }

  /**
   * Get all available background options
   */
  getAvailableOptions(): BackgroundInfo[] {
    return this.options.homeOptions.flatMap((home) =>
      this.options.motivationOptions.map((motivation) => ({ home, motivation })),
    );
  }

  /**
   * Check if background generation is available
   */
  isAvailable(): boolean {
    return this.options.homeOptions.length > 0 || this.options.motivationOptions.length > 0;
  }

  /**
   * Generate a random home background
   */
  generateRandomHome(): string | null {
    if (this.options.homeOptions.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.options.homeOptions.length);
    return this.options.homeOptions[randomIndex] ?? null;
  }

  /**
   * Generate a random motivation background
   */
  generateRandomMotivation(): string | null {
    if (this.options.motivationOptions.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.options.motivationOptions.length);
    return this.options.motivationOptions[randomIndex] ?? null;
  }

  /**
   * Update background options
   */
  updateOptions(homeOptions: string[], motivationOptions: string[]): void {
    this.options.homeOptions = homeOptions;
    this.options.motivationOptions = motivationOptions;
  }
}
