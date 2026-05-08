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
 * Configuration options for move generation
 */
export interface MoveGeneratorOptions extends GeneratorOptions {
  /** Available move options */
  availableMoves: string[];
}

/**
 * Generator for character moves
 */
export class MoveGenerator implements Generator<string> {
  private options: MoveGeneratorOptions;

  constructor(options: MoveGeneratorOptions) {
    this.options = {
      useFallbacks: false, // Moves are specific to playbooks, no generic fallbacks
      ...options,
    };
  }

  /**
   * Generate a random move
   */
  generate(overrides?: GeneratorOptions): string | null {
    const availableMoves = this.getAvailableOptions();

    if (availableMoves.length === 0) {
      return null;
    }

    // TODO: Use seed for reproducible generation if provided
    const seed = overrides?.seed ?? this.options.seed;
    if (seed) {
      console.log(`Using seed: ${seed} for move generation`);
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex] ?? null;
  }

  /**
   * Get all available move options
   */
  getAvailableOptions(): string[] {
    return this.options.availableMoves;
  }

  /**
   * Check if move generation is available
   */
  isAvailable(): boolean {
    return this.options.availableMoves.length > 0;
  }

  /**
   * Update available move options
   */
  updateOptions(moves: string[]): void {
    this.options.availableMoves = moves;
  }
}
