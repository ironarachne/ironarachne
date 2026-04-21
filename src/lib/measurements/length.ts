export function cmToInches(cm: number): number {
  return cm * 0.3937;
}

export function inchesToCM(inches: number): number {
  return inches * 2.54;
}

export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

export function metersToFeet(meters: number): number {
  return meters * 3.2808;
}

export function kilometersToMiles(km: number): number {
  return km * 0.621371;
}

export function milesToKilometers(mi: number): number {
  return mi / 0.621371;
}
