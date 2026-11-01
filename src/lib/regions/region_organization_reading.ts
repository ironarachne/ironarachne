import { organizationReadingSubject } from '$lib/organizations';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionEditorialCandidate } from './region_editorial_types';
import type { RegionOrganizationReading } from './region_organization_reading_types';
import { organizationProfileObservation } from './region_organization_evidence';

export function emptyOrganizationReadings(snapshot: RegionSnapshot): RegionOrganizationReading[] {
  return snapshot.organizations.map((organization) => ({
    organizationId: organization.id,
    origin: 'generated',
    sentenceIds: [],
  }));
}

/** Organizational profile assertions do not imply regional locations, routes or affiliations. */
export function organizationReadingCandidates(
  snapshot: RegionSnapshot,
): RegionEditorialCandidate[] {
  return [...snapshot.organizations]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .flatMap((organization) =>
      organizationReadingSubject(
        organization.id,
        organization.kindId,
        organization.profile,
      ).candidates.map((narrative) => ({
        narrative,
        subjectKey: `organization:${organization.id}`,
        assertionKeys: [`organization:${organization.id}:${narrative.topic}`],
        destinations: [{ section: 'organization' as const, organizationId: organization.id }],
        priority: {
          residentConsequence: false,
          connectsSubjects: false,
          locatedDetail: false,
          peerSupportCount: 1,
        },
        sources: [],
        observations: [organizationProfileObservation(organization)],
      })),
    );
}
