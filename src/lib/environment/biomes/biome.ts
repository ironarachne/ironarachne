export default interface Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];
}
