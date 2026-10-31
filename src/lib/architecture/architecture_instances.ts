import { RNG } from '@ironarachne/rng';
import type {
  ArchitectureInstanceResult,
  ArchitecturalStyle,
  ArchitectureSubject,
} from './architecture_types';
import { architectureOperationSeed } from './architecture_policy';
import {
  CONDITIONS,
  finite,
  list,
  oneOf,
  PURPOSES,
  record,
  strings,
  text,
} from './architecture_schema';
import {
  validateArchitecturalInstance,
  validateArchitecturalStyle,
} from './architecture_validation';
export function instantiateArchitecture(
  style: ArchitecturalStyle,
  subject: ArchitectureSubject,
  seed: string,
): ArchitectureInstanceResult {
  const failed: ArchitectureInstanceResult = {
    ok: false,
    diagnostics: [{ code: 'invalid_input', contextId: null, resourceIds: [] }],
  };
  if (
    !validateArchitecturalStyle(style).ok ||
    !record(subject) ||
    !text(subject.id) ||
    !subject.id ||
    !text(subject.profileId) ||
    !oneOf(subject.currentPurpose, PURPOSES) ||
    !oneOf(subject.shape, ['free', 'rectangular', 'circular', 'angled', 'irregular']) ||
    !oneOf(subject.condition, CONDITIONS) ||
    !strings(subject.placedFeatureIds) ||
    (subject.widthDepthRatio !== null &&
      (!finite(subject.widthDepthRatio) || subject.widthDepthRatio <= 0)) ||
    !list(
      subject.connections,
      (c) =>
        record(c) && text(c.id) && c.id.length > 0 && oneOf(c.kind, ['door', 'passage', 'stair']),
    ) ||
    new Set(subject.connections.map((c) => c.id)).size !== subject.connections.length ||
    !text(seed)
  )
    return failed;
  const profile = style.profiles.find((p) => p.id === subject.profileId);
  if (!profile) return failed;
  const variants = profile.variants.filter(
    (v) =>
      subject.placedFeatureIds.every((id) =>
        id === 'supports' ? v.supports !== 'none' : v.features.some((f) => f.id === id),
      ) &&
      (subject.shape === 'free' || v.massing !== 'courtyard_clusters') &&
      (subject.widthDepthRatio === null ||
        v.proportions.widthDepthRatio === null ||
        (subject.widthDepthRatio >= v.proportions.widthDepthRatio.min &&
          subject.widthDepthRatio <= v.proportions.widthDepthRatio.max)),
  );
  if (!variants.length)
    return {
      ok: false,
      diagnostics: [{ code: 'unsupported_context', contextId: profile.id, resourceIds: [] }],
    };
  const rng = new RNG(architectureOperationSeed(seed, 'instance', subject.id));
  const variant = rng.item(variants);
  const sample = (range: { min: number; max: number }) => rng.float(range.min, range.max);
  const value = {
    id: subject.id,
    profileId: profile.id,
    variantId: variant.id,
    currentPurpose: subject.currentPurpose,
    condition: subject.condition,
    placedFeatureIds: [...new Set(subject.placedFeatureIds)].sort(),
    storeys: variant.proportions.storeys
      ? rng.int(variant.proportions.storeys.min, variant.proportions.storeys.max)
      : null,
    widthDepthRatio:
      subject.widthDepthRatio ??
      (variant.proportions.widthDepthRatio ? sample(variant.proportions.widthDepthRatio) : null),
    wallHeightWidthRatio: sample(variant.proportions.wallHeightWidthRatio),
    connections: [...subject.connections]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((c) => {
        // A connection is an explicit child operation: opposite rooms must agree about one door.
        const connectionRng = new RNG(architectureOperationSeed(seed, 'connection', c.id));
        const portal = connectionRng.item(profile.portals);
        const frameMaterialId = profile.frameMaterialIds.length
          ? connectionRng.item(profile.frameMaterialIds)
          : null;
        // Keep leaf selection separate from face-specific frame/portal choices across profiles.
        const leafRng = new RNG(architectureOperationSeed(seed, 'door-leaf', c.id));
        return {
          connectionId: c.id,
          portal,
          frameMaterialId,
          leafMaterialId:
            c.kind === 'door' && profile.leafMaterialIds.length
              ? leafRng.item(profile.leafMaterialIds)
              : null,
          finish:
            profile.context.construction === 'natural'
              ? ('unworked' as const)
              : profile.context.construction === 'rock_cut'
                ? ('rough_cut' as const)
                : ('dressed' as const),
        };
      }),
  };
  return validateArchitecturalInstance(value, style, subject).ok ? { ok: true, value } : failed;
}
