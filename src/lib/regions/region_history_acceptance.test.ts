import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  HISTORY_ACCEPTANCE_SCENARIOS,
  historyPresentBase,
} from '../../../test_fixtures/region_history_scenarios';
import { generateRegionHistory } from './region_history_generation';
import { validateRegionSnapshot, migrateRegionSnapshot } from './region_artifact_kind';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { regionHistoryReading } from './region_history_presentation';
import {
  getCurrentHistoryEvents,
  getHistoryEventsNeedingReview,
} from './region_history_dependencies';
import { setRegionHistoryEventText } from './region_history_editing';
import { removeRegionPlace, setRegionPlaceText } from './region_editing';
import { emptyRegionFacts } from './region_facts';

function reopen(snapshot: RegionSnapshot) {
  const stored = JSON.parse(JSON.stringify(snapshot));
  const valid = validateRegionSnapshot(stored);
  expect(valid.ok, valid.ok ? '' : valid.message).toBe(true);
  return toRegionSnapshot(regionFromSnapshot(stored, new RNG('acceptance-load')));
}

describe('regional history cross-subsystem acceptance', () => {
  it('keeps the accepted packet tied to its recorded editorial review', () => {
    const packet = readFileSync('test_fixtures/region_history_485.md');
    const record = readFileSync('docs/region-history-acceptance.md', 'utf8');
    const fingerprint = createHash('sha256').update(packet).digest('hex');
    expect(record).toContain(`Reviewed packet SHA-256: ` + '`' + fingerprint + '`');
  });

  it.each(HISTORY_ACCEPTANCE_SCENARIOS)(
    '$key: preserves present support and the reviewed account through persistence and every reading adapter',
    ({ build, seed, key }) => {
      const present = build(),
        before = structuredClone(present);
      const history = generateRegionHistory(present, new RNG(seed));
      const snapshot = { ...present, history };
      expect(present).toEqual(before);
      expect(history).toEqual(generateRegionHistory(present, new RNG(seed)));
      const restored = reopen(snapshot);
      expect(restored).toEqual(snapshot);
      expect(getCurrentHistoryEvents(restored)).toEqual(history.events);
      expect(getHistoryEventsNeedingReview(restored)).toEqual([]);
      if (key === 'sparse') expect(history.events).toHaveLength(1);
      if (key === 'crowded') expect(history.events).toHaveLength(6);
      if (key === 'unaffiliated') expect(restored.realms).toEqual([]);
      if (key === 'conflicting-claims') {
        expect(history.events.some((e) => e.outcome.kind === 'war')).toBe(true);
        expect(history.events.some((e) => e.outcome.kind === 'fall')).toBe(true);
        expect(restored.realms.map((r) => r.claims)).toEqual(before.realms.map((r) => r.claims));
      }
      const packet = readFileSync('test_fixtures/region_history_485.md', 'utf8');
      const reading = regionHistoryReading(restored);
      const ui = regionToUiDocument(restored).sections.find((s) => s.heading === 'History')!;
      expect(ui.entries.map((e) => e.body)).toEqual(reading.entries.map((e) => e.body));
      expect(
        regionToDocument(restored).sections.find((s) => s.heading === 'History')?.history,
      ).toEqual(reading);
      for (const entry of reading.entries) {
        expect(packet).toContain(entry.body);
        expect(packet).toContain(entry.heading);
        expect(regionToMarkdown(restored)).toContain(entry.body);
        expect(regionToText(restored)).toContain(entry.body);
        for (const reference of entry.references) expect(packet).toContain(reference.label);
      }
    },
  );

  it('lets consumers query only current events after imported source changes, without repairing saved text', () => {
    const scenario = HISTORY_ACCEPTANCE_SCENARIOS[2];
    const snapshot = scenario.build();
    snapshot.history = generateRegionHistory(snapshot, new RNG(scenario.seed));
    const war = snapshot.history.events.find((e) => e.outcome.kind === 'war')!;
    const authored = setRegionHistoryEventText(
      snapshot,
      war.id,
      'description',
      'The orders fought; their rivalry persists.',
    );
    const imported = structuredClone(authored);
    imported.organizations[0].name = 'Renamed Order'; // Deliberately bypass the edit finalizer.
    const stored = reopen(imported),
      before = structuredClone(stored);
    const draw = vi.spyOn(RNG.prototype, 'int');
    try {
      expect(getCurrentHistoryEvents(stored).some((e) => e.id === war.id)).toBe(false);
      expect(getHistoryEventsNeedingReview(stored).some((e) => e.id === war.id)).toBe(true);
      const reading = regionHistoryReading(stored);
      expect(reading.notice).toContain('History needs review');
      expect(reading.entries.find((e) => e.eventId === war.id)).toMatchObject({
        body: 'The orders fought; their rivalry persists.',
        warning: expect.stringContaining('Needs review'),
      });
      for (const output of [regionToMarkdown(stored), regionToText(stored)]) {
        expect(output).toContain('The orders fought; their rivalry persists.');
        expect(output).toContain('Explains: Renamed Order');
        expect(output).toContain('Needs review');
      }
      expect(setRegionPlaceText(stored, 'organizations', 0, 'name', 'Renamed Order')).toBe(stored);
      expect(
        setRegionHistoryEventText(
          stored,
          war.id,
          'description',
          'The orders fought; their rivalry persists.',
        ),
      ).toBe(stored);
    } finally {
      expect(draw).not.toHaveBeenCalled();
      draw.mockRestore();
    }
    expect(stored).toEqual(before);
  });

  it('protects authored consumers and preserves independent accounts after source removal and reopening', () => {
    const scenario = HISTORY_ACCEPTANCE_SCENARIOS[2],
      snapshot = scenario.build();
    snapshot.history = generateRegionHistory(snapshot, new RNG(scenario.seed));
    const war = snapshot.history.events.find((e) => e.outcome.kind === 'war')!;
    const authored = setRegionHistoryEventText(snapshot, war.id, 'description', '');
    expect(removeRegionPlace(authored, 'organizations', 0)).toBe(authored);
    expect(
      regionHistoryReading(reopen(authored)).entries.find((e) => e.eventId === war.id)?.body,
    ).toBe('');
    const removed = reopen(removeRegionPlace(snapshot, 'organizations', 0));
    expect(getCurrentHistoryEvents(removed).some((e) => e.outcome.kind === 'war')).toBe(false);
    expect(
      getCurrentHistoryEvents(removed).some(
        (e) => e.outcome.kind === 'founding' && e.outcome.founded.kind === 'settlement',
      ),
    ).toBe(true);
    expect(regionToMarkdown(removed)).not.toContain(war.description);
    expect(regionToText(removed)).not.toContain(war.description);
  });
});

