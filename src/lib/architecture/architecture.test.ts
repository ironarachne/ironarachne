import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getBuildingMaterialResources } from '$lib/resources';
import { composeNarrative } from '$lib/narrative';
import { generateArchitecturalStyle } from './architecture_generation';
import { instantiateArchitecture } from './architecture_instances';
import { architectureNarrativeSubject } from './architecture_narrative';
import { architectureResourcesFromCatalog } from './architecture_materials';
import { architectureOperationSeed } from './architecture_policy';
import { generateArchitectureState, legacyArchitectureState } from './architecture_state';
import {
  validateArchitecturalStyle,
  validateArchitecturalInstance,
  validateArchitectureState,
} from './architecture_validation';
import type { ArchitectureSubject, GenerateArchitecturalStyleConfig } from './architecture_types';
const palette = getBuildingMaterialResources();
function config(): GenerateArchitecturalStyleConfig {
  const resources = architectureResourcesFromCatalog(palette);
  const timber = palette.find((r) => r.name === 'oak timber')!;
  resources.entries.push({
    id: 'boards',
    resource: { ...timber, name: 'oak boards' },
    form: 'board',
    availability: 'available',
    origin: 'local',
    evidenceIds: [],
  });
  return {
    seed: 'test',
    biome: {
      name: 'forest',
      temperature: 15,
      humidity: 0.5,
      altitude: 0.3,
      isAquatic: false,
      features: [],
      descriptions: [],
    },
    resources,
    site: { substrate: null, relief: null, coastal: null, floodProne: null },
    contexts: [
      {
        id: 'village',
        construction: 'built',
        exposure: 'exposed',
        purpose: 'residential',
        density: 'low',
        exteriorWindowsAllowed: true,
      },
    ],
    culturalPreferences: [],
  };
}
function style(c = config()) {
  const result = generateArchitecturalStyle(c);
  expect(result.status).not.toBe('invalid');
  if (!result.style) throw new Error(JSON.stringify(result));
  return result.style;
}
function subject(profileId = 'village'): ArchitectureSubject {
  return {
    id: 'room',
    profileId,
    currentPurpose: 'storage',
    shape: 'free',
    widthDepthRatio: null,
    condition: 'unspecified',
    placedFeatureIds: [],
    connections: [
      { id: 'door', kind: 'door' },
      { id: 'hall', kind: 'passage' },
    ],
  };
}
function native(c: GenerateArchitecturalStyleConfig) {
  if (c.resources.knowledge !== 'known') throw new Error('known palette required');
  c.resources.entries.push({
    id: 'host',
    resource: { ...palette.find((r) => r.name === 'sandstone block')!, name: 'host sandstone' },
    form: 'native_rock',
    availability: 'available',
    origin: 'native',
    evidenceIds: ['geology'],
  });
}

