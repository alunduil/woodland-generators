<!--
SPDX-FileCopyrightText: 2026 Alex Brandt

SPDX-License-Identifier: MIT
-->

# Manual scenarios for clearing Scenes and Journal entries

What a submitted clearing dialog must leave in a live Foundry world. The Jest
suite checks the creation data the module plans; it can't check that Foundry
keeps the IDs, files the documents in their directories, or follows the links
between them.

Record results in the pull request that changes this behaviour, not here.

## Before you start

Follow [Before you start](generator-menu.md#before-you-start) in the generator
menu scenarios: build the bundle, bring up a world with the module enabled, and
keep the console open, filtered to `woodland-generators`.

Use a throwaway world. Every scenario writes Scenes and Journal entries into it.

## 1. A clearing appears in both directories

Open the generator menu from **Game Settings → Configure Settings → Module
Settings** as the GM, and start a timer. Click **Clearings**, leave the count at
1, and click **Generate**.

Expect a Journal entry in the Journal directory and a Scene of the same name in
the Scenes directory, created in under 30 seconds from opening the menu. Expect
the Scene to be missing from the navigation bar, and no error naming this module
in the console.

## 2. The Journal entry reads at the table

Open the Journal entry from scenario 1.

Expect, in order: the ruling faction, a Features list, a Denizens list, a
Conflict section naming the challenger and what's at stake, and a link carrying
the Scene's name. Expect prose in every label, not keys like
`WOODLAND-GENERATORS.Clearing.Journal.Ruler`.

Expect the entry to end, below a rule, with a notice that the content is
unofficial and unaffiliated with Magpie Games or Leder Games.

## 3. The Scene reaches its Journal entry

Right-click the Scene from scenario 1 in the Scenes directory and choose
**Configure**.

Expect its journal field to name the Journal entry from scenario 1. Close the
configuration, view the Scene, and expect Foundry's default background with no
image in place of a map.

## 4. The Journal entry reaches its Scene

Hover the Scene link in the Journal entry from scenario 1, then click it.

Expect the link to resolve to the Scene, not to render as broken. Expect the
click to bring the same Journal entry forward: Foundry opens a Scene's journal
when its link is clicked.

## 5. A batch pairs each Scene with its own Journal entry

Generate 3 clearings in one submission. Repeat scenarios 3 and 4 for each new
Scene.

Expect every Scene to name its own Journal entry, and every Journal entry's link
to resolve to its own Scene. Two clearings in a batch can share a name; when
they do, compare document IDs rather than names.

## Coverage

| Scenario | Acceptance criterion from #665                                   |
| -------- | ---------------------------------------------------------------- |
| 1        | Submitting the dialog creates pairs visible in their directories |
| 1        | A first-time GM can produce a clearing in under 30 seconds       |
| 2        | The Journal entry lays out every generated field                 |
| 2        | The Journal entry ends with the unofficial notice                |
| 3, 4, 5  | Each Scene and its Journal entry link to each other              |
