# Foundry ecosystem for Root: The RPG

Survey of Foundry VTT packages targeting Root: The Roleplaying Game, and the
integration decision for `@woodland-generators/foundry-module`.

## Packages surveyed

### `pbta` (system)

- Maintainer: Matheus Clemente. License: MIT.
- Compatibility: minimum 9, verified 13, maximum 13+. Updated ~8 months ago.
- Generic Powered-by-the-Apocalypse framework. Configurable Actor and Item
  schema, no Root-specific content.

### `magpie-root` (Quickstart, Magpie Games)

- Module. Compatibility: minimum 12, verified 13, maximum 13. Updated ~10 months
  ago.
- Defines Actor types (Character, Clearing, NPC) and Item types (Move, Playbook,
  Equipment, Connection, Drive, Nature, Roguish Feat, Background Question).
  Ships four core playbooks. Depends on `pbta`.

### `magpie-root-core` (Magpie Games)

- Paid module ($39.99). Compatibility: minimum 12, verified 13, maximum 13.
  Updated ~8 months ago.
- Adds five Core Book playbooks, journals, scenes, tables. Depends on
  `magpie-root`.

### `magpie-root-to` (Magpie Games)

- Paid expansion. Compatibility: minimum 12, verified 13, maximum 13. Updated ~8
  months ago.
- Adds ten Travelers & Outsiders archetypes, four factions, two maps. Depends on
  `magpie-root-core`.

### `root` (community, gonzaPaEst)

- Module. License GPL-3.0 (code). Compatibility pinned to v11. Last release
  Jan 2024.
- Unofficial predecessor to `magpie-root`; stale and superseded.

No Foundry **system** targets Root specifically. The `pbta` system supplies the
generic substrate; `magpie-root` supplies Root's concrete schema as a module on
top of it.

## Decision: Coexist with `magpie-root`

`@woodland-generators/foundry-module` neither hard-requires nor ignores the
Magpie ecosystem. At runtime it feature-detects `magpie-root` and adapts:

- **`magpie-root` active**: generated stubs target its Actor types (Character,
  Clearing, NPC) and Item types (Move, Playbook, …) so they slot directly into
  Magpie's sheets and templates.
- **`magpie-root` absent**: fall back to plain Foundry Actor, JournalEntry, and
  Scene documents. Generators still produce usable output; users without the
  paid module can paste content into any system.

### Why not `depend on`

- `magpie-root-core` and `magpie-root-to` cost money. Hard-requiring them would
  paywall a free, open-source generator.
- `magpie-root` itself sits behind the Foundry license and Magpie marketplace.
  Even the free Quickstart's distribution channel (the `sigil-fvtt` S3 manifest)
  gates installation behind that flow.
- A required peer-dep would force every woodland-generators user to be a Magpie
  customer.

### Why not `ignore`

- `magpie-root`'s schema _is_ the canonical Foundry shape for Root content.
  Users who own it expect generated NPCs and clearings to render in its sheets,
  not in generic Foundry templates.
- Coexistence costs little: a presence check on
  `game.modules.get("magpie-root")?.active` selects the document shape.

## Implications

### `module.json`

This decision adds no `relationships.requires` entry. The `coexist with` posture
means there exists no required peer-dep to declare. Optional
`relationships.recommends` hints (`pbta`, `magpie-root`) can land later if a
downstream issue asks for them.

### Compatibility floor

Foundry v13 minimum, set in
[#293](https://github.com/alunduil/woodland-generators/pull/293), stands. Every
surveyed package verifies on v13; none push the floor higher. The community
`root` module's v11 pin does not apply: that module sits superseded.

### Schema mapping (forward reference)

When generator issues land
([#134](https://github.com/alunduil/woodland-generators/issues/134) NPC,
[#135](https://github.com/alunduil/woodland-generators/issues/135) Clearing,
[#229](https://github.com/alunduil/woodland-generators/issues/229) Faction) they
branch on `magpie-root` presence and target its Actor and Item types when
active. The detection helper belongs in this module's runtime, not in
`@woodland-generators/core`.

## Verification

- Manifest data read from each package's Foundry Package Listing entry and,
  where available, the published `module.json` (such as
  `https://raw.githubusercontent.com/gonzaPaEst/root/v2.1/module.json`).
- No live-Foundry test-install ran. The acceptance-criteria test-install step in
  the source issue defers to the first generator that emits Foundry documents
  (NPC, [#134](https://github.com/alunduil/woodland-generators/issues/134));
  that work needs a throwaway world anyway.