describe('shared architectural generation', () => {
  it('is canonical under reordered resources and contexts and survives JSON storage', () => {
    const c = config();
    c.contexts.push({
      ...c.contexts[0],
      id: 'crypt',
      exposure: 'buried',
      purpose: 'funerary',
      exteriorWindowsAllowed: false,
      density: null,
    });
    const a = style(c);
    c.resources.entries.reverse();
    c.contexts.reverse();
    expect(style(c)).toEqual(a);
    expect(validateArchitecturalStyle(JSON.parse(JSON.stringify(a)))).toEqual({ ok: true });
    expect(
      new Set(
        Array.from({ length: 12 }, (_, i) =>
          JSON.stringify(style({ ...c, seed: String(i) }).profiles),
        ),
      ).size,
    ).toBeGreaterThan(1);
  });
  it('never substitutes unavailable coverings or panes and distinguishes empty from unknown', () => {
    const c = config();
    c.resources = architectureResourcesFromCatalog(
      palette.filter((r) => r.name === 'granite ashlar'),
    );
    expect(generateArchitecturalStyle(c).status).toBe('unavailable');
    c.resources = { knowledge: 'known', entries: [] };
    expect(generateArchitecturalStyle(c).status).toBe('unavailable');
    c.resources = { knowledge: 'unknown', entries: [] };
    expect(generateArchitecturalStyle(c)).toMatchObject({
      status: 'partial',
      style: { profiles: [] },
      diagnostics: [{ code: 'unknown_resources' }],
    });
    c.biome.isAquatic = true;
    expect(generateArchitecturalStyle(c)).toMatchObject({
      status: 'unavailable',
      diagnostics: [{ code: 'unsupported_context' }],
    });
  });
  it('handles natural, carved, and mixed contexts without exterior leakage', () => {
    const c = config();
    native(c);
    c.contexts = [
      {
        id: 'cave',
        construction: 'natural',
        exposure: 'buried',
        purpose: 'natural',
        density: null,
        exteriorWindowsAllowed: false,
      },
      {
        id: 'cut',
        construction: 'rock_cut',
        exposure: 'buried',
        purpose: 'scholarly',
        density: null,
        exteriorWindowsAllowed: false,
      },
      { ...c.contexts[0], id: 'surface' },
    ];
    const a = style(c);
    expect(a.profiles).toHaveLength(3);
    for (const p of a.profiles.filter((p) => p.context.exposure === 'buried'))
      for (const v of p.variants) {
        expect(v.roof).toBeNull();
        expect(v.windows).toBeNull();
        expect(v.massing).toBeNull();
      }
    c.resources = { knowledge: 'known', entries: [] };
    const result = generateArchitecturalStyle(c);
    expect(result.status).toBe('partial');
    expect(result.style?.profiles.map((p) => p.id)).toEqual(['cave']);
  });
  it('makes environment preferences evidence based, while retaining resource constraints', () => {
    const c = config();
    c.biome.temperature = 35;
    c.biome.humidity = 0.8;
    c.site.floodProne = true;
    c.site.relief = 'mountainous';
    c.climate = {
      name: 'wet',
      description: '',
      temperature: 35,
      temperatureMin: 20,
      temperatureMax: 40,
      cloudCover: 0.7,
      wind: [0, 0, 0],
      precipitationAmount: 0.9,
      precipitationFrequency: 0.8,
      humidity: 0.8,
      seasons: [],
    };
    const a = style(c);
    expect(
      a.profiles[0].variants.every(
        (v) =>
          v.features.some((f) => f.kind === 'deep_reveal') &&
          v.features.some((f) => f.kind === 'raised_plinth'),
      ),
    ).toBe(true);
    expect(
      a.profiles[0].variants.every((v) => v.roof?.form === 'flat' || v.roof?.eaves === 'deep'),
    ).toBe(true);
    c.contexts[0] = { ...c.contexts[0], exposure: 'buried', exteriorWindowsAllowed: false };
    expect(style(c).profiles[0].variants.every((v) => v.features.length === 0)).toBe(true);
  });
  it('weights only supported cultural motifs and keeps selected identity stable across variants', () => {
    const c = config();
    c.culturalPreferences = [{ id: 'carvers', motif: 'interlace', weight: 2 }];
    c.contexts[0].density = 'high';
    const a = style(c);
    expect(a.profiles[0].motif).toBe('interlace');
    expect(a.profiles[0].variants.every((v) => v.proportions.storeys?.min === 2)).toBe(true);
    c.culturalPreferences[0].weight = 0;
    expect(style(c).profiles[0].motif).toBe('none');
  });
  it('rejects malformed input instead of guessing or throwing', () => {
    const cases: unknown[] = [
      null,
      {},
      { ...config(), contexts: [] },
      { ...config(), biome: { ...config().biome, humidity: 2 } },
      { ...config(), site: {} },
      { ...config(), climate: {} },
      { ...config(), resources: { knowledge: 'unknown', entries: config().resources.entries } },
      { ...config(), culturalPreferences: [{ id: 'bad', motif: 'none', weight: 3 }] },
    ];
    for (const value of cases)
      expect(generateArchitecturalStyle(value as GenerateArchitecturalStyleConfig).status).toBe(
        'invalid',
      );
    const c = config();
    if (c.resources.knowledge !== 'known') throw new Error('palette');
    c.resources.entries.push(c.resources.entries[0]);
    expect(generateArchitecturalStyle(c).status).toBe('invalid');
    c.resources.entries.pop();
    c.contexts.push(c.contexts[0]);
    expect(generateArchitecturalStyle(c).status).toBe('invalid');
    c.contexts.pop();
    c.contexts[0].exposure = 'buried';
    expect(generateArchitecturalStyle(c).status).toBe('invalid');
  });
  it('treats unsupported forms, limited inputs, and unavailable resources explicitly', () => {
    const c = config();
    c.resources.entries.forEach((e) => (e.availability = 'limited'));
    const a = style(c);
    expect(a.materials.every((m) => m.availability === 'limited')).toBe(true);
    c.resources.entries.forEach((e) => (e.form = 'unknown'));
    expect(generateArchitecturalStyle(c)).toMatchObject({ status: 'unavailable' });
    c.resources.entries.forEach((e) => (e.availability = 'not-observed'));
    expect(generateArchitecturalStyle(c).status).toBe('unavailable');
  });
});
describe('architectural instances and saved states', () => {
  it('samples stable instances and respects actual connections and geometry', () => {
    const a = style();
    const s = subject();
    const result = instantiateArchitecture(a, s, 'room-seed');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      instantiateArchitecture(a, { ...s, connections: [...s.connections].reverse() }, 'room-seed'),
    ).toEqual(result);
    expect(
      result.value.connections.find((c) => c.connectionId === 'hall')?.leafMaterialId,
    ).toBeNull();
    expect(validateArchitecturalInstance(result.value, a, s).ok).toBe(true);
    expect(
      validateArchitecturalInstance(
        {
          ...result.value,
          connections: [
            ...result.value.connections,
            { ...result.value.connections[0], connectionId: 'invented' },
          ],
        },
        a,
        s,
      ).ok,
    ).toBe(false);
    expect(instantiateArchitecture(a, { ...s, widthDepthRatio: 100 }, 'room-seed').ok).toBe(false);
    expect(instantiateArchitecture(a, { ...s, profileId: 'missing' }, 'room-seed').ok).toBe(false);
    expect(
      instantiateArchitecture(
        a,
        { ...s, connections: [s.connections[0], s.connections[0]] },
        'room-seed',
      ).ok,
    ).toBe(false);
    expect(
      instantiateArchitecture(a, { ...s, placedFeatureIds: ['invented'] }, 'room-seed').ok,
    ).toBe(false);
  });
  it('preserves buried room dimensions without forcing a preferred footprint', () => {
    const c = config();
    c.contexts[0] = { ...c.contexts[0], exposure: 'buried', exteriorWindowsAllowed: false };
    const a = style(c);
    const s = { ...subject(), shape: 'irregular' as const, widthDepthRatio: 3 };
    const result = instantiateArchitecture(a, s, 'room');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.widthDepthRatio).toBe(3);
    expect(result.value.storeys).toBeNull();
  });
  it('stores bounded examples and final prose without render-time generation', () => {
    const c = config();
    const state = generateArchitectureState(c, 12);
    expect(state.examples).toHaveLength(12);
    expect(state.summary).toBeTruthy();
    expect(validateArchitectureState(JSON.parse(JSON.stringify(state)))).toEqual({ ok: true });
    expect(generateArchitectureState(c, 12)).toEqual(state);
    expect(validateArchitectureState(legacyArchitectureState()).ok).toBe(true);
    expect(() => generateArchitectureState(c, 13)).toThrow();
    expect(() => generateArchitectureState({ ...c, contexts: [] })).toThrow();
    expect(
      validateArchitectureState({ ...legacyArchitectureState(), summary: 'invented' }).ok,
    ).toBe(false);
    expect(architectureOperationSeed('a:b', 'c', 'd')).not.toBe(
      architectureOperationSeed('a', 'b:c', 'd'),
    );
  });
  it('rejects corrupt schemas, materials, features, and references at the saved boundary', () => {
    const a = style();
    const mutations: ((a: ReturnType<typeof style>) => void)[] = [
      (s) => {
        s.schemaVersion = 2 as 1;
      },
      (s) => {
        s.materials[0].roles = [];
      },
      (s) => {
        s.profiles[0].primaryMaterialId = 'missing';
      },
      (s) => {
        s.profiles[0].variants[0].roof!.coveringMaterialId = 'missing';
      },
      (s) => {
        s.profiles[0].variants[0].windows!.fill = 'glazed';
      },
      (s) => {
        s.profiles[0].variants[0].surfaces[0].finish = 'painted';
      },
      (s) => {
        s.profiles[0].variants[0].features.push({
          id: 'x',
          kind: 'balcony',
          materialId: 'missing',
          evidenceIds: [],
        });
      },
      (s) => {
        s.profiles[0].context.exposure = 'buried';
      },
      (s) => {
        s.profiles[0].variants[0].proportions.storeys!.max = 10;
      },
      (s) => {
        s.profiles[0].variants = [];
      },
      (s) => {
        s.materials.push(s.materials[0]);
      },
      (s) => {
        s.profiles[0].variants[0].supports = 'rock_pillars';
      },
    ];
    for (const mutate of mutations) {
      const copy = structuredClone(a);
      mutate(copy);
      expect(validateArchitecturalStyle(copy).ok).toBe(false);
    }
    for (const value of [
      null,
      {},
      { schemaVersion: 1 },
      { ...a, origin: { ...a.origin, humidity: NaN } },
    ])
      expect(validateArchitecturalStyle(value).ok).toBe(false);
  });
  it('builds concise factual narrative subjects for interiors and explicit condition', () => {
    const c = config();
    native(c);
    c.contexts = [
      {
        id: 'cut',
        construction: 'rock_cut',
        exposure: 'buried',
        purpose: 'funerary',
        density: null,
        exteriorWindowsAllowed: false,
      },
    ];
    const a = style(c);
    const result = instantiateArchitecture(a, { ...subject('cut'), condition: 'worn' }, 'room');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const n = architectureNarrativeSubject(a, result.value, 'room');
    const prose = composeNarrative(
      n,
      { maxSentences: 2, maxPerTopic: 2, repetitionWindow: 0 },
      { recentSelections: [] },
      new RNG('text'),
    ).text;
    expect(prose).not.toMatch(/roof|window|pillar/i);
    expect(prose).toMatch(/carved|vault|wear/i);
    expect(
      architectureNarrativeSubject(a, { ...result.value, variantId: 'missing' }, 'room').candidates,
    ).toEqual([]);
    expect(
      architectureNarrativeSubject(
        a,
        { ...result.value, condition: 'ruined' },
        'room',
      ).candidates.some((c) => c.id.endsWith(':ruined')),
    ).toBe(true);
    const cave = config();
    cave.contexts = [
      {
        id: 'cave',
        construction: 'natural',
        exposure: 'buried',
        purpose: 'natural',
        density: null,
        exteriorWindowsAllowed: false,
      },
    ];
    expect(architectureNarrativeSubject(style(cave), null, 'cave').candidates[0].id).toContain(
      'natural',
    );
  });
});

