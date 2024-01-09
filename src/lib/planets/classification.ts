export default interface PlanetClassification {
  name: string;
  diameter_min: number; // in km
  diameter_max: number; // in km
  mass_min: number; // in 10^24 kg
  mass_max: number; // in 10^24 kg
  orbital_period_min: number; // in Earth days
  orbital_period_max: number; // in Earth days
  distance_from_sun_min: number; // in AU
  distance_from_sun_max: number; // in AU
  is_inhabitable: boolean;
  has_clouds: boolean;
  has_atmosphere: boolean;
  getRandomDescription(): string;
}
