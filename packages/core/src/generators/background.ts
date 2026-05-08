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
export class BackgroundGenerator implements Generator<BackgroundInfo> {
  private options: BackgroundGeneratorOptions;

  constructor(options: BackgroundGeneratorOptions) {
    this.options = {
      useFallbacks: true,
      ...options,
    };
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
    // For backgrounds, this returns all possible combinations
    const backgrounds: BackgroundInfo[] = [];

    this.options.homeOptions.forEach((home) => {
      this.options.motivationOptions.forEach((motivation) => {
        backgrounds.push({ home, motivation });
      });
    });

    return backgrounds;
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
