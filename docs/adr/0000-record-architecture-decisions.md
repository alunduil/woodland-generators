# 0. Record architecture decisions

Date: 2026-05-10

## Status

Accepted

## Context

Decisions stack up as the project grows. Without a durable record, the _why_
behind each choice fades into commit messages, PR threads, and Discord
scrollback. Future contributors inherit the _what_ and have to work out the
_why_ from scratch. That gets expensive.

Scattered records also resist discovery. A future reader doesn't know whether to
grep commit messages, scan PR descriptions, or search chat history. A consistent
home and template solves both problems.

## Decision

Record significant decisions as Architecture Decision Records (ADRs), in the
lightweight format from Michael Nygard's [Documenting Architecture
Decisions][nygard]. ADRs live under `docs/adr/` as `NNNN-kebab-title.md`,
numbered from 0000 (this record).

Each ADR carries a `Status`: `Accepted`, `Deprecated`, or `Superseded by NNNN`,
matching Michael Nygard's original four (minus `Proposed`). ADRs land as
`Accepted`—the PR review is the deliberation, not the committed status field.
`scripts/validate-adrs.ts` enforces the allowed values.

An ADR is warranted when a decision is significant _and_ hard to reverse.
Tactical choices, reversible defaults, and personal style belong in the commit
message, not here.

## Consequences

- Future decisions have one home and one shape.
- Going back to a decision starts from recorded context, not scratch.
- Cost: one short Markdown file per decision. Payoff: durable rationale.
- ADR sprawl is a real failure mode. The warranted-or-not gate is load-bearing.
  When unsure, skip.

[nygard]:
  https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
