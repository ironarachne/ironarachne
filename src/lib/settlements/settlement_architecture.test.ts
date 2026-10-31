import { describe, expect, it } from 'vitest';
import { architectureResourcesFromCatalog, legacyArchitectureState } from '$lib/architecture';
import { getBuildingMaterialResources } from '$lib/resources';
import { rollSettlement, readSettlementGeneratorConfig } from './settlement_roll';
import { regenerateSettlementArchitecture } from './settlement_architecture';
import { toSettlementSnapshot } from './settlement_snapshot';
import { settlementFromSnapshot } from './settlement_rehydrate';
import { migrateSettlementSnapshot, validateSettlementSnapshot } from './settlement_artifact_kind';
import { settlementToMarkdown } from './settlement_presentation';
const resources = architectureResourcesFromCatalog(getBuildingMaterialResources());
describe('settlement architectural ownership', () => {
  it('adds saved architecture without moving existing generation draws', () => {
    const plain = rollSettlement('architecture-town').settlement;
    const config = {
      architecture: {
        resources,
        site: {
          substrate: 'rocky' as const,
          relief: 'flat' as const,
          coastal: false,
          floodProne: false,
        },
        culturalPreferences: [{ id: 'pattern', motif: 'geometric' as const, weight: 1 }],
      },
    };
    const drawn = rollSettlement('architecture-town', config).settlement;
    expect(drawn.architecture.kind).toBe('generated');
    expect(drawn.architecture.examples).toHaveLength(12);
    expect({ ...drawn, architecture: plain.architecture }).toEqual(plain);
    expect(readSettlementGeneratorConfig(config).architecture).toEqual(config.architecture);
    const stored = toSettlementSnapshot(drawn);
    expect(validateSettlementSnapshot(stored).ok).toBe(true);
    expect(
      toSettlementSnapshot(settlementFromSnapshot(JSON.parse(JSON.stringify(stored)))),
    ).toEqual(stored);
    expect(settlementToMarkdown(drawn)).toContain(drawn.architecture.summary!);
  });
  it('preserves authored text and migrates old saves without inferring a new style', () => {
    const settlement = rollSettlement('architecture-town', {
      architecture: { resources },
    }).settlement;
    settlement.description = 'My authored overview.';
    settlement.architecture.summary = 'My architectural notes.';
    const regenerated = regenerateSettlementArchitecture(settlement, {
      seed: 'other-style',
      resources,
    });
    expect(regenerated.description).toBe(settlement.description);
    expect(regenerated.architecture.summary).toBe('My architectural notes.');
    expect(
      regenerateSettlementArchitecture(settlement, { seed: 'new', resources }, true).architecture
        .summary,
    ).not.toBe('My architectural notes.');
    const current = toSettlementSnapshot(settlement);
    const { architecture: _architecture, ...old } = current;
    const migrated = migrateSettlementSnapshot(old, 4);
    expect(migrated).toEqual({
      ok: true,
      value: { ...current, architecture: legacyArchitectureState() },
    });
    expect(
      validateSettlementSnapshot({ ...current, architecture: { kind: 'generated', style: null } })
        .ok,
    ).toBe(false);
  });
});