describe('all supported pre-history migration entry points', () => {
  it.each(Array.from({ length: 24 }, (_, index) => index + 1))(
    'payload %i stays unrecorded and preserves prose, blanks and identities',
    (version) => {
      const snapshot = structuredClone(historyPresentBase);
      delete snapshot.gazetteer;
      delete snapshot.overviewReason;
      for (const entry of snapshot.settlements) delete entry.descriptionReason;
      snapshot.name = 'Saved region';
      snapshot.description = '';
      snapshot.settlements[0].snapshot.description = 'Saved settlement prose.';
      // Minimal valid old payloads isolate history adoption from unrelated newer fact migrations.
      const factsVersion =
        version <= 8
          ? Math.max(1, version - 2)
          : version <= 11
            ? 6
            : version === 12
              ? 7
              : version === 13
                ? 8
                : version === 14
                  ? 9
                  : version === 15
                    ? 10
                    : version === 16
                      ? 11
                      : 12;
      const old: Record<string, unknown> = {
        ...snapshot,
        facts: { ...emptyRegionFacts('current'), version: factsVersion },
      };
      delete old.history;
      delete old.realmIds;
      if (version <= 2) old.settlements = snapshot.settlements.map((s) => s.snapshot);
      const before = structuredClone(old);
      const result = migrateRegionSnapshot(old, version);
      expect(result.ok, result.ok ? '' : result.message).toBe(true);
      if (!result.ok) return;
      expect(result.value.history).toEqual({
        version: 1,
        state: 'unrecorded',
        actors: [],
        events: [],
      });
      expect(result.value.name).toBe('Saved region');
      expect(result.value.description).toBe('');
      expect(result.value.settlements[0].snapshot.description).toBe('Saved settlement prose.');
      expect(regionToDocument(result.value).sections.some((s) => s.heading === 'History')).toBe(
        false,
      );
      expect(reopen(result.value).history).toEqual(result.value.history);
      expect(old).toEqual(before);
    },
  );
});
