# Narrative

Seeded composition of a small number of supported meanings, followed by compatible wording
choices. Domain adapters provide `NarrativeSubject` candidates; they own truth, same-type
comparison thresholds, importance and grammar. The composer does not infer facts from statistics.

`composeNarrative(subject, policy, context, rng)` returns text, selection records and the next
explicit batch context. It does not mutate inputs or own an RNG. Candidates and templates are
selected in stable ID order; fragment order is intentional. Persist only the final text using the
consumer's existing saved fields, and reuse it on screen and in exports.

Importance is strict: defining, distinctive, then supporting. Within an importance tier, fresh
candidate IDs are preferred, followed by seeded choice. Sentence and topic budgets cap output;
insufficient useful candidates do not cause filler. History tracks a bounded number of recent
sentence selections, across subjects in the caller's explicitly ordered batch. A zero window
disables repetition memory.

Templates are ordered literal fragment pools: include any required spaces, articles and punctuation
in the fragments. Every template must produce one grammatical, complete sentence under all
combinations. Whole-sentence alternatives work as a single part. IDs are nonempty and unique in
their owning pool; option strings are distinct within each part. Empty fragment strings may represent
an optional phrase, but domain templates must not produce an empty sentence. No punctuation or
capitalization repair silently changes authored fragments.

Template and fragment combinations prefer unused selections within the configured window. When a
template pool is exhausted the composer allows repeats. Combination search stops at the first
fresh combination rather than constructing every possible sentence.

See the accepted [prose contract](../../../docs/narrative-prose.md) and the
[adoption inventory](../../../docs/narrative-prose-adoption.md).
