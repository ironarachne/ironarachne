export default interface Planet {
  name: string;
  description: string;
  culture: string;
  government: string;
  population: number;
  populationFriendly: string;
  is_inhabited: boolean;
  classification: string;
  mass: number; // in 10^24 kg
  gravity: number; // in m/s^2
  diameter: number; // in km
  orbital_period: number; // in Earth days
  rotation_period: number; // in Earth hours
  distance_from_sun: number; // in AU
  has_clouds: boolean;
  has_atmosphere: boolean;
}
