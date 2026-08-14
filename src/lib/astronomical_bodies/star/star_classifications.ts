import type { LuminosityClass, SpectralClass, StarClassification } from './stars';

export function getStarClassificationByName(name: string): StarClassification {
  const classifications = getStarClassifications();

  for (let i = 0; i < classifications.length; i++) {
    if (classifications[i].name === name) {
      return classifications[i];
    }
  }

  throw new Error(`Failed to find star classification with name ${name}`);
}

export function searchStarClassificationsByName(
  name: string,
  classifications: StarClassification[],
): StarClassification[] {
  let left = 0;
  let right = classifications.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = classifications[mid].name.localeCompare(name);

    if (comparison === 0) {
      return [classifications[mid]];
    }

    if (comparison < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  throw new Error(`Failed to find star classification with name ${name}`);
}

export function getStarClassificationBySpec(
  temperature: number,
  luminosity: number,
  mass: number,
  radius: number,
): StarClassification {
  // TODO: Implement a faster search algorithm by specifications
  const classifications = getStarClassifications();

  for (let i = 0; i < classifications.length; i++) {
    if (
      classifications[i].min_temperature <= temperature &&
      classifications[i].max_temperature >= temperature &&
      classifications[i].min_luminosity <= luminosity &&
      classifications[i].max_luminosity >= luminosity &&
      classifications[i].min_mass <= mass &&
      classifications[i].max_mass >= mass &&
      classifications[i].min_radius <= radius &&
      classifications[i].max_radius >= radius
    ) {
      return classifications[i];
    }
  }

  throw new Error(
    `Failed to find star classification with temperature ${temperature}, luminosity ${luminosity}, mass ${mass}, and radius ${radius}`,
  );
}

export function getStarClassifications(): StarClassification[] {
  const classifications: StarClassification[] = [];

  const luminosityClasses = getLuminosityClasses();
  const spectralClasses = getSpectralClasses();

  for (const luminosityClass of luminosityClasses) {
    for (const spectralClass of spectralClasses) {
      const temperatureStep = (spectralClass.max_temperature - spectralClass.min_temperature) / 10;
      const massStep = (luminosityClass.max_mass - luminosityClass.min_mass) / 10;
      const radiusStep = (luminosityClass.max_radius - luminosityClass.min_radius) / 10;
      const luminosityStep = (luminosityClass.max_luminosity - luminosityClass.min_luminosity) / 10;

      for (let i = 0; i < 10; i++) {
        classifications.push({
          name: `${spectralClass.spectral_class}${i}${luminosityClass.name}`,
          description: `${spectralClass.name} ${luminosityClass.description}`,
          luminosity_class: luminosityClass.name,
          spectral_class: `${spectralClass.name}${i}`,
          min_temperature: spectralClass.min_temperature + i * temperatureStep,
          max_temperature: spectralClass.max_temperature + (i + 1) * temperatureStep,
          min_mass: luminosityClass.min_mass + i * massStep,
          max_mass: luminosityClass.max_mass + (i + 1) * massStep,
          min_radius: luminosityClass.min_radius + i * radiusStep,
          max_radius: luminosityClass.max_radius + (i + 1) * radiusStep,
          min_luminosity: luminosityClass.min_luminosity + i * luminosityStep,
          max_luminosity: luminosityClass.max_luminosity + (i + 1) * luminosityStep,
          commonality: luminosityClass.commonality + spectralClass.commonality,
        });
      }
    }
  }

  return sortStarClassificationsByName(classifications);
}

export function getLuminosityClasses(): LuminosityClass[] {
  return [
    {
      name: '0',
      description: 'hypergiant',
      min_mass: 14,
      max_mass: 58,
      min_radius: 131,
      max_radius: 1340,
      min_luminosity: 160000,
      max_luminosity: 1660000,
      commonality: 1, // these are the rarest
    },
    {
      name: 'I',
      description: 'supergiant',
      min_mass: 8,
      max_mass: 14,
      min_radius: 30,
      max_radius: 1000,
      min_luminosity: 50000,
      max_luminosity: 500000,
      commonality: 3,
    },
    {
      name: 'II',
      description: 'bright giant',
      min_mass: 8,
      max_mass: 10,
      min_radius: 5,
      max_radius: 75,
      min_luminosity: 750,
      max_luminosity: 1200,
      commonality: 5,
    },
    {
      name: 'III',
      description: 'giant',
      min_mass: 0.7,
      max_mass: 2.5,
      min_radius: 9,
      max_radius: 480,
      min_luminosity: 78,
      max_luminosity: 9360,
      commonality: 20,
    },
    {
      name: 'IV',
      description: 'subgiant',
      min_mass: 8.6,
      max_mass: 15,
      min_radius: 5,
      max_radius: 9.6,
      min_luminosity: 5000,
      max_luminosity: 38000,
      commonality: 5,
    },
    {
      name: 'V',
      description: 'main sequence',
      min_mass: 0.07,
      max_mass: 10,
      min_radius: 0.09,
      max_radius: 3.8,
      min_luminosity: 0.00017,
      max_luminosity: 20,
      commonality: 75,
    },
    {
      name: 'VI',
      description: 'subdwarf',
      min_mass: 0.077,
      max_mass: 0.744,
      min_radius: 0.291,
      max_radius: 0.789,
      min_luminosity: 0.012,
      max_luminosity: 0.445,
      commonality: 3,
    },
    {
      name: 'VII',
      description: 'white dwarf',
      min_mass: 0.5,
      max_mass: 0.7,
      min_radius: 0.008,
      max_radius: 0.02,
      min_luminosity: 0.00086,
      max_luminosity: 0.0295,
      commonality: 2,
    },
  ];
}

export function getSpectralClasses(): SpectralClass[] {
  return [
    {
      name: 'blue',
      spectral_class: 'O',
      min_temperature: 33000,
      max_temperature: 50000,
      commonality: 1,
    },
    {
      name: 'deep bluish white',
      spectral_class: 'B',
      min_temperature: 10000,
      max_temperature: 33000,
      commonality: 2,
    },
    {
      name: 'bluish white',
      spectral_class: 'A',
      min_temperature: 7300,
      max_temperature: 10000,
      commonality: 3,
    },
    {
      name: 'white',
      spectral_class: 'F',
      min_temperature: 6000,
      max_temperature: 7300,
      commonality: 5,
    },
    {
      name: 'yellowish white',
      spectral_class: 'G',
      min_temperature: 5300,
      max_temperature: 6000,
      commonality: 6,
    },
    {
      name: 'pale yellowish orange',
      spectral_class: 'K',
      min_temperature: 3900,
      max_temperature: 5300,
      commonality: 30,
    },
    {
      name: 'orangish red',
      spectral_class: 'M',
      min_temperature: 2300,
      max_temperature: 3900,
      commonality: 50,
    },
  ];
}

export function sortStarClassificationsByName(
  classifications: StarClassification[],
): StarClassification[] {
  return classifications.sort((a, b) => a.name.localeCompare(b.name));
}
