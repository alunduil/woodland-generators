/**
 * Common options for all generators
 */
export interface GeneratorOptions {
  /** Seed for reproducible random generation */
  seed?: string;
  /** Whether to use fallback defaults if no options available */
  useFallbacks?: boolean;
}

/**
 * Base interface for all character generators
 */
export interface Generator<T> {
  generate(options?: GeneratorOptions): T | null;
  getAvailableOptions(): T[];
  isAvailable(): boolean;
}

/**
 * Configuration options for feat generation
 */
export interface FeatGeneratorOptions extends GeneratorOptions {
  /** Available feat options */
  availableFeats: string[];
}

/**
 * Generator for character feats
 */
export class FeatGenerator implements Generator<string> {
  private options: FeatGeneratorOptions;

  constructor(options: FeatGeneratorOptions) {
    this.options = {
      useFallbacks: false, // Feats are specific to playbooks, no generic fallbacks
      ...options,
    };
  }

  /**
   * Generate a random feat
   */
  generate(overrides?: GeneratorOptions): string | null {
    const availableFeats = this.getAvailableOptions();

    if (availableFeats.length === 0) {
      return null;
    }

    // TODO: Use seed for reproducible generation if provided
    const seed = overrides?.seed ?? this.options.seed;
    if (seed) {
      console.log(`Using seed: ${seed} for feat generation`);
    }

    const randomIndex = Math.floor(Math.random() * availableFeats.length);
    return availableFeats[randomIndex] ?? null;
  }

  /**
   * Get all available feat options
   */
  getAvailableOptions(): string[] {
    return this.options.availableFeats;
  }

  /**
   * Check if feat generation is available
   */
  isAvailable(): boolean {
    return this.options.availableFeats.length > 0;
  }

  /**
   * Update available feat options
   */
  updateOptions(feats: string[]): void {
    this.options.availableFeats = feats;
  }
}
