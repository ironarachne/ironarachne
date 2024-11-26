export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function celsiusToKelvin(celsius: number): number {
  return celsius + 273.15;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function getDescription(
  temperature: number,
  temperatureType: string,
): string {
  let result = temperature;
  if (temperatureType === "celsius") {
    result = celsiusToFahrenheit(temperature);
  }

  if (result < 0) {
    return "freezing";
  }

  if (result < 40) {
    return "cold";
  }

  if (result < 60) {
    return "cool";
  }

  if (result < 80) {
    return "warm";
  }

  if (result < 100) {
    return "hot";
  }

  return "scorching";
}

export function getComparativeString(
  temperature: number,
  temperatureType: string,
): string {
  let celsius = temperature;
  let fahrenheit = temperature;

  if (temperatureType === "celsius") {
    fahrenheit = celsiusToFahrenheit(temperature);
  } else {
    celsius = fahrenheitToCelsius(temperature);
  }

  return `${Math.floor(celsius)}°C (${Math.floor(fahrenheit)}°F)`;
}
