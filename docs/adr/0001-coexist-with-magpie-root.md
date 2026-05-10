# 1. Coexist with `magpie-root` for Foundry Root integration

Date: 2026-05-10

## Status

Proposed

## Context

`@woodland-generators/foundry-module` (scaffolded in PR #293, milestone v0.4.0)
needs to decide how it relates to the existing Foundry VTT ecosystem for Root:
The Roleplaying Game. The choice shapes every generator that emits Foundry
documents (NPC #134, Clearing #135, Faction #229) and resists reversal:
switching from "depend on" to "coexist with" later breaks users without the
dependency, and switching from "ignore" to either re-shapes every generator's
output.

### Surveyed packages (Foundry Package Listing, May 2026)

#### `pbta` (system, Matheus Clemente / Asacolips)

License MIT. Compatibility minimum 9, verified 13, maximum 13+. Updated about
eight months ago. Generic Powered-by-the-Apocalypse framework with a
configurable Actor and Item schema; ships no Root-specific content. Free.

#### `magpie-root` (Quickstart module, Magpie Games)

Proprietary license. Compatibility 12 / 13 / 13. Updated about ten months ago.
Defines Actor types (Character, Clearing, NPC) and Item types (Move, Playbook,
Equipment, Connection, Drive, Nature, Roguish Feat, Background Question). Ships
four core playbooks. Depends on `pbta`.

#### `magpie-root-core` (paid module, Magpie Games)

Proprietary license. Compatibility 12 / 13 / 13. Updated about eight months ago.
Costs $39.99. Adds five Core Book playbooks plus journals, scenes, tables.
Depends on `magpie-root`.

#### `magpie-root-to` (paid module, Magpie Games)

Proprietary license. Compatibility 12 / 13 / 13. Updated about eight months ago.
Paid expansion with ten archetypes, four factions, and two maps. Depends on
`magpie-root-core`.

#### `root` (community module, gonzaPaEst)

GPL-3.0 (code). Compatibility pinned to v11. Last release January 2024.
Unofficial predecessor to `magpie-root`; stale and superseded.

No Foundry **system** targets Root specifically. The `pbta` system supplies the
generic substrate; `magpie-root` supplies Root's concrete schema as a module on
top of it.

### Considered options

#### Depend on `magpie-root`

Declare it via `relationships.requires` in `module.json`. Generators target its
Actor and Item types directly. Locks every woodland-generators user into the
Foundry license plus Magpie's commercial modules. `magpie-root-core` ($39.99)
and `magpie-root-to` cost money. Even `magpie-root` itself ships through
Magpie's marketplace channel (`sigil-fvtt` S3 manifest), gating installation.
Hard-requiring it paywalls a free, open-source generator.

#### Coexist with `magpie-root`

Detect it at runtime (`game.modules.get("magpie-root")?.active`) and adapt the
document shape per generator. No required peer-dep. Costs one branch per
document type and a presence-check helper.

#### Ignore the ecosystem

Define minimal Actor and Item shapes inside `foundry-module`; users hand-copy
generated content. Misses the canonical Root schema that already exists; users
who own `magpie-root` get output that does not slot into its sheets.

## Decision

`@woodland-generators/foundry-module` will coexist with `magpie-root` via
runtime feature detection. Generated stubs target `magpie-root`'s Actor types
(Character, Clearing, NPC) and Item types (Move, Playbook, …) when the module is
active. When `magpie-root` is absent, generators fall back to plain Foundry
Actor, JournalEntry, and Scene documents that any system can consume.

The `module.json` carries no `relationships.requires` entry for `pbta` or
`magpie-root`. Optional `relationships.recommends` hints may land later if a
downstream issue calls for them.

The detection helper lives in the `foundry-module` package's runtime, not in
`@woodland-generators/core`. Foundry awareness belongs to the `foundry-module`
package.

## Consequences

- Free users get usable Foundry output without buying Magpie modules.
- Users who own `magpie-root` get stubs that slot directly into its sheets and
  templates.
- Each Foundry-emitting generator carries one presence-check branch and two
  document-shape paths.
- Foundry v13 minimum (set in PR #293) stands. Every surveyed package verifies
  on v13, so no compatibility-floor amendment.
- The community `root` module's v11 pin does not apply: that module sits
  superseded.
- No live test-install ran for this decision. The first generator emitting
  Foundry documents (NPC, #134) is the natural point at which a throwaway world
  earns its keep; verification defers to that work.
- Future questions of the form "should `foundry-module` integrate with module
  X?" follow this precedent: detect at runtime, fall back to generic, avoid hard
  peer-deps that paywall the generator.
