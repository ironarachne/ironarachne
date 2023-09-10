import type Mob from "./mob.js";
import * as Mobs from "./mobs.js";

export default class MobFilter {
  withAllTags: string[];
  withAnyTag: string[];
  withCreatureType: string;
  withEnvironment: string;
  withNoTags: string[];

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

  apply(mobs: Mob[]): Mob[] {
    let result = mobs;

    if (this.withAllTags.length > 0) {
      result = Mobs.hasAllTagsIn(this.withAllTags, result);
    }

    if (this.withAnyTag.length > 0) {
      result = Mobs.hasAnyTagIn(this.withAnyTag, result);
    }

    if (this.withCreatureType != "") {
      result = Mobs.hasCreatureType(this.withCreatureType, result);
    }

    if (this.withEnvironment != "") {
      result = Mobs.hasEnvironment(this.withEnvironment, result);
    }

    if (this.withNoTags.length > 0) {
      result = Mobs.hasNoTagIn(this.withNoTags, result);
    }

    return result;
  }
}
