'use strict';

export default class Star {
  name: string;
  color: string;
  description: string;
  classification: string;
  radius: number; // in km
  mass: number; // in 10^30 kg
  temperature: number; // in K
  luminosity: number; // in 10^26 W

  constructor() {
    this.name = '';
    this.color = '';
    this.description = '';
    this.classification = '';
    this.radius = 0;
    this.mass = 0;
    this.temperature = 0;
    this.luminosity = 0;
  }

  getColorFromTemperature() {
    if (this.temperature < 3700) {
      return 'red';
    } else if (this.temperature < 5200) {
      return 'orange';
    } else if (this.temperature < 6000) {
      return 'yellow';
    } else if (this.temperature < 7500) {
      return 'yellow-white';
    } else if (this.temperature < 10000) {
      return 'white';
    } else if (this.temperature < 30000) {
      return 'blue-white';
    }

    return 'blue';
  }
}
