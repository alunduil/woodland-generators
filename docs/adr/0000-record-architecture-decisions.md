# 0. Record architecture decisions

Date: 2026-05-10

## Status

Proposed

## Context

Architectural decisions accumulate as the project grows. Without a durable
record, the reasoning behind each choice fades into commit messages, PR threads,
and Discord scrollback. Future contributors (human or AI) inherit the _what_ but
lose the _why_, which makes revisiting a decision expensive: every
reconsideration starts by re-deriving constraints that someone already worked
through.

The first such decision (Foundry integration posture, 0001) made the gap
concrete. The survey-and-pick output had no settled place to live; a
free-floating `docs/foundry-ecosystem.md` mixed reference material with
rationale and gave no shape for the next architectural decision to follow.

## Decision

We will record architecturally significant decisions as Architecture Decision
Records (ADRs), following the lightweight format described by Michael Nygard in
[Documenting Architecture Decisions][nygard]. ADRs live under `docs/adr/` as
`NNNN-kebab-title.md`, numbered sequentially starting at 0000 (this record).

Each ADR carries a `Status` (`Proposed`, `Accepted`, `Superseded by NNNN`, or
`Deprecated`). New ADRs land as `Proposed`; maintainers promote on merge or
follow-up review.

An ADR is warranted when a decision is architecturally significant _and_ hard to
reverse. Tactical implementation choices, low-cost-to-reverse defaults, and
personal style do not warrant ADRs; their record belongs in the commit message
or PR description.

## Consequences

- Future architectural decisions have a single discoverable home and a
  consistent shape.
- Revisiting a decision starts from the recorded context and alternatives, not
  from re-derivation.
- The project accepts a small per-decision overhead (~one short Markdown file)
  in exchange for durable rationale.
- ADR sprawl is a real failure mode; the warranted-or-not gate is load-bearing.
  When unsure, prefer not to write one.

[nygard]:
  https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
