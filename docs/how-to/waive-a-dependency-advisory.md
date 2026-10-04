# How to waive a dependency advisory

Waive an advisory when it fails the `Audit production dependencies` check or
appears in the weekly Dependency Audit Report, and you've decided to accept it
rather than upgrade. A waiver silences the advisory in both places.

## Prerequisites

- The advisory's GitHub advisory ID, of the form `GHSA-xxxx-xxxx-xxxx`, from the
  audit output.
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

## Remove the waiver

Delete the entry and its comment from `auditConfig` in `pnpm-workspace.yaml`
once `pnpm-lock.yaml` resolves to a fixed release.
