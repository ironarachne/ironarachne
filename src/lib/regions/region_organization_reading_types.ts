import type { OrganizationProfile } from '$lib/organizations';

export type RegionOrganizationReading = {
  organizationId: string;
  origin: 'generated' | 'authored';
  sentenceIds: string[];
};
export type OrganizationProfileObservation = {
  kind: 'organization-profile';
  organizationId: string;
  observedName: string;
  observedKindId: string;
  observedProfile: OrganizationProfile;
};