describe('resource semantics and provenance boundaries', () => {
  it('retains every consumer option on replay, rejecting malformed choices', async () => {
    const { readArchitectureOptions } = await import('./architecture_options');
    const c = config();
    const options = {
      resources: c.resources,
      site: c.site,
      culturalPreferences: [{ id: 'motif', motif: 'floral', weight: 1 }],
      contexts: c.contexts,
      roomProfiles: { room: 'village' },
    };
    expect(readArchitectureOptions(options)).toEqual(options);
    for (const value of [
      null,
      {},
      { ...options, resources: { knowledge: 'known', entries: [{}] } },
      { ...options, site: {} },
      { ...options, culturalPreferences: [{ id: 'x', motif: 'floral', weight: 9 }] },
      { ...options, contexts: [] },
      { ...options, contexts: [c.contexts[0], c.contexts[0]] },
      { ...options, roomProfiles: { room: 3 } },
    ])
      expect(readArchitectureOptions(value)).toBeUndefined();
  });
  it('keeps material families explicit, including glazing and processed metal', () => {
    const c = config();
    if (c.resources.knowledge !== 'known') throw new Error('palette');
    for (const [family, form] of [
      ['glass', 'pane'],
      ['metal', 'sheet'],
      ['metal', 'bar'],
      ['fabric', 'woven'],
      ['ceramic', 'tile'],
      ['stone', 'slab'],
      ['earth', 'compacted_earth'],
      ['mineral', 'plaster'],
    ] as const) {
      c.resources.entries.push({
        id: `custom:${family}:${form}`,
        resource: {
          name: `custom ${family}`,
          description: '',
          major_type: family,
          minor_type: 'processed',
          is_refineable: false,
          commonality: 1,
          properties: [],
        },
        form,
        availability: 'available',
        origin: 'imported',
        evidenceIds: ['explicit-caller-selection'],
      });
    }
    c.culturalPreferences = [{ id: 'floral', motif: 'floral', weight: 1 }];
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const a = style({ ...c, seed: `mixed-${i}` });
      expect(validateArchitecturalStyle(a).ok).toBe(true);
      for (const m of a.materials) seen.add(m.family);
    }
    expect(seen.has('glass')).toBe(true);
    expect(seen.has('metal')).toBe(true);
    const a = style(c);
    const copy = structuredClone(c);
    copy.biome.descriptions = ['Unrelated wording'];
    copy.biome.features = ['unrelated feature'];
    if (copy.resources.knowledge === 'known')
      copy.resources.entries.forEach((e) => {
        e.resource.name += ' renamed';
        e.resource.description = 'new wording';
      });
    expect(style(copy).origin.inputFingerprint).toBe(a.origin.inputFingerprint);
  });
});

