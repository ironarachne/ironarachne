import * as Fields from './fields.js';
import type { VariationSlotPreference } from './generatorconfig.js';
import type { HeraldryGeneratorOptionsSnapshot } from './heraldry_snapshot.js';
import * as Tinctures from './tinctures.js';
import type { Tincture } from './tinctures.js';
import * as Variations from './variations.js';

export type HeraldryFieldUiState = {
  fieldDivisionOption: string;
  variationSlotOptions: string[];
  variationTinctureOptions: string[][];
};

export function variationTinctureCountForSlot(
  variationSlotOptions: string[],
  slotIndex: number,
): number {
  const name = variationSlotOptions[slotIndex] ?? 'any';
  if (name === 'any') {
    return 2;
  }
  return Variations.byName(name).tinctureCount;
}

export function eligibleVariationTinctures(variationName: string): Tincture[] {
  if (variationName === 'any') {
    return Tinctures.all();
  }
  const variation = Variations.byName(variationName);
  if (!variation.supportsFurs) {
    return Tinctures.withoutFurs(Tinctures.all());
  }
  return Tinctures.all();
}

export function hasPinnedFieldTinctures(variationTinctureOptions: string[][]): boolean {
  return variationTinctureOptions.some((row) => row.some((tincture) => tincture !== 'any'));
}

export function buildVariationSlotPreferences(
  variationSlotOptions: string[],
  variationTinctureOptions: string[][],
): VariationSlotPreference[] | undefined {
  const result: VariationSlotPreference[] = [];
  let hasAnyPin = false;

  for (let slotIndex = 0; slotIndex < 2; slotIndex++) {
    const preference: VariationSlotPreference = {};
    let slotHasPin = false;

    if (variationSlotOptions[slotIndex] !== 'any') {
      preference.variationName = variationSlotOptions[slotIndex];
      slotHasPin = true;
    }

    const tinctureRows = variationTinctureOptions[slotIndex] ?? ['any'];
    const tinctureCount = variationTinctureCountForSlot(variationSlotOptions, slotIndex);
    const tinctureNames: string[] = [];
    let tincturePin = false;

    for (let tinctureIndex = 0; tinctureIndex < tinctureCount; tinctureIndex++) {
      const option = tinctureRows[tinctureIndex] ?? 'any';
      if (option !== 'any') {
        tinctureNames[tinctureIndex] = option;
        tincturePin = true;
      }
    }

    if (tincturePin) {
      preference.tinctureNames = tinctureNames;
      slotHasPin = true;
    }

    if (slotHasPin) {
      result[slotIndex] = preference;
      hasAnyPin = true;
    }
  }

  return hasAnyPin ? result : undefined;
}

export function resolveFieldOptions(fieldDivisionOption: string) {
  if (fieldDivisionOption !== 'any') {
    return [Fields.byName(fieldDivisionOption)];
  }
  return Fields.all();
}

export function fieldDivisionNameFromOption(fieldDivisionOption: string): string | undefined {
  if (fieldDivisionOption === 'any') {
    return undefined;
  }
  return fieldDivisionOption;
}

export function showSecondVariationSlot(fieldDivisionOption: string): boolean {
  return fieldDivisionOption !== 'plain';
}

export function fieldUiStateFromGeneratorOptions(
  options: HeraldryGeneratorOptionsSnapshot,
): HeraldryFieldUiState {
  return {
    fieldDivisionOption: options.fieldDivisionOption ?? 'any',
    variationSlotOptions: options.variationSlotOptions ?? ['any', 'any'],
    variationTinctureOptions: options.variationTinctureOptions ?? [['any'], ['any']],
  };
}
