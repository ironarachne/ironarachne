import { describe, expect, it } from 'vitest';
import {
  buildVariationSlotPreferences,
  fieldDivisionNameFromOption,
  hasPinnedFieldTinctures,
  resolveFieldOptions,
} from '$lib/heraldry/heraldry_ui_options.js';

describe('heraldry_ui_options', () => {
  it('buildVariationSlotPreferences returns undefined when all any', () => {
    expect(
      buildVariationSlotPreferences(['any', 'any'], [
        ['any', 'any'],
        ['any', 'any'],
      ]),
    ).toBeUndefined();
  });

  it('buildVariationSlotPreferences captures partial tincture pins', () => {
    const prefs = buildVariationSlotPreferences(['barry', 'any'], [['azure', 'any'], ['any', 'any']]);
    expect(prefs?.[0]).toEqual({
      variationName: 'barry',
      tinctureNames: ['azure'],
    });
  });

  it('resolveFieldOptions narrows to a single field', () => {
    expect(resolveFieldOptions('chevron')).toHaveLength(1);
    expect(resolveFieldOptions('chevron')[0].name).toBe('chevron');
  });

  it('fieldDivisionNameFromOption returns undefined for any', () => {
    expect(fieldDivisionNameFromOption('any')).toBeUndefined();
    expect(fieldDivisionNameFromOption('pale')).toBe('pale');
  });

  it('hasPinnedFieldTinctures detects pinned tinctures', () => {
    expect(hasPinnedFieldTinctures([['any', 'any'], ['any', 'any']])).toBe(false);
    expect(hasPinnedFieldTinctures([['gules', 'any'], ['any', 'any']])).toBe(true);
  });
});
