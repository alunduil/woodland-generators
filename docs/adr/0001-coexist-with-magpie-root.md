# 1. Coexist with `magpie-root` for Foundry Root integration

Date: 2026-05-10

## Status

Accepted

## Context

`@woodland-generators/foundry-module` (PR #293, v0.4.0) needs an integration
posture for Root: The Roleplaying Game on Foundry VTT. The choice shapes every
generator that emits Foundry documents and resists reversal. Switching from
"depend on" to "coexist" later breaks users without the dependency. Switching
from "ignore" reshapes every generator's output.

### Surveyed packages (Foundry Package Listing, May 2026)

#### `pbta` (system, Asacolips)

MIT. Compat 9 / 13 / 13+. Updated ~8 months ago. Generic PbtA framework with a
configurable Actor/Item schema. No Root content. Free.

#### `magpie-root` (Quickstart module, Magpie Games)

Proprietary. Compat 12 / 13 / 13. Updated ~10 months ago. Defines Actor types
(Character, Clearing, NPC) and Item types (Move, Playbook, Equipment,
Connection, Drive, Nature, Roguish Feat, Background Question). Ships four core
playbooks. Depends on `pbta`.

#### `magpie-root-core` (paid module, Magpie Games)

Proprietary. Compat 12 / 13 / 13. Updated ~8 months ago. Costs $39.99. Adds five
Core Book playbooks plus journals, scenes, tables. Depends on `magpie-root`.

#### `magpie-root-to` (paid module, Magpie Games)

Proprietary. Compat 12 / 13 / 13. Updated ~8 months ago. Paid expansion: ten
archetypes, four factions, two maps. Depends on `magpie-root-core`.

#### `root` (community module, gonzaPaEst)

GPL-3.0. Pinned to Foundry v11. Last release January 2024. Unofficial
predecessor to `magpie-root`. Stale, superseded.

No Foundry **system** targets Root. The `pbta` system supplies the generic
substrate. `magpie-root` supplies Root's concrete schema on top of it.

### Considered options

#### Depend on `magpie-root`

Declare it via `relationships.requires` in `module.json`. Generators target its
Actor and Item types directly. Locks every user into the Foundry license plus
Magpie's commercial modules. `magpie-root-core` ($39.99) and `magpie-root-to`
cost money. Even free `magpie-root` ships through Magpie's gated marketplace
(the `sigil-fvtt` S3 manifest). Hard-requiring it paywalls a free generator.

#### Coexist with `magpie-root`

Detect at runtime (`game.modules.get("magpie-root")?.active`) and adapt the
document shape per generator. No required peer-dep. Cost: one branch per
document type, plus a presence-check helper.

#### Ignore the ecosystem

Define minimal Actor and Item shapes inside `foundry-module`. Users hand-copy
generated content. Misses the canonical Root schema. `magpie-root` owners get
output that doesn't slot into its sheets.

## Decision

`@woodland-generators/foundry-module` coexists with `magpie-root` via runtime
feature detection. When `magpie-root` is active, generated stubs target its
Actor types (Character, Clearing, NPC) and Item types (Move, Playbook, …). When
absent, generators fall back to plain Foundry Actor, JournalEntry, and Scene
documents that any system can consume.

The `module.json` carries no `relationships.requires` entry. Optional
`relationships.recommends` hints may land later if a downstream issue calls for
them.

The detection helper lives in `foundry-module`, not `@woodland-generators/core`.
Foundry awareness is a `foundry-module` concern.

## Consequences

- Free users get usable Foundry output without buying Magpie modules.
- `magpie-root` owners get stubs that slot into its sheets directly.
- Each Foundry-emitting generator carries a presence-check branch and two
  document-shape paths.
- The Foundry v13 floor (PR #293) stands. Every surveyed package verifies on
  v13.
- The community `root` module's v11 pin does not apply: it's superseded.
- No live test-install ran. The first generator emitting Foundry documents (NPC,
  #134) is the natural point to spin up a throwaway world; verification defers
  to that work.
- Future "should `foundry-module` integrate with X?" questions follow this
  precedent: detect at runtime, fall back to generic, avoid paywalling
  peer-deps.
