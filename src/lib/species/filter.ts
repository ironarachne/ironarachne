import { byAllTags, byAnyTag, byCreatureType, byEnvironment } from '$lib/species/common';
import type Species from '$lib/species/species.js';

export class SpeciesFilter {
  withAllTags: string[] = [];
  withAnyTag: string[] = [];
  withCreatureType = '';
  withEnvironment = '';
  withNoTags: string[] = [];

  constructor(
    withAllTags: string[],
    withAnyTag: string[],
    withCreatureType: string,
    withEnvironment: string,
    withNoTags: string[],
  ) {
    this.withAllTags = withAllTags;
    this.withAnyTag = withAnyTag;
    this.withCreatureType = withCreatureType;
    this.withEnvironment = withEnvironment;
    this.withNoTags = withNoTags;
  }

  apply(options: Species[]): Species[] {
    let result = options;

    if (this.withAllTags.length > 0) {
      result = byAllTags(this.withAllTags, result);
    }

    if (this.withAnyTag.length > 0) {
      result = byAnyTag(this.withAnyTag, result);
    }

    if (this.withCreatureType !== '') {
      result = byCreatureType(this.withCreatureType, result);
    }

    if (this.withEnvironment !== '') {
      result = byEnvironment(this.withEnvironment, result);
    }

    if (this.withNoTags.length > 0) {
      result = result.filter((s) => !this.withNoTags.some((tag) => s.tags.includes(tag)));
    }

    return result;
  }
}
