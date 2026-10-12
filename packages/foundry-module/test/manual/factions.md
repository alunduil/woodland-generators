<!--
SPDX-FileCopyrightText: 2025-2026 Alex Brandt

SPDX-License-Identifier: MIT
-->

# Manual scenarios for the factions in play

What the factions in play setting must do inside a live Foundry. The Jest suite
checks what the module hands `game.settings.register`; it can't check how Module
Settings renders a `SetField`, what Foundry stores, or who may change it.

Record results in the pull request that changes this behaviour, not here.

## Before you start

Follow [Before you start](generator-menu.md#before-you-start) in the generator
menu scenarios: build the bundle, bring up a world with the module enabled, and
keep the console open, filtered to `woodland-generators`.

Scenario 4 needs the **Player** user that file describes.

## 1. A GM sees every faction in play by default

In a world that has never saved this setting, open **Game Settings → Configure
Settings → Module Settings** as the GM.

Expect a Factions in Play entry with a hint below it, both in prose rather than
keys like `WOODLAND-GENERATORS.Settings.Factions.Name`. Expect all seven
factions offered and all seven selected.

## 2. A narrowed set survives a reload

Deselect every faction except Marquisate and Lizard Cult, then save. Reload the
browser tab and reopen Module Settings.

Expect only those two selected. In the console, expect:

```js
game.settings.get("woodland-generators", "factions");
```

to hold exactly those two.

## 3. An empty set is refused

Deselect every faction and save.

Expect Foundry to refuse the save with a validation error, and a reload to show
the previous selection unchanged.

## 4. A player can't change it

Log in as the player. Open **Game Settings → Configure Settings → Module
Settings**.

Expect no Factions in Play entry. In the player's console, expect:

```js
game.settings.set("woodland-generators", "factions", ["Marquisate"]);
```

to fail, and the GM's selection to stay as scenario 2 left it.

## Coverage

| Scenario | Acceptance criterion from #671                                |
| -------- | ------------------------------------------------------------- |
| 1        | The setting defaults to all seven factions                    |
| 2        | A GM sets the factions in play once per world                 |
| 3        | None; it keeps `generateClearing` from receiving an empty set |
| 4        | Only a GM can change it                                       |
