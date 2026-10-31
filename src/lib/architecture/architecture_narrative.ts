import type { NarrativeCandidate, NarrativeSubject } from '$lib/narrative';
import type { ArchitecturalInstance, ArchitecturalStyle } from './architecture_types';
function candidate(
  id: string,
  sourceIds: string[],
  options: string[],
  importance: NarrativeCandidate['importance'] = 'defining',
): NarrativeCandidate {
  return {
    id: `architecture:${id}`,
    topic: 'architecture',
    importance,
    sourceIds,
    templates: options.map((text, index) => ({
      id: `architecture:${id}:${index}`,
      parts: [{ id: 'sentence', options: [text] }],
    })),
  };
}
/** Wording exposes selected facts only. Placement-dependent features never become room claims by default. */
export function architectureNarrativeSubject(
  style: ArchitecturalStyle,
  instance: ArchitecturalInstance | null,
  subjectId: string,
): NarrativeSubject {
  const profiles = instance
    ? style.profiles.filter((p) => p.id === instance.profileId)
    : style.profiles;
  const candidates: NarrativeCandidate[] = [];
  for (const profile of profiles) {
    const variants = instance
      ? profile.variants.filter((v) => v.id === instance.variantId)
      : profile.variants;
    if (!variants.length) continue;
    const primary = style.materials.find((m) => m.id === profile.primaryMaterialId);
    const name = primary?.label;
    if (profile.context.construction === 'natural') {
      candidates.push(
        candidate(
          `${profile.id}:natural`,
          [profile.id],
          [
            'The space retains its unworked walls and natural ceiling.',
            'Unworked walls meet an uneven natural ceiling.',
          ],
        ),
      );
    } else if (name) {
      const wall = profile.context.construction === 'rock_cut' ? 'carved' : 'built';
      const scope =
        !instance && style.profiles.length > 1
          ? `${profile.context.exposure === 'buried' ? 'Buried' : 'Surface'} ${profile.context.purpose} spaces`
          : instance
            ? 'This space'
            : profile.context.exposure === 'buried'
              ? 'This complex'
              : 'Local buildings';
      candidates.push(
        candidate(
          `${profile.id}:material`,
          [profile.id, primary.id],
          [
            `The walls of ${scope.toLowerCase()} are ${wall} from ${name}.`,
            `${scope} ${scope.startsWith('This ') ? 'has' : 'have'} walls ${wall} from ${name}.`,
          ],
        ),
      );
    }
    if (!instance) {
      const coverings = [
        ...new Set(variants.flatMap((v) => (v.roof ? [v.roof.coveringMaterialId] : []))),
      ];
      if (variants.every((v) => v.roof !== null) && coverings.length === 1) {
        const covering = style.materials.find((m) => m.id === coverings[0]);
        if (covering)
          candidates.push(
            candidate(
              `${profile.id}:covering`,
              [profile.id, covering.id],
              [
                `Roof coverings use ${covering.label}.`,
                `The roofs carry a covering of ${covering.label}.`,
              ],
              'distinctive',
            ),
          );
      }
      if (
        profile.motif !== 'none' &&
        variants.every((v) => v.features.some((f) => f.id === 'motif'))
      )
        candidates.push(
          candidate(
            `${profile.id}:motif`,
            [profile.id],
            [
              `Carved details repeat ${profile.motif} motifs.`,
              `${profile.motif.charAt(0).toUpperCase() + profile.motif.slice(1)} patterns recur in the carved ornament.`,
            ],
            'distinctive',
          ),
        );
    }
    if (instance) {
      const v = variants[0];
      if (v.ceiling === 'barrel_vault' || v.ceiling === 'carved_vault')
        candidates.push(
          candidate(
            `${profile.id}:ceiling`,
            [v.id],
            ['A vaulted ceiling spans the chamber.', 'The chamber rises into a vault.'],
            'distinctive',
          ),
        );
      if (v.roof) {
        const material = style.materials.find((m) => m.id === v.roof?.coveringMaterialId);
        if (material)
          candidates.push(
            candidate(
              `${profile.id}:roof`,
              [v.id, material.id],
              [
                `A ${v.roof.form.replaceAll('_', ' ')} roof is covered with ${material.label}.`,
                `The ${v.roof.form.replaceAll('_', ' ')} roof carries a covering of ${material.label}.`,
              ],
              'distinctive',
            ),
          );
      }
      if (instance.condition === 'worn')
        candidates.push(
          candidate(
            `${profile.id}:worn`,
            [instance.id],
            [
              'The architectural surfaces show visible wear.',
              'Wear marks the surviving architectural detail.',
            ],
            'supporting',
          ),
        );
      if (instance.condition === 'ruined')
        candidates.push(
          candidate(
            `${profile.id}:ruined`,
            [instance.id],
            [
              'The surviving architectural detail is ruined.',
              'Ruin has overtaken the architectural finishes.',
            ],
            'supporting',
          ),
        );
    }
  }
  return { id: subjectId, kind: 'architecture', candidates };
}
