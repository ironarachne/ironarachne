---
name: determinism
description: Audit Iron Arachne generators and their dependencies for reproducible seeded output and RNG-contract violations. Use when investigating random output, adding a generator, or invoking $determinism.
---

# Determinism

Audit the complete generation path, not only the public generator file. The same seed and equivalent
configuration must produce equivalent output, apart from explicitly documented runtime metadata.
Prefer evidence from a focused test or a small reproducible experiment over a pattern match alone.

## Establish the scope

Accept a route, generator function, library directory, issue, or changed diff. If an issue is supplied,
read it with `gh issue view <number> --comments` and verify its claims against the repository.

Start at the public entry point and trace every helper that can affect output, including default
configuration factories, names, heraldry, astronomical bodies, tables, callbacks, and renderable
data. Inspect imports and callers when a helper's RNG behavior is unclear.

## Search for violation sources

Search the scoped code and its reachable helpers for:

- `Math.random`, direct browser randomness, or unseeded third-party randomness
- `Date.now()`, `new Date()`, timestamps, UUIDs, or process/environment values used in generated data
- `new RNG(...)` inside helpers that should use a caller-owned RNG, especially `new RNG(Date.now())`
- RNG instances created in more than one stream during one generation run
- helpers that accept an RNG but ignore it, or callbacks that drop a required RNG parameter
- iteration over unordered external data, object keys, sets, or maps when ordering affects selection
- asynchronous completion order, global mutable state, module-level counters, and cached random values
- generated closures or runtime objects that make equality or persistence appear nondeterministic

Do not report a timestamp used only for explicitly runtime metadata as a generation defect, but state
that distinction and verify it is excluded from the persisted/generated payload.

## Verify the RNG contract

Classify each random source:

1. **Seed owner**: the public entry point accepts a seed and creates exactly one local `RNG`, or a
   documented parent generator owns the RNG.
2. **Threading**: every random helper receives that RNG, directly or through a clearly documented
   child operation.
3. **Defaults**: default config helpers accept the caller's RNG when their values are random. They do
   not silently seed themselves from the clock.
4. **Callbacks**: callback signatures retain the RNG parameter. If a callback does not need it, the
   implementation names it `_rng` rather than changing the contract.
5. **Output**: all output-affecting choices derive from the owned RNG and deterministic input data.

If a separate RNG is intentional, identify the boundary and prove that its seed is itself derived
deterministically from the owned stream. Otherwise treat it as a finding.

## Reproduce the claim

Locate existing tests before adding new ones. The minimum useful focused test calls the public entry
point twice with the same seed and equivalent configuration and compares the generated data after
removing only documented runtime metadata. Also test two different seeds when the generator's domain
allows that distinction, so a constant-output implementation does not pass.

For a suspected clock defect, run the smallest relevant test or experiment twice with the same seed and
inspect the differing field. For a suspected hidden helper defect, pass a controlled RNG into the
helper if its API permits it and compare the complete result. Avoid broad Stryker runs; repository
policy permits targeted mutation runs only and they are not part of this audit.

When the output contains closures, SVG render functions, maps, or other runtime values, compare the
stable serialized/snapshot representation used by the relevant library rather than relying on object
identity. Do not weaken a test merely because the output is inconvenient to compare; identify the
proper stored or normalized form.

## Report format

Report findings first, most severe first. Every finding must use:

`file:line — nondeterministic source or broken RNG contract — concrete same-seed failure case`

Then report:

- The entry point and dependency path inspected
- Randomness sources verified as safe
- Reproduction commands and results
- Tests that should be added or updated
- Any unresolved uncertainty, including code paths not reached
- Whether the issue is local or repeated across a shared helper and should be fixed at the owner

Never recommend `Math.random`, a second clock-seeded RNG, disabling the deterministic test, or adding
an exemption to `scripts/library_coverage_baseline.json`. Do not edit code during an audit unless the
caller explicitly requests implementation of the findings.
