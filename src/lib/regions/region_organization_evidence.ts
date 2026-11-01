import type { StoredOrganization } from '$lib/organizations';
import type { RegionSnapshot } from './region_snapshot';
import type { OrganizationProfileObservation } from './region_organization_reading_types';
import { notableEvidenceKey } from './region_notable_identity';

export function organizationProfileObservation(
  organization: StoredOrganization,
): OrganizationProfileObservation {
  return {
    kind: 'organization-profile',
    organizationId: organization.id,
    observedName: organization.name,
    observedKindId: organization.kindId,
    observedProfile: JSON.parse(JSON.stringify(organization.profile)),
  };
}

export function organizationObservationCurrent(
  snapshot: RegionSnapshot,
  observation: OrganizationProfileObservation,
): boolean {
  const organization = snapshot.organizations.find(
    (entry) => entry.id === observation.organizationId,
  );
  return (
    !!organization &&
    notableEvidenceKey(organizationProfileObservation(organization)) ===
      notableEvidenceKey(observation)
  );
}
