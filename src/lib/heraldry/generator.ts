import * as RNG from '@ironarachne/rng';
import type { Arms } from './arms.js';
import type { ChargeGroup } from './charge_group.js';
import * as Arrangements from './charge_group_arrangements/index.js';
import * as Charges from './charges/index.js';
import { type Device, renderDeviceBlazon } from './device.js';
import * as Fields from './fields.js';
import {
  getDefaultHeraldryGeneratorConfig,
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from './generatorconfig.js';
import type { Tincture } from './tinctures.js';
import * as Tinctures from './tinctures.js';
import type { Variation } from './variation.js';
import * as Variations from './variations.js';

// Generate a coat-of-arms from a config. If no config is provided, use defaults.
export function generateHeraldry(config?: HeraldryGeneratorConfig): Arms {
  const cfg = config ?? getDefaultHeraldryGeneratorConfig();

  let chargeGroups: ChargeGroup[] = [];

  let fieldTinctures1: Tincture[] = JSON.parse(JSON.stringify(cfg.fieldTinctures1));
  let fieldTinctures2: Tincture[] = JSON.parse(JSON.stringify(cfg.fieldTinctures2));

  if (cfg.chargeCount > 0 && cfg.chargeOptions.length > 0) {
    let charge = cfg.rng.item(Array.from(cfg.chargeOptions));
    charge.tincture = cfg.rng.weighted(
      Array.from(cfg.chargeTinctures).map((t) => {
        return { commonality: t.commonality, value: t };
      }),
    );
    let arrangementOptions = Arrangements.withCount(cfg.chargeCount);

    if (cfg.chargePosition === 'in chief') {
      arrangementOptions = arrangementOptions.filter(
        (a) => a.name.includes('horizontal') || a.name === 'single charge center',
      );
    }

    let chargeArrangement = cfg.rng.item(arrangementOptions);
    let chargeGroup: ChargeGroup = {
      charge,
      numberOfCharges: cfg.chargeCount,
      arrangement: chargeArrangement,
      position: cfg.chargePosition,
    };
    chargeGroups = [chargeGroup];

    fieldTinctures1 = Tinctures.getContrasting(charge.tincture, fieldTinctures1);
    fieldTinctures2 = Tinctures.getContrasting(charge.tincture, fieldTinctures2);
  }

  let field = cfg.rng.weighted(
    Array.from(cfg.fieldOptions).map((f) => {
      return { commonality: f.commonality, value: f };
    }),
  );

  field.variations = generateVariations(
    field.variationCount,
    fieldTinctures1,
    fieldTinctures2,
    Array.from(cfg.variationOptions),
    cfg.rng,
  );

  const device: Device = { field, chargeGroups };
  const blazon = renderDeviceBlazon(device);
  return { device, blazon };
}

// Build a randomized but constrained config (was a class method previously)
export function generateHeraldryConfig(rng: RNG.RNG): HeraldryGeneratorConfig {
  const charges = Charges.all();
  let chargeTincture = Tinctures.randomChargeTincture(rng);
  let furCount = 0;
  let fieldTinctures1 = Tinctures.all();
  let fieldTinctures2 = Tinctures.all();
  let fields = Fields.all();
  let variations = Variations.all();

  let types1: string[] = [];
  let types2: string[] = [];

  if (chargeTincture.type === 'color' || chargeTincture.type === 'stain') {
    types1 = ['metal'];
    types2 = ['metal'];
  } else {
    types1 = ['color'];
    types2 = ['color'];

    if (rng.int(1, 100) > 70) {
      types1.push('stain');
    }
    if (rng.int(1, 100) > 80) {
      types2.push('stain');
    }
  }
  if (furCount === 0) {
    types1.push('furs');
  }
  fieldTinctures1 = Tinctures.ofTypes(types1);
  fieldTinctures2 = Tinctures.ofTypes(types2);

  const numberOfCharges = randomNumberOfCharges(rng);

  return mergeHeraldryGeneratorConfig({
    chargeCount: numberOfCharges,
    chargeOptions: charges,
    chargeTinctures: [chargeTincture],
    fieldOptions: fields,
    variationOptions: variations,
    fieldTinctures1,
    fieldTinctures2,
  });
}

function generateVariations(
  count: number,
  tinctures1: Tincture[],
  tinctures2: Tincture[],
  options: Variation[],
  rng: RNG.RNG,
): Variation[] {
  let result = [];
  let furCount = 0; // This function has an inherent limit of a single fur in a set of variations.
  let variationOptions: Variation[] = JSON.parse(JSON.stringify(options));

  for (let i = 0; i < count; i++) {
    let tinctureSet1 = JSON.parse(JSON.stringify(tinctures1));
    let tinctureSet2 = JSON.parse(JSON.stringify(tinctures2));

    let variation = rng.weighted(
      variationOptions.map((v) => {
        return { commonality: v.commonality, value: v };
      }),
    );

    if (!variation.supportsFurs) {
      tinctureSet1 = Tinctures.withoutFurs(tinctureSet1);
      tinctureSet2 = Tinctures.withoutFurs(tinctureSet2);
    }

    variationOptions = Variations.removeFromSet(variation, variationOptions);

    let firstTincture = Tinctures.randomFrom(tinctureSet1, rng);
    tinctureSet1 = Tinctures.exclude(firstTincture, tinctureSet1);
    tinctureSet2 = Tinctures.exclude(firstTincture, tinctureSet2);
    if (firstTincture.type === 'fur' && furCount === 0) {
      furCount = 1;
      tinctureSet1 = Tinctures.getSetExcluding(Tinctures.furs(), tinctureSet1);
    }
    let secondTincture = Tinctures.randomFrom(tinctureSet2, rng);
    tinctureSet2 = Tinctures.exclude(secondTincture, tinctureSet2);
    if (secondTincture.type === 'fur' && furCount === 0) {
      furCount = 1;
      tinctureSet2 = Tinctures.getSetExcluding(Tinctures.furs(), tinctureSet2);
    }

    variation.tinctures = [firstTincture, secondTincture];
    result.push(variation);
  }

  return result;
}

function randomNumberOfCharges(rng: RNG.RNG): number {
  const weights = [
    { value: 0, commonality: 20 },
    { value: 1, commonality: 50 },
    { value: 2, commonality: 5 },
    { value: 3, commonality: 3 },
  ];

  const result = rng.weighted(weights);

  return result;
}
