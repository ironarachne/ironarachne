'use strict';

import Tincture from './tincture';
import * as Tinctures from './tinctures';
import * as Fields from './fields';
import Variation from './variation';
import * as Variations from './variations';
import ChargeGroup from './chargegroup';
import * as Arrangements from './chargegrouparrangements';
import * as Charges from './charges';
import * as RND from '../random';

import Device from './device';
import GeneratorConfig from './generatorconfig';

export class Heraldry {
  device: Device;
  blazon: string;
  svg: string;

  constructor(device: Device, blazon: string, svg: string) {
    this.device = device;
    this.blazon = blazon;
    this.svg = svg;
  }
}

export function generate(config: GeneratorConfig) {
  let chargeGroups = [];

  if (config.chargeCount > 0) {
    let charge = Charges.random(config.chargeOptions);
    charge.tincture = Tinctures.randomFrom(config.chargeTinctures);
    let chargeArrangement = Arrangements.randomByNumber(config.chargeCount);
    let chargeGroup = new ChargeGroup(charge, config.chargeCount, chargeArrangement);
    chargeGroups = [chargeGroup];
  }

  let field = Fields.randomFrom(config.fieldOptions);

  field.variations = generateVariations(
    field.variationCount,
    config.fieldTinctures1,
    config.fieldTinctures2,
    config.variationOptions,
  );

  let device = new Device(field, chargeGroups);

  let blazon = device.renderBlazon();

  let svg = renderSVG(device, config.width, config.height);

  return new Heraldry(device, blazon, svg);
}

export function generateVariations(
  count: number,
  tinctures1: Tincture[],
  tinctures2: Tincture[],
  options: Variation[],
): Variation[] {
  let result = [];
  let furCount = 0; // This function has an inherent limit of a single fur in a set of variations.

  for (let i = 0; i < count; i++) {
    let tinctureSet1 = tinctures1;
    let tinctureSet2 = tinctures2;
    let variation = Variations.randomWeightedFrom(options);
    options = Variations.removeFromSet(variation, options);

    let firstTincture = Tinctures.randomFrom(tinctureSet1);
    tinctureSet1 = Tinctures.exclude(firstTincture, tinctureSet1);
    tinctureSet2 = Tinctures.exclude(firstTincture, tinctureSet2);
    if (firstTincture.type == 'fur' && furCount == 0) {
      furCount = 1;
      tinctureSet1 = Tinctures.getSetExcluding(Tinctures.furs(), tinctureSet1);
    }
    let secondTincture = Tinctures.randomFrom(tinctureSet2);
    tinctureSet2 = Tinctures.exclude(secondTincture, tinctureSet2);
    if (secondTincture.type == 'fur' && furCount == 0) {
      furCount = 1;
      tinctureSet2 = Tinctures.getSetExcluding(Tinctures.furs(), tinctureSet2);
    }

    variation.tinctures = [firstTincture, secondTincture];
    result.push(variation);
  }

  return result;
}

export function getDefaultConfig(): GeneratorConfig {
  let config = new GeneratorConfig();

  config.chargeCount = RND.item([0, 1, 2, 3]);
  config.chargeOptions = Charges.all();
  config.chargeTinctures = Tinctures.ofTypes(['metal', 'color']);
  config.fieldOptions = Fields.all();
  config.fieldTinctures1 = Tinctures.ofTypes(['fur', 'metal', 'color', 'stain']);
  config.fieldTinctures2 = Tinctures.ofTypes(['fur', 'metal', 'color', 'stain']);
  config.variationOptions = Variations.all();
  config.width = 600;
  config.height = 660;

  return config;
}

export function randomNumberOfCharges(): number {
  const weights = [
    { item: 0, commonality: 20 },
    { item: 1, commonality: 50 },
    { item: 2, commonality: 5 },
    { item: 3, commonality: 3 },
  ];

  const result = RND.weighted(weights);

  return result.item;
}

export function random(width: number, height: number) {
  let config = new GeneratorConfig();
  config.fieldOptions = Fields.all();
  config.chargeOptions = Charges.all();
  config.variationOptions = Variations.all();

  let chargeTinctureType = RND.item(['metal', 'color', 'stain']);
  config.chargeTinctures = Tinctures.ofTypes([chargeTinctureType]);
  let fieldTinctures1 = [];
  let fieldTinctures2 = [];

  if (chargeTinctureType == 'metal') {
    fieldTinctures1 = Tinctures.ofTypes(['color', 'fur', 'stain']);
    fieldTinctures2 = Tinctures.ofTypes(['color', 'fur', 'stain']);
  } else {
    fieldTinctures1 = Tinctures.ofTypes(['metal', 'fur']);
    fieldTinctures2 = Tinctures.ofTypes(['metal', 'fur']);
  }

  config.fieldTinctures1 = fieldTinctures1;
  config.fieldTinctures2 = fieldTinctures2;

  config.chargeCount = randomNumberOfCharges();
  config.width = width;
  config.height = height;

  return generate(config);
}

export function renderSVG(device: Device, width: number, height: number) {
  const shieldWidth = 600;
  const shieldHeight = 660;

  const uid = RND.randomString(4);

  const shieldSVG = `<path fill="url(#Division${uid})" stroke="#000000" stroke-width="3" d="M3,3 V260.637C3,369.135,46.339,452.459,99.763,514 C186.238,614.13,300,657,300,657 C300,657,413.762,614.13,500.237,514 C553.661,452.459,597,369.135,597,260.637V3Z"/>`;

  const svgHeader = `<svg width="${width}" height="${height}" viewBox="0 0 ${shieldWidth} ${shieldHeight}" xmlns="http://www.w3.org/2000/svg" version="1.1">`;
  let defsSVG = '';

  defsSVG += device.field.pattern
    .replaceAll('variation', `variation${uid}`)
    .replaceAll('Division', `Division${uid}`);

  for (let i = 0; i < device.field.variations.length; i++) {
    for (let j = 0; j < device.field.variations[i].tinctures.length; j++) {
      defsSVG += device.field.variations[i].tinctures[j].pattern;
    }
    let pattern = device.field.variations[i].renderSVGPattern();
    pattern = pattern.replaceAll('variation', `variation${uid}` + (i + 1));
    defsSVG += pattern;
  }

  let chargeGroupsSVG = '';

  for (let i = 0; i < device.chargeGroups.length; i++) {
    chargeGroupsSVG += device.chargeGroups[i].renderSVG(shieldWidth, shieldHeight); // TODO: handle different centerPosition and arrangement
  }

  let svg = svgHeader;

  svg += `<defs>${defsSVG}</defs>`;
  svg += shieldSVG;
  svg += chargeGroupsSVG;
  svg += '</svg>';

  return svg.replace(/<\?xml.*\?>/g, '');
}