it('keeps the same physical door material across opposite rooms', () => {
  const c = config();
  if (c.resources.knowledge !== 'known') throw new Error('palette');
  c.resources.entries.push({
    id: 'metal-leaf',
    resource: {
      name: 'metal sheet',
      description: '',
      major_type: 'metal',
      minor_type: 'processed',
      is_refineable: false,
      commonality: 1,
      properties: [],
    },
    form: 'sheet',
    availability: 'available',
    origin: 'imported',
    evidenceIds: [],
  });
  const a = style(c);
  const first = instantiateArchitecture(a, subject(), 'complex');
  const second = instantiateArchitecture(a, { ...subject(), id: 'opposite-room' }, 'complex');
  expect(first.ok && second.ok).toBe(true);
  if (!first.ok || !second.ok) return;
  expect(first.value.connections).toEqual(second.value.connections);
});

it('keeps singular and plural narrative subjects in agreement', () => {
  const a = style();
  const instance = instantiateArchitecture(a, subject(), 'grammar');
  expect(instance.ok).toBe(true);
  if (!instance.ok) return;
  for (const item of [null, instance.value]) {
    const options = architectureNarrativeSubject(a, item, 'grammar')
      .candidates.flatMap((c) => c.templates.flatMap((t) => t.parts.flatMap((p) => p.options)))
      .join(' ');
    expect(options).not.toMatch(/This (space|complex) have/);
    expect(options).not.toContain('Local buildings has');
  }
});
