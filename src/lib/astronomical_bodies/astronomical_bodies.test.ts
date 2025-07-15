import { describe, expect, it } from "vitest";
import {
  stefanBoltzmannConstant,
  convertAUToKM,
  convertSolarLuminosityToWatts,
  convertSolarRadiusToKM,
  convertSolarMassToKG,
  convertKGToSolarMass,
  convertKMToAU,
  convertKMToSolarRadius,
  convertStandardGravityToMPS2,
  convertMPS2ToStandardGravity,
  convertWattsToSolarLuminosity,
  getSolarTemperature,
  getPlanetTemperature,
  getAlbedoFromTemperature,
  getGravityFromMassAndRadius,
} from "./astronomical_bodies";

describe("Astronomical Constants", () => {
  it("should have correct Stefan-Boltzmann constant", () => {
    expect(stefanBoltzmannConstant).toBe(5.670374419e-8);
  });
});

describe("Unit Conversions", () => {
  it("should convert AU to KM correctly", () => {
    expect(convertAUToKM(1)).toBe(149597870.7);
  });

  it("should convert Solar Luminosity to Watts correctly", () => {
    expect(convertSolarLuminosityToWatts(1)).toBe(3.828e26);
  });

  it("should convert Solar Radius to KM correctly", () => {
    expect(convertSolarRadiusToKM(1)).toBe(695700);
  });

  it("should convert Solar Mass to KG correctly", () => {
    expect(convertSolarMassToKG(1)).toBe(1.9891e30);
  });

  it("should convert KG to Solar Mass correctly", () => {
    expect(convertKGToSolarMass(1.9891e30)).toBe(1);
  });

  it("should convert KM to AU correctly", () => {
    expect(convertKMToAU(149597870.7)).toBe(1);
  });

  it("should convert KM to Solar Radius correctly", () => {
    expect(convertKMToSolarRadius(695700)).toBe(1);
  });

  it("should convert Standard Gravity to MPS2 correctly", () => {
    expect(convertStandardGravityToMPS2(1)).toBe(9.80665);
  });

  it("should convert MPS2 to Standard Gravity correctly", () => {
    expect(convertMPS2ToStandardGravity(9.80665)).toBe(1);
  });

  it("should convert Watts to Solar Luminosity correctly", () => {
    expect(convertWattsToSolarLuminosity(3.828e26)).toBe(1);
  });
});

describe("Albedo Calculation", () => {
  it("should calculate albedo from temperature correctly", () => {
    const temperature = 300; // in Kelvin
    const expectedAlbedo = 0.26 + 0.74 * temperature ** -1.5;
    expect(getAlbedoFromTemperature(temperature)).toBeCloseTo(
      expectedAlbedo,
      5,
    );
  });
  it("should calculate albedo from temperature correctly for extreme temperatures", () => {
    const temperature = 10000; // in Kelvin
    const expectedAlbedo = 0.26 + 0.74 * temperature ** -1.5;
    expect(getAlbedoFromTemperature(temperature)).toBeCloseTo(
      expectedAlbedo,
      5,
    );
  });
  it("should calculate albedo from temperature correctly for low temperatures", () => {
    const temperature = 100; // in Kelvin
    const expectedAlbedo = 0.26 + 0.74 * temperature ** -1.5;
    expect(getAlbedoFromTemperature(temperature)).toBeCloseTo(
      expectedAlbedo,
      5,
    );
  });
  it("should calculate albedo from temperature correctly for zero temperature", () => {
    const temperature = 0; // in Kelvin
    const expectedAlbedo = 0.26 + 0.74 * temperature ** -1.5;
    expect(getAlbedoFromTemperature(temperature)).toBeCloseTo(
      expectedAlbedo,
      5,
    );
  });
});

