/** Print reproducible review specimens; never updates the frozen pre-history baseline. */
import { writeFileSync } from 'node:fs';
import { RNG } from '@ironarachne/rng';
import { HISTORY_ACCEPTANCE_SCENARIOS } from '../test_fixtures/region_history_scenarios';
import { generateRegionHistory } from '../src/lib/regions/region_history_generation';
import { regionHistoryReading } from '../src/lib/regions/region_history_presentation';

const sections = HISTORY_ACCEPTANCE_SCENARIOS.map(({ key, seed, build }) => {
  const snapshot = build();
  snapshot.history = generateRegionHistory(snapshot, new RNG(seed));
  const reading = regionHistoryReading(snapshot);
  return [
    `## ${key}`,
    `History seed: \`${seed}\`.`,
    key === 'sparse'
      ? 'Present: one unaffiliated town at its recorded dry-land site; no realms or organizations.'
      : key === 'crowded'
        ? 'Present: eight realms (six subordinate to Realm H), eight towns at recorded sites, ten organizations with five explicit rivalries. The six-event budget cannot cover every input.'
        : key === 'unaffiliated'
          ? 'Present: one town at its recorded site and two explicitly rival organizations. No realms, regional authority, or political affiliation.'
          : 'Present: Realms A and B each have an unpressed claim concerning the other; neither is subordinate. Claims do not establish ownership.',
    ...reading.entries.map((entry) => {
      const event = snapshot.history.events.find((e) => e.id === entry.eventId)!;
      const parents = event.causedByEventIds.map(
        (id) => snapshot.history.events.find((e) => e.id === id)!.name,
      );
      return [
        `### ${entry.heading}`,
        entry.body,
        entry.references.map((r) => r.label).join('; '),
        `Rule: \`${event.evidence.reason.ruleId}\`. Causes: ${parents.join('; ') || 'none recorded'}.`,
        `Saved compatibility observations: ${event.evidence.observations.map((o) => o.kind).join(', ')}.`,
      ].join('\n\n');
    }),
  ].join('\n\n');
});
const text =
  [
    '# Regional history editorial review (#485)',
    '**Status:** reproducible review specimens. The human editorial decision and reviewed packet fingerprint are recorded in [acceptance evidence](../docs/region-history-acceptance.md).',
    'Reproduce with `npx vite-node scripts/render_region_history_review.ts`. Fixtures reuse the explicit present-support builders from #482, based on the frozen pre-history map. These are fictional backstories compatible with saved present facts, not proof of past events. Historical predecessor names are invented; present inhabitants are not projected into the past.',
    ...sections,
    '## Review questions',
    'Do the short accounts read coherently, with clear causal order? Are Explains labels useful without implying historical proof? Does the one-event account avoid filler, and does the predecessor founding/fall bundle clearly distinguish the past polity from current realms? Report any sentence that adds unsupported current ownership, destruction, geography, ongoing war, migration, production, a named founder, or current inhabitants acting in the past.',
  ].join('\n\n') + '\n';
if (process.argv[2]) writeFileSync(process.argv[2], text);
else process.stdout.write(text);
