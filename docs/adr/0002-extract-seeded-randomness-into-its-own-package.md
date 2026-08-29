# 2. Extract seeded randomness into `@woodland-generators/random`

Date: 2026-08-29

## Status

Accepted

## Context

`@woodland-generators/core` holds generators, character and details types,
maths, and logging. Nothing unifies them beyond "not the Foundry UI," so the
package name predicts nothing about what belongs inside it, and every new
utility lands there by default.

Seeded randomness is the first piece whose boundary draws itself. `Rng` wraps
`pure-rand` behind the four operations the generators need, and an FNV-1a hash
turns a user-facing seed string into the numeric seed the generator takes.
Neither touches a Root concept. Both landed inline in `core` with the
`pure-rand` swap (#360, for #311) as a deliberately temporary home.

The question is precedent-setting rather than local: whatever splits `core`
first fixes what a new workspace package costs and how the pieces address each
other.

### Considered options

#### Leave `Rng` in `core`

Costs nothing today. `core` keeps growing without a rule for what it excludes,
and the next utility of the same shape has no precedent to follow. The
seeded-randomness boundary is as clean as any that will appear, so declining
here effectively declines to split `core` at all.

#### A general `utils` package

One carve-out serves several future utilities at once. It also reproduces the
problem: a package named for what it isn't, collecting whatever has no better
home. `core` already demonstrates where that ends.

#### A dedicated `random` package

Names one capability. The cost is per-package scaffolding: `package.json`, a
`tsconfig.json` and `tsconfig.test.json`, a jest configuration, an entry in the
root jest `projects` list, and a `knip.json` workspace block. Every one of those
already exists twice over, so the marginal cost is copying, not designing.

## Decision

We will create `packages/random` = `@woodland-generators/random`, exporting
`Rng` and `hashSeed`. `pure-rand` becomes a dependency of `random` rather than
`core`, and the hash gets its own module.

`core` depends on `random` through `workspace:*` and doesn't re-export `Rng`.
Generators, and any consumer that constructs one, import it from
`@woodland-generators/random` directly.

Packages address each other by their published entry points, not by relative
paths across package boundaries or TypeScript project references.
`pnpm -r build` orders the build from the workspace dependency graph, and the
root `prepare` script builds on install, so `core` type-checks against
`random`'s emitted declarations.

Carve-outs follow this shape: name the capability, give it its own package, and
let the boundary be the package's public API.

## Consequences

- `pure-rand` is reachable only from `random`. A future PRNG swap changes one
  package and touches no generator.
- The hash is independently testable, and now carries a direct unit test against
  the canonical FNV-1a 32-bit reference vectors. Its digest runs over UTF-16
  code units rather than the UTF-8 bytes the reference specifies. The divergence
  is documented at the implementation, because moving to bytes would send every
  non-ASCII seed to a different stream.
- Consumers that construct an `Rng` take a second dependency. Nothing consumes
  `core` at this point, so the break costs nothing to make now and grows more
  expensive to make later.
- `core` still holds generators, character and details types, maths, and
  logging. It remains a catch-all, one utility smaller.
- Each further carve-out repeats the scaffolding. Should that repetition start
  to hurt, shared configuration is the answer, not fewer packages.
- Cross-package changes need a build before a type-check reflects them.
  `pnpm run build` or a running `build:watch` is the working loop.
