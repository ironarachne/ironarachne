import { emptyRegionHistory } from './region_realm_identity';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { rollOrganizationSnapshot, organizationToMarkdown } from '$lib/organizations';
import { rollRegionSnapshot } from './region_roll';
import { regionToMarkdown, regionToText, regionToDocument } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot';
import { composeRegionGazetteer, generateRegionGazetteer } from './region_editorial';
import { regionGazetteerError } from './region_editorial_validation';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { setRegionPlaceText, removeRegionPlace } from './region_editing';
import {
  emptyOrganizationReadings,
  organizationReadingCandidates,
} from './region_organization_reading';
import {
  organizationProfileObservation,
  organizationObservationCurrent,
} from './region_organization_evidence';
import {
  organizationObservationError,
  organizationReadingsError,
} from './region_organization_validation';
import { editorialSentenceChecker } from './region_editorial_evidence';

const base = rollRegionSnapshot('5wyedz5q272fz');
function isolated(count = 1) {
  const snapshot = structuredClone(base);
  snapshot.organizations = Array.from({ length: count }, (_, index) => ({
    ...rollOrganizationSnapshot('450-group', { kindId: 'holy_order', genre: 'fantasy' }),
    id: `organization:${index}`,
    name: `Sisters ${index}`,
  }));
  const result = composeRegionGazetteer(
    organizationReadingCandidates(snapshot),
    new RNG('450'),
    undefined,
    [],
    [],
    [],
    [],
    [],
    emptyOrganizationReadings(snapshot),
  );
  snapshot.settlements = [];
  snapshot.gazetteer = result.gazetteer;
  return snapshot;
}
const sentences = (snapshot: RegionSnapshot) =>
  snapshot.gazetteer!.blocks.flatMap((block) => block.sentences);

