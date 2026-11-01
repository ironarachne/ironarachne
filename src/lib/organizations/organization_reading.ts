import type { RNG } from '@ironarachne/rng';
import { composeNarrative, type NarrativeContext } from '$lib/narrative';
import type {
  OrganizationReadingResult,
  OrganizationReadingSubject,
} from './organization_reading_types';

export function composeOrganizationReading(
  subject: OrganizationReadingSubject,
  rng: RNG,
  context: NarrativeContext = { recentSelections: [] },
): OrganizationReadingResult {
  return composeNarrative(
    { ...subject, kind: 'organization' },
    { maxSentences: 3, maxPerTopic: 1, repetitionWindow: 8 },
    context,
    rng,
  );
}
