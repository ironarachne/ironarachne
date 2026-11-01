import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { historyEditingFixture } from '../../../test_fixtures/region_history_editing';
import {
  regionHistoryReading,
  historySourceEntries,
  historySourceAnchor,
  historyRemovalMessage,
  HISTORY_REVIEW_NOTICE,
  HISTORY_EVENT_REVIEW_NOTICE,
} from './region_history_presentation';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionEditorialDocument } from './region_editorial_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { rollRegion } from './region_roll';
import { toRegionSnapshot } from './region_snapshot';
import { setRealmText } from './region_editing';
import { setRegionHistoryEventText } from './region_history_editing';

describe('shared saved history presentation', () => {
  it('adds history after identity and before geography without changing a real generated plan', () => {
    const snapshot = toRegionSnapshot(
      rollRegion('5wyedz5q272fz', { affiliation: 'affiliated' }).region,
    );
    const plan = structuredClone(snapshot.gazetteer);
    const document = regionToDocument(snapshot);
    const headings = document.sections.map((section) => section.heading);
    expect(headings.indexOf('History')).toBeGreaterThan(headings.indexOf('Regional identity'));
    expect(headings.indexOf('History')).toBeLessThan(headings.indexOf('Landscape'));
    expect(
      document.sections.find((s) => s.heading === 'History')?.history?.entries.length,
    ).toBeLessThanOrEqual(6);
    expect(snapshot.gazetteer).toEqual(plan);
    const without = regionToDocument({
      ...snapshot,
      history: { version: 2, state: 'unrecorded', actors: [], events: [] },
    });
    expect(document.sections.filter((s) => s.heading !== 'History')).toEqual(without.sections);
    expect(document.paragraphs).toEqual(without.paragraphs);
  });

  it('puts the same saved words, dates and live explanations in every reading/export path', () => {
    const snapshot = historyEditingFixture();
    snapshot.history.events[0].time.yearsBeforePresent = 120;
    const before = structuredClone(snapshot);
    const draw = vi.spyOn(RNG.prototype, 'int');
    try {
      const document = regionToDocument(snapshot);
      const history = document.sections.find((s) => s.heading === 'History')!;
      expect(document.sections.indexOf(history)).toBeLessThan(
        document.sections.findIndex((s) => s.heading === 'Settlements'),
      );
      expect(
        regionToUiDocument(snapshot)
          .sections.find((s) => s.heading === 'History')
          ?.entries.map((e) => e.body),
      ).toEqual(snapshot.history.events.map((e) => e.description));
      expect(history.history?.entries[0].heading).toContain('120 years before the present');
      expect(history.history?.entries[1].heading).toContain('Event 2');
      const markdown = regionToMarkdown(snapshot),
        text = regionToText(snapshot);
      for (const event of snapshot.history.events) {
        expect(markdown).toContain(event.description);
        expect(text).toContain(event.description);
      }
      expect(markdown).toContain('Explains: Fixture Town');
      expect(text).toContain('Explains: Order A');
    } finally {
      expect(draw).not.toHaveBeenCalled();
      draw.mockRestore();
    }
    expect(snapshot).toEqual(before);
  });

  it('inserts history into the editorial document without consuming the saved gazetteer plan', () => {
    const snapshot = historyEditingFixture();
    snapshot.gazetteer = {
      version: 6,
      blocks: [],
      landscapePlaces: [],
      notableReadings: [],
      roadReadings: [],
      settlementReadings: [],
      organizationReadings: [],
    };
    const plan = structuredClone(snapshot.gazetteer);
    // Empty editorial plans still use exactly the same history adapter.
    const document = regionEditorialDocument(snapshot);
    expect(document.sections.find((s) => s.heading === 'History')?.history).toEqual(
      regionHistoryReading(snapshot),
    );
    expect(snapshot.gazetteer).toEqual(plan);
  });

  it('hides unrecorded or empty histories', () => {
    const snapshot = historyEditingFixture();
    snapshot.history = { version: 1, state: 'unrecorded', actors: [], events: [] };
    expect(regionToDocument(snapshot).sections.some((s) => s.heading === 'History')).toBe(false);
    snapshot.history.state = 'generated';
    expect(regionHistoryReading(snapshot)).toEqual({ entries: [] });
  });

  it('omits stale generated sentences, keeps a stale-only notice, and preserves authored blanks', () => {
    const snapshot = historyEditingFixture();
    for (const event of snapshot.history.events) event.evidence.reason.status = 'stale';
    expect(regionHistoryReading(snapshot)).toEqual({ notice: HISTORY_REVIEW_NOTICE, entries: [] });
    expect(regionToMarkdown(snapshot)).toContain(`## History\n\n${HISTORY_REVIEW_NOTICE}`);
    for (const event of snapshot.history.events)
      expect(regionToText(snapshot)).not.toContain(event.description);
    const authored = setRegionHistoryEventText(
      snapshot,
      snapshot.history.events[0].id,
      'description',
      '',
    );
    const entry = regionHistoryReading(authored).entries[0];
    expect(entry.body).toBe('');
    expect(entry.warning).toBe(HISTORY_EVENT_REVIEW_NOTICE);
    expect(
      regionToUiDocument(authored).sections.find((s) => s.heading === 'History')?.entries,
    ).toHaveLength(2);
  });

  it('uses live identity labels without rewriting authored prose or treating old witnesses as proof', () => {
    let snapshot = historyEditingFixture();
    snapshot = setRegionHistoryEventText(
      snapshot,
      'event:local-founding',
      'description',
      'The Local Realm was founded.',
    );
    snapshot = setRealmText(snapshot, 0, 'name', 'New Realm');
    const entry = regionHistoryReading(snapshot).entries.find(
      (e) => e.eventId === 'event:local-founding',
    )!;
    expect(entry.body).toBe('The Local Realm was founded.');
    expect(entry.warning).toBeDefined();
    expect(entry.references[0].label).toBe('Explains: New Realm');
    expect(
      historySourceEntries(snapshot).find(
        (source) => source.anchorId === entry.references[0].anchorId,
      )?.label,
    ).toBe('New Realm');
    snapshot.history.version = 1;
    snapshot.history.events[0].evidence.observations =
      snapshot.history.events[0].evidence.observations.filter((o) => o.kind !== 'historicalActor');
    expect(
      regionHistoryReading(snapshot).entries.some((e) => e.eventId === 'event:old-founding'),
    ).toBe(false);
  });

  it('never replenishes a saved six-event allowance when a generated event becomes stale', () => {
    const snapshot = historyEditingFixture();
    snapshot.history.events.push({
      ...structuredClone(snapshot.history.events[4]),
      id: 'seventh',
      time: { order: 6 },
    });
    snapshot.history.events[0].evidence.reason.status = 'stale';
    expect(regionHistoryReading(snapshot).entries.map((e) => e.eventId)).not.toContain('seventh');
    expect(regionHistoryReading(snapshot).entries).toHaveLength(4);
  });

  it('resolves unique source anchors and explains removal and authored protection with names', () => {
    const snapshot = historyEditingFixture();
    const sources = historySourceEntries(snapshot);
    expect(new Set(sources.map((s) => s.anchorId)).size).toBe(sources.length);
    expect(sources.every((s) => s.record !== undefined)).toBe(true);
    expect(historySourceAnchor({ kind: 'realm', realmId: 'a:b / c' })).toBe(
      'history-source-realm-a%3Ab%20%2F%20c',
    );
    expect(
      historyRemovalMessage(snapshot, {
        eventIds: ['event:old-founding'],
        actorIds: ['actor:old'],
        staleEventIds: ['event:fall'],
        protectedEventIds: ['event:war'],
        protectedActorIds: ['actor:old'],
      }),
    ).toMatch(
      /events to remove: event:old-founding.*actors to remove: the Old Realm.*needing review afterward: event:fall.*prevents removal: event:war.*prevent removal: the Old Realm/,
    );
  });
});
