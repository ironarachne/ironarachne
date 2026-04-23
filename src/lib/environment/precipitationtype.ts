import type { RNG } from '@ironarachne/rng';

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

  getRandomWeatherEvents(strength: number, rng: RNG): string {
    if (strength < 3) {
      return rng.item(this.mildEvents);
    } else if (strength < 7) {
      return rng.item(this.moderateEvents);
    }

    return rng.item(this.strongEvents);
  }
}
