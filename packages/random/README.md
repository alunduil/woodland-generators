# `@woodland-generators/random`

Seeded randomness for the Woodland Generators packages. Every generator draws
from an `Rng` built from a user-facing seed string, so the same seed reproduces
the same output.

## Usage

```typescript
import { Rng } from "@woodland-generators/random";

const rng = new Rng("a seed phrase");

rng.getRandomIntInclusive(1, 6);
rng.selectRandomElement(["ash", "birch", "cedar"]);
rng.selectRandomSample(["ash", "birch", "cedar"], 2);
```

`hashSeed` derives the 32-bit numeric seed the underlying generator takes.

## Development

```shell
pnpm --filter @woodland-generators/random build
pnpm --filter @woodland-generators/random test
```