describe("Gravity Calculation", () => {
  it("should calculate gravity from mass and radius correctly", () => {
    const mass = 5.972; // mass of Earth in kg x 10^24
    const radius = 6378; // radius of Earth in kilometers
    const G = 6.67408e-11; // gravitational constant in m^3 kg^-1 s^-2
    const expectedGravity = (G * mass * 1e24) / (radius * 1000) ** 2; // in m/s^2
    expect(getGravityFromMassAndRadius(mass, radius)).toBeCloseTo(
      expectedGravity,
      5,
    );
  });
});

describe("Solar Temperature Calculation", () => {
  it("should calculate solar temperature correctly", () => {
    const luminosity = 1; // 1 solar luminosity
    const radius = 1; // 1 solar radius
    const expectedTemp =
      (luminosity * 4 * Math.PI * radius ** 2) ** 0.25 /
      stefanBoltzmannConstant;
    expect(getSolarTemperature(luminosity, radius)).toBe(expectedTemp);
  });
});

describe("Planet Temperature Calculation", () => {
  it("should calculate an average Earth temperature based on Earth properties", () => {
    const earth_atmosphere_density = 1;
    const earth_orbital_distance = 1;
    const sun_temperature = 5772;
    const expected_temperature = 282.9; // the average temperature of the Earth, in Kelvin

    expect(
      getPlanetTemperature(
        earth_atmosphere_density,
        earth_orbital_distance,
        sun_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });

  it("should calculate an average Venus temperature based on Venus properties", () => {
    const venus_atmosphere_density = 92;
    const venus_orbital_distance = 0.723;
    const sun_temperature = 5772;
    const expected_temperature = 737.85; // the average temperature of Venus, in Kelvin

    expect(
      getPlanetTemperature(
        venus_atmosphere_density,
        venus_orbital_distance,
        sun_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });

  it("should calculate an average Mars temperature based on Mars properties", () => {
    const mars_atmosphere_density = 0.01;
    const mars_orbital_distance = 1.524;
    const sun_temperature = 5772;
    const expected_temperature = 212.5; // the average temperature of Mars, in Kelvin

    expect(
      getPlanetTemperature(
        mars_atmosphere_density,
        mars_orbital_distance,
        sun_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });

  it("should calculate a colder temperature for a planet with a higher orbital distance", () => {
    const atmosphere_density = 1; // in atmospheres
    const orbital_distance = 10; // in AU
    const star_temperature = 5772; // Sun's temperature
    const expected_temperature = 252.3; // the average temperature of a planet at 10 AU, in Kelvin

    expect(
      getPlanetTemperature(
        atmosphere_density,
        orbital_distance,
        star_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });

  it("should calculate a hotter temperature for a planet with a lower orbital distance", () => {
    const atmosphere_density = 1; // in atmospheres
    const orbital_distance = 0.5; // in AU
    const star_temperature = 5772; // Sun's temperature
    const expected_temperature = 280; // the average temperature of a planet at 0.5 AU, in Kelvin

    expect(
      getPlanetTemperature(
        atmosphere_density,
        orbital_distance,
        star_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });

  it("should calculate a colder temperature for a planet with a lower atmosphere density", () => {
    const atmosphere_density = 0.1; // in atmospheres
    const orbital_distance = 1; // in AU
    const star_temperature = 5772; // Sun's temperature
    const expected_temperature = 218.2; // the average temperature of a planet with low atmosphere density, in Kelvin

    expect(
      getPlanetTemperature(
        atmosphere_density,
        orbital_distance,
        star_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });

  it("should calculate a hotter temperature for a planet with a higher atmosphere density", () => {
    const atmosphere_density = 10; // in atmospheres
    const orbital_distance = 1; // in AU
    const star_temperature = 5772; // Sun's temperature
    const expected_temperature = 474.8; // the average temperature of a planet with high atmosphere density, in Kelvin

    expect(
      getPlanetTemperature(
        atmosphere_density,
        orbital_distance,
        star_temperature,
      ),
    ).toBeCloseTo(expected_temperature, -1);
  });
});
