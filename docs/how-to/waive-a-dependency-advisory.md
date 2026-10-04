# How to waive a dependency advisory

Waive an advisory when it fails the `Audit production dependencies` check and
you've decided to accept it rather than upgrade.

## Prerequisites

- The advisory's `GHSA-xxxx-xxxx-xxxx` ID from the audit output.
- A reason the advisory doesn't apply or can't be fixed yet.

## Record the waiver

1. Add the advisory to the waiver list:

   ```bash
   pnpm audit --ignore GHSA-xxxx-xxxx-xxxx
   ```

2. In `pnpm-workspace.yaml`, add a comment above the new `auditConfig` entry
   giving the reason.

3. Confirm the audit lists it as ignored:

   ```bash
   pnpm audit
   ```

4. Dependabot keeps its own waivers. Dismiss the matching alert under
   **Security** > **Dependabot** with the same reason.

## Remove the waiver

Once `pnpm-lock.yaml` resolves to a fixed release, delete the entry and its
comment from `auditConfig` in `pnpm-workspace.yaml`.
