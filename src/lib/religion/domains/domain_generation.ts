import type { Domain, DomainFilter, DomainSet } from './domain_types';
import { RNG } from '@ironarachne/rng';

export function generateDomainSet(
  seed: string,
  domains: Domain[],
  filter: DomainFilter,
  minDomains: number,
  maxDomains: number,
): DomainSet {
  const rng = new RNG(seed);

  // First, filter the domains based on the provided filter
  let filteredDomains = domains.filter((domain) => {
    if (filter.hasHolyItems === false && domain.holyItems.length == 0) {
      return false;
    }
    if (filter.hasHolySymbols === false && domain.holySymbols.length == 0) {
      return false;
    }
    if (filter.requiredTags) {
      for (let tag of filter.requiredTags) {
        if (!domain.tags.includes(tag)) {
          return false;
        }
      }
    }
    if (filter.excludedTags) {
      for (let tag of filter.excludedTags) {
        if (domain.tags.includes(tag)) {
          return false;
        }
      }
    }
    return true;
  });

  // If filtering results in an empty list, fall back to the unfiltered list
  if (filteredDomains.length === 0) {
    filteredDomains = [...domains];
  }

  const numberOfDomains = rng.int(minDomains, maxDomains);

  // Randomly choose a primary domain from the filtered list
  const primary = rng.item(filteredDomains);
  filteredDomains = filteredDomains.filter((domain) => domain !== primary);

  if (numberOfDomains === 1) {
    return {
      primary,
      secondary: null,
      tertiary: null,
    };
  }

  // Generally, secondary domains should be related to the primary domain, so we can filter the remaining domains to those that share at least one tag with the primary domain
  let relatedDomains = filteredDomains.filter((domain) =>
    domain.tags.some((tag) => primary.tags.includes(tag)),
  );
  if (relatedDomains.length === 0) {
    relatedDomains = [...filteredDomains];
  }
  const secondary = rng.item(relatedDomains);
  filteredDomains = filteredDomains.filter((domain) => domain !== secondary);

  if (numberOfDomains === 2) {
    return {
      primary,
      secondary,
      tertiary: null,
    };
  }

  // Tertiary domains can be any of the remaining domains that fit the filter, but we can prioritize those that are related to either the primary or secondary domain
  let tertiaryCandidates = filteredDomains.filter((domain) =>
    domain.tags.some((tag) => primary.tags.includes(tag) || secondary.tags.includes(tag)),
  );
  if (tertiaryCandidates.length === 0) {
    tertiaryCandidates = [...filteredDomains];
  }
  const tertiary = rng.item(tertiaryCandidates);

  return {
    primary,
    secondary,
    tertiary,
  };
}
