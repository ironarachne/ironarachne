'use strict';

import * as RND from '../random';

export default class PrecipitationType {
  name: string;
  mildEvents: string[];
  moderateEvents: string[];
  strongEvents: string[];

  constructor(
    name: string,
    mildEvents: string[],
    moderateEvents: string[],
    strongEvents: string[],
  ) {
    this.name = name;
    this.mildEvents = mildEvents;
    this.moderateEvents = moderateEvents;
    this.strongEvents = strongEvents;
  }

  getRandomWeatherEvents(strength: number): string {
    if (strength < 3) {
      return RND.item(this.mildEvents);
    } else if (strength < 7) {
      return RND.item(this.moderateEvents);
    }

    return RND.item(this.strongEvents);
  }
}
