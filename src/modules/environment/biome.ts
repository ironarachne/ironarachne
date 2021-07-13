export default class Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];
  weatherEvents: string[];

  constructor(name: string, temperature: number, altitude: number, humidity: number, isAquatic: boolean, descriptions: string[], features: string[], weatherEvents: string[]) {
    this.name = name;
    this.temperature = temperature;
    this.altitude = altitude;
    this.humidity = humidity;
    this.isAquatic = isAquatic;
    this.descriptions = descriptions;
    this.features = features;
    this.weatherEvents = weatherEvents;
  }
}