describe('saved regional organization reading', () => {
  it('adds a complete contact directory and bounded prose to the current default seed', () => {
    expect(base.gazetteer?.version).toBe(6);
    expect(validateRegionSnapshot(base).ok).toBe(true);
    const section = regionToDocument(base).sections.find(
      (section) => section.heading === 'Organizations',
    )!;
    expect(section.lines).toHaveLength(base.organizations.length);
    for (const organization of base.organizations) {
      expect(regionToMarkdown(base)).toContain(organization.name);
      expect(regionToMarkdown(base)).toContain(organization.leader.lastName);
    }
    expect(sentences(base).length).toBeLessThanOrEqual(24);
    expect(base).toEqual(rollRegionSnapshot('5wyedz5q272fz'));
  });

  it('uses stored purpose/tension, stable anchors and the same summary in UI and exports without RNG', () => {
    const snapshot = isolated();
    expect(regionGazetteerError(snapshot.gazetteer, snapshot)).toBeNull();
    const before = structuredClone(snapshot);
    const spy = vi.spyOn(RNG.prototype, 'item').mockImplementation(() => {
      throw new Error('Reading consumed RNG');
    });
    try {
      const markdown = regionToMarkdown(snapshot);
      const text = regionToText(snapshot);
      const entry = regionToUiDocument(snapshot).sections.find(
        (section) => section.heading === 'Organizations',
      )!.entries[0];
      expect(entry.anchorId).toBe('organization-organization%3A0');
      expect(entry.summary).toContain(snapshot.organizations[0].leader.lastName);
      for (const sentence of sentences(snapshot)) {
        expect(markdown).toContain(sentence.text);
        expect(text).toContain(sentence.text);
        expect(entry.body).toContain(sentence.text);
      }
      expect(markdown).not.toMatch(
        /Their most telling liability|Public standing:|crown shade|slow in winter/,
      );
      expect(snapshot).toEqual(before);
    } finally {
      spy.mockRestore();
    }
  });

  it('keeps every group visible in a dense region, shares the cap and favors first sentences', () => {
    const snapshot = isolated(30);
    expect(sentences(snapshot)).toHaveLength(24);
    expect(
      new Set(snapshot.gazetteer!.blocks.map((block) => block.destination.organizationId)).size,
    ).toBe(24);
    const section = regionToDocument(snapshot).sections.find(
      (section) => section.heading === 'Organizations',
    )!;
    expect(section.lines).toHaveLength(30);
    expect(section.entrySummaries!.every((summary) => summary.includes('Leader:'))).toBe(true);
    const empty = isolated(0);
    expect(
      regionToDocument(empty).sections.some((section) => section.heading === 'Organizations'),
    ).toBe(false);
    expect(regionGazetteerError(empty.gazetteer, empty)).toBeNull();
  });

  it('suppresses stale prose and updates leader details without changing supported meanings', () => {
    const snapshot = isolated();
    const sentence = sentences(snapshot)[0];
    const observation = organizationProfileObservation(snapshot.organizations[0]);
    expect(organizationObservationCurrent(snapshot, observation)).toBe(true);
    snapshot.organizations[0].profile = new Proxy(snapshot.organizations[0].profile, {});
    expect(organizationObservationCurrent(snapshot, observation)).toBe(true);
    snapshot.organizations[0].leader.lastName = 'New Leader';
    expect(editorialSentenceChecker(snapshot)(sentence)).toBe(true);
    expect(regionToText(snapshot)).toContain('New Leader');
    const renamed = setRegionPlaceText(snapshot, 'organizations', 0, 'name', 'Renamed Sisters');
    expect(editorialSentenceChecker(renamed)(sentence)).toBe(false);
    expect(regionToMarkdown(renamed)).not.toContain(sentence.text);
    expect(regionToMarkdown(renamed)).toContain('Renamed Sisters');
    snapshot.organizations[0].profile.goal.label = 'Authored goal';
    expect(editorialSentenceChecker(snapshot)(sentence)).toBe(false);
    snapshot.organizations = [];
    expect(organizationObservationCurrent(snapshot, observation)).toBe(false);
  });

  it('preserves authored prose and blanks and removes only the deleted organization', () => {
    for (const description of ['Author-written words. A second sentence. A third. A fourth.', '']) {
      const snapshot = isolated(2);
      const standalone = organizationToMarkdown(snapshot.organizations[1]);
      const edited = setRegionPlaceText(snapshot, 'organizations', 0, 'description', description);
      expect(edited.gazetteer?.version).toBe(6);
      if (edited.gazetteer?.version !== 6) throw new Error('Missing reading');
      expect(edited.gazetteer.organizationReadings[0]).toMatchObject({
        origin: 'authored',
        sentenceIds: [],
      });
      expect(regionGazetteerError(edited.gazetteer, edited)).toBeNull();
      const entry = regionToUiDocument(edited).sections.find(
        (section) => section.heading === 'Organizations',
      )!.entries[0];
      expect(entry.body).toBe(description);
      expect(organizationToMarkdown(edited.organizations[1])).toBe(standalone);
      const removed = removeRegionPlace(edited, 'organizations', 0);
      expect(regionGazetteerError(removed.gazetteer, removed)).toBeNull();
      expect(regionToMarkdown(removed)).not.toContain('Sisters 0');
      expect(regionToMarkdown(removed)).toContain('Sisters 1');
    }
  });

  it('preserves saved words across loading, extraction, migration and export key sorting', () => {
    const snapshot = isolated();
    // A real generation round trip includes complete settlement/road metadata.
    const restored = toRegionSnapshot(regionFromSnapshot(base, new RNG('restore')));
    expect(restored.gazetteer).toEqual(base.gazetteer);
    expect(regionToMarkdown(restored)).toBe(regionToMarkdown(base));
    const sorted = JSON.parse(
      JSON.stringify(snapshot, (_key, value) =>
        value && typeof value === 'object' && !Array.isArray(value)
          ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1)))
          : value,
      ),
    );
    expect(regionToMarkdown(sorted)).toBe(regionToMarkdown(snapshot));
    const old = structuredClone(base);
    old.history = emptyRegionHistory();
    if (old.gazetteer?.version !== 6) throw new Error('Missing reading');
    const { organizationReadings: _readings, ...gazetteer } = old.gazetteer;
    old.gazetteer = {
      ...gazetteer,
      version: 5,
      blocks: gazetteer.blocks.filter((block) => block.destination.section !== 'organization'),
    };
    expect(migrateRegionSnapshot(old, 23)).toEqual({ ok: true, value: old });
    expect(
      regionToDocument(old).sections.some((section) => section.heading === 'Organizations'),
    ).toBe(false);
    const historical = JSON.parse(
      gunzipSync(
        readFileSync(new URL('../../../test_fixtures/region_445_belvorn.json.gz', import.meta.url)),
      ).toString(),
    );
    const migrated = migrateRegionSnapshot(historical, 14);
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) throw new Error(migrated.message);
    expect(migrated.value.organizations).toEqual(historical.organizations);
    expect(regionToMarkdown(migrated.value)).toContain('Sisters of the Crimson Martyrs marches');
    expect(migrated.value.organizations[0].leader.name).toContain('Wolfraec');
  });

  it('leaves a supplied gazetteer alone during generation', () => {
    const region = regionFromSnapshot(base, new RNG('450'));
    const saved = structuredClone(region.gazetteer);
    generateRegionGazetteer(region, new RNG('another seed'));
    expect(region.gazetteer).toEqual(saved);
  });

  it('rejects malformed metadata, unsupported sentences and foreign ownership', () => {
    const original = isolated();
    const mutations: ((snapshot: RegionSnapshot) => void)[] = [
      (snapshot) => {
        if (snapshot.gazetteer?.version === 6) snapshot.gazetteer.organizationReadings = [];
      },
      (snapshot) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.organizationReadings.push(
            structuredClone(snapshot.gazetteer.organizationReadings[0]),
          );
      },
      (snapshot) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.organizationReadings[0].organizationId = 'missing';
      },
      (snapshot) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.organizationReadings[0].origin = 'authored';
      },
      (snapshot) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.organizationReadings[0].sentenceIds = ['foreign'];
      },
      (snapshot) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.organizationReadings[0].sentenceIds = [];
      },
      (snapshot) => {
        sentences(snapshot)[0].observations = [];
      },
      (snapshot) => {
        const observation = sentences(snapshot)[0].observations[0];
        if (observation.kind === 'organization-profile')
          observation.observedProfile.goal =
            null as unknown as typeof observation.observedProfile.goal;
      },
      (snapshot) => {
        snapshot.gazetteer!.blocks[0].destination.section = 'hazards';
      },
      (snapshot) => {
        sentences(snapshot)[0].reason.ruleId = '';
      },
      (snapshot) => {
        sentences(snapshot)[0].reason.status = 'invalid' as 'current';
      },
    ];
    for (const mutate of mutations) {
      const snapshot = structuredClone(original);
      mutate(snapshot);
      expect(regionGazetteerError(snapshot.gazetteer, snapshot)).not.toBeNull();
    }
    expect(organizationReadingsError({}, original)).not.toBeNull();
    const observation = organizationProfileObservation(original.organizations[0]);
    expect(organizationObservationError(observation)).toBeNull();
    for (const change of [
      { organizationId: '' },
      { observedName: null },
      { observedKindId: '' },
      { observedProfile: null },
      { observedProfile: { ...observation.observedProfile, environmentNarrative: {} } },
    ])
      expect(organizationObservationError({ ...observation, ...change })).not.toBeNull();
  });
});
