<!--
SPDX-FileCopyrightText: 2025-2026 Alex Brandt

SPDX-License-Identifier: MIT
-->

# Manual scenarios for the generator menu

What the generator menu must do inside a live Foundry. The Jest suite stubs the
`foundry` global, so it checks that the module agrees with its own manifest and
language catalog. It never constructs an Application, renders one, or closes
one. These scenarios cover that gap until an automated harness replaces them.

Record results in the pull request that changes this behaviour, not here. This
file holds the scenarios; a run of them is evidence for one change.

## Before you start

1. Build the bundle:

   ```bash
   pnpm --filter @woodland-generators/foundry-module build
   ```

2. Bring up a world with the module enabled. Either
   [install into a local Foundry](../../../../docs/how-to/install-the-foundry-module-into-a-local-foundry.md)
   or
   [verify with `docker compose`](../../../../docs/how-to/verify-foundry-module-with-docker-compose.md).

3. Open the browser console and leave it open. Several scenarios turn on what it
   reports. Filter it to `woodland-generators`: the heartbeat is a `console.log`
   and an errors-only view hides it, and a game system can emit a steady stream
   of its own deprecation notices at error level. Only an error naming this
   module counts against a scenario.

Scenarios 5 and 6 need a second user whose role is **Player**. Assistant
inherits enough from the GM role to mask a failure. Create one under **Game
Settings → Manage Users** and open it in a private window, so both sessions stay
logged in at once.

## 1. The module loads

Open the world as the GM.

Expect `woodland-generators | initialized` in the console, and no error from the
module during load.

## 2. A GM sees the launcher

Go to **Game Settings → Configure Settings → Module Settings**.

Expect a Woodland Generators entry with its own button, a title, and a hint
below it. Expect prose in all three, not keys like
`WOODLAND-GENERATORS.Menu.Name`.

## 3. The window opens and renders

Click the launcher button.

Expect a window titled Woodland Generators, carrying the module's icon, whose
body says no generators are available yet. Expect no console error.

## 4. The window closes and reopens

Close the window with its header control, then reopen it from the same button.
Run the cycle twice; a leaked instance usually shows on the second pass.

Expect it to close without a console error, and to reopen rendering the same
way. A second window appearing, or the reopened one rendering empty, means the
Application instance leaked across the close.

## 5. A player doesn't see the launcher

Log in as the player. Go to **Game Settings → Configure Settings → Module
Settings**.

Expect no Woodland Generators entry. This is Foundry's `restricted` flag doing
the work, so a regression here most likely means the flag was dropped.

## 6. A player can't reach the window another way

As the player, confirm the module still loaded. The line
`woodland-generators | initialized` appears in the player's console too, because
the heartbeat isn't gated.

Expect the launcher to stay unreachable from the sidebar and scene controls. The
module registers no other entry point, so anything that opens it here is a
surprise worth filing.

## Coverage

| Scenario | Acceptance criterion from #225                                 |
| -------- | -------------------------------------------------------------- |
| 1        | None; it guards the rest, since a dead module fails everything |
| 2        | Menu entry visible to GMs                                      |
| 3, 4     | Application opens, renders, and closes cleanly                 |
| 5, 6     | Hidden from non-GM users                                       |

These scenarios are an interim. #657 converts each one into a Playwright spec
and retires this file; #644 builds the real-Foundry container those specs drive.
