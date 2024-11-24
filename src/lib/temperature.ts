export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32;
}

export function celsiusToKelvin(celsius: number): number {
  return celsius + 273.15;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5 / 9;
}

export function getDescription(temperature: number, temperatureType: string): string {
  if (temperatureType === "celsius") {
    temperature = celsiusToFahrenheit(temperature);
  }

  if (temperature < 0) {
    return "freezing";
  } else if (temperature < 40) {
    return "cold";
  } else if (temperature < 60) {
    return "cool";
  } else if (temperature < 80) {
    return "warm";
  } else if (temperature < 100) {
    return "hot";
  } else {
    return "scorching";
  }
}

export function getComparativeString(temperature: number, temperatureType: string): string {
  let celsius = temperature;
  let fahrenheit = temperature;

  if (temperatureType === "celsius") {
    fahrenheit = celsiusToFahrenheit(temperature);
  } else {
    celsius = fahrenheitToCelsius(temperature);
  }

  return `${Math.floor(celsius)}°C (${Math.floor(fahrenheit)}°F)`;
}