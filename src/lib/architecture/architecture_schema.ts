import type { ArchitectureValidation } from './architecture_types';
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
export function text(value: unknown): value is string {
  return typeof value === 'string';
}
export function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(text);
}
export function oneOf(value: unknown, values: readonly string[]): boolean {
  return typeof value === 'string' && values.includes(value);
}
export function nullable(value: unknown, check: (v: unknown) => boolean): boolean {
  return value === null || check(value);
}
export function list(value: unknown, check: (v: unknown) => boolean): boolean {
  return Array.isArray(value) && value.every(check);
}
export function uniqueIds(value: { id: string }[]): boolean {
  return (
    value.every((e) => e.id.trim().length > 0) &&
    new Set(value.map((e) => e.id)).size === value.length
  );
}
export function validation(ok: boolean): ArchitectureValidation {
  return ok
    ? { ok: true }
    : { ok: false, diagnostics: [{ code: 'invalid_input', contextId: null, resourceIds: [] }] };
}
export const PURPOSES = [
  'residential',
  'defensive',
  'civic',
  'religious',
  'storage',
  'commercial',
  'funerary',
  'scholarly',
  'industrial',
  'circulation',
  'natural',
];
export const MOTIFS = ['none', 'geometric', 'interlace', 'floral', 'figurative'];
export const CONDITIONS = ['unspecified', 'intact', 'worn', 'ruined'];
export const PORTALS = ['rectangular', 'round_arch', 'pointed_arch', 'rough_cut', 'natural'];
export const FINISHES = [
  'unworked',
  'rough_cut',
  'dressed',
  'smooth',
  'plastered',
  'painted',
  'tiled',
];
export const FEATURES = [
  'balcony',
  'widow_walk',
  'roof_terrace',
  'loggia',
  'arcade',
  'oriel_window',
  'bay_projection',
  'machicolations',
  'bartizan',
  'wall_walk',
  'flying_buttress',
  'entry_canopy',
  'loading_bay_cover',
  'drying_gallery',
  'belfry',
  'cornice_drip_band',
  'pergola',
  'external_stair',
  'stone_carving',
  'wood_carving',
  'tile_inlay',
  'metal_fittings',
  'ventilation_shaft',
  'drain_channel',
  'raised_plinth',
  'terraced_foundation',
  'deep_reveal',
];
export function climateShape(v: unknown): boolean {
  return (
    record(v) &&
    ['name', 'description'].every((k) => text(v[k])) &&
    [
      'cloudCover',
      'temperature',
      'temperatureMin',
      'temperatureMax',
      'precipitationAmount',
      'precipitationFrequency',
      'humidity',
    ].every((k) => finite(v[k])) &&
    ['cloudCover', 'precipitationAmount', 'precipitationFrequency', 'humidity'].every(
      (k) => (v[k] as number) >= 0 && (v[k] as number) <= 1,
    ) &&
    Array.isArray(v.wind) &&
    v.wind.length === 3 &&
    v.wind.every(finite) &&
    list(
      v.seasons,
      (s) =>
        record(s) &&
        text(s.name) &&
        ['startDay', 'endDay', 'temperatureAdjustment', 'humidityAdjustment'].every((k) =>
          finite(s[k]),
        ),
    )
  );
}
export function siteShape(v: unknown): boolean {
  return (
    record(v) &&
    nullable(v.substrate, (s) => oneOf(s, ['sandy', 'rocky', 'clay_rich', 'peat', 'mixed'])) &&
    nullable(v.relief, (s) => oneOf(s, ['flat', 'rolling', 'mountainous'])) &&
    nullable(v.coastal, (s) => typeof s === 'boolean') &&
    nullable(v.floodProne, (s) => typeof s === 'boolean')
  );
}
export function contextShape(v: unknown): boolean {
  return (
    record(v) &&
    text(v.id) &&
    v.id.length > 0 &&
    oneOf(v.construction, ['built', 'rock_cut', 'natural']) &&
    oneOf(v.exposure, ['exposed', 'sheltered', 'buried']) &&
    oneOf(v.purpose, PURPOSES) &&
    nullable(v.density, (s) => oneOf(s, ['low', 'medium', 'high'])) &&
    typeof v.exteriorWindowsAllowed === 'boolean' &&
    !(v.exposure === 'buried' && v.exteriorWindowsAllowed) &&
    (v.construction !== 'natural' || (v.purpose === 'natural' && !v.exteriorWindowsAllowed))
  );
}
