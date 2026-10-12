<!--
SPDX-FileCopyrightText: 2025-2026 Alex Brandt

SPDX-License-Identifier: MIT
-->

# Manual scenarios for the clearing dialog

What the clearing dialog must do inside a live Foundry. The Jest suite checks
the markup and the submit handler against stubs; it can't check that Foundry
renders the form, parses its fields, or refuses a submission the handler
rejects.

Record results in the pull request that changes this behaviour, not here.

## Before you start

Follow [Before you start](generator-menu.md#before-you-start) in the generator
menu scenarios: build the bundle, bring up a world with the module enabled, and
keep the console open, filtered to `woodland-generators`.

Open the generator menu from **Game Settings → Configure Settings → Module
Settings** as the GM.

## 1. The menu opens the dialog

Click **Clearings** in the generator menu.

Expect a window titled Generate Clearings with a Number of Clearings field set
to 1, a Seed field holding a random value, and a Generate button. Expect prose
in every label, not keys like `WOODLAND-GENERATORS.Clearing.Seed`.

## 2. A batch draws from the factions in play

Narrow the factions in play to Marquisate and Lizard Cult, as
[scenario 2 of the factions scenarios](factions.md#2-a-narrowed-set-survives-a-reload)
does. Open the dialog, set the count to 3 and the seed to `woodland`, and click
**Generate**.

Expect the dialog to close, and the console to log three clearings after
`woodland-generators |`. Expect every `ruler` to be Marquisate or Lizard Cult.

## 3. The same seed redraws the same batch

Repeat scenario 2 with the same count and seed.

Expect the logged batch to match the first one field for field.

## 4. A count below one is refused

Open the dialog, set the count to 0, and click **Generate**.

Expect the browser to refuse the field. Then remove the `min` attribute from the
count input in the inspector, and click **Generate** again. Expect an error
notification saying to generate at least one clearing, the dialog to stay open,
and nothing logged.

## Coverage

| Scenario | Acceptance criterion from #664                                |
| -------- | ------------------------------------------------------------- |
| 1        | The menu lists the clearing generator; every label resolves   |
| 2        | Clearings respect the factions in play without restating them |
| 3        | The same seed and options redraw the same batch of clearings  |
| 4        | The dialog rejects a count below one                          |
