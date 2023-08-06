"use strict";

import * as RND from "@ironarachne/rng";
import * as _ from "lodash";
import Arms from "./arms.js";
import ChargeGroup from "./chargegroup.js";
import * as Arrangements from "./chargegrouparrangements.js";
import * as Charges from "./charges.js";
import Device from "./device.js";
import * as Fields from "./fields.js";
import HeraldryGeneratorConfig from "./generatorconfig.js";
import Tincture from "./tincture.js";
import * as Tinctures from "./tinctures.js";
import Variation from "./variation.js";
import * as Variations from "./variations.js";

export default class HeraldryGenerator {
  config: HeraldryGeneratorConfig;

  constructor() {
    this.config = new HeraldryGeneratorConfig();
  }

  generate(): Arms {
    let chargeGroups: ChargeGroup[] = [];

    let fieldTinctures1 = _.cloneDeep(this.config.fieldTinctures1);
    let fieldTinctures2 = _.cloneDeep(this.config.fieldTinctures2);

    if (this.config.chargeCount > 0) {
      let charge = RND.item(this.config.chargeOptions);
      charge.tincture = RND.weighted(this.config.chargeTinctures);
      let arrangementOptions = Arrangements.withCount(this.config.chargeCount);
      let chargeArrangement = RND.item(arrangementOptions);
      let chargeGroup = new ChargeGroup(charge, this.config.chargeCount, chargeArrangement);
      chargeGroups = [chargeGroup];

      fieldTinctures1 = Tinctures.getContrasting(charge.tincture, fieldTinctures1);
      fieldTinctures2 = Tinctures.getContrasting(charge.tincture, fieldTinctures2);
    }

    let field = RND.weighted(this.config.fieldOptions);

    field.variations = generateVariations(
      field.variationCount,
      fieldTinctures1,
      fieldTinctures2,
      this.config.variationOptions,
    );

    let device = new Device(field, chargeGroups);

    let blazon = device.renderBlazon();

    return new Arms(device, blazon);
  }

  generateConfig(): HeraldryGeneratorConfig {
    const charges = Charges.all();
    let chargeTincture = Tinctures.randomChargeTincture();
    let furCount = 0;
    let fieldTinctures1 = Tinctures.all();
    let fieldTinctures2 = Tinctures.all();
    let fields = Fields.all();
    let variations = Variations.all();

    let types1 = [];
    let types2 = [];

    if (chargeTincture.type == "color" || chargeTincture.type == "stain") {
      types1 = ["metal"];
      types2 = ["metal"];
    } else {
      types1 = ["color"];
      types2 = ["color"];

      if (RND.simple(100) > 70) {
        types1.push("stain");
      }
      if (RND.simple(100) > 80) {
        types2.push("stain");
      }
    }
    if (furCount === 0) {
      types1.push("furs");
    }
    fieldTinctures1 = Tinctures.ofTypes(types1);
    fieldTinctures2 = Tinctures.ofTypes(types2);

    let numberOfCharges = randomNumberOfCharges();

    let config = new HeraldryGeneratorConfig();

    config.chargeCount = numberOfCharges;
    config.chargeOptions = charges;
    config.chargeTinctures = [chargeTincture];
    config.fieldOptions = fields;
    config.variationOptions = variations;
    config.fieldTinctures1 = fieldTinctures1;
    config.fieldTinctures2 = fieldTinctures2;

    return config;
  }
}

function generateVariations(
  count: number,
  tinctures1: Tincture[],
  tinctures2: Tincture[],
  options: Variation[],
): Variation[] {
  let result = [];
  let furCount = 0; // This function has an inherent limit of a single fur in a set of variations.

  for (let i = 0; i < count; i++) {
    let tinctureSet1 = _.cloneDeep(tinctures1);
    let tinctureSet2 = _.cloneDeep(tinctures2);

    let variation = RND.weighted(options);

    if (!variation.supportsFurs) {
      tinctureSet1 = Tinctures.withoutFurs(tinctureSet1);
      tinctureSet2 = Tinctures.withoutFurs(tinctureSet2);
    }

    options = Variations.removeFromSet(variation, options);

    let firstTincture = Tinctures.randomFrom(tinctureSet1);
    tinctureSet1 = Tinctures.exclude(firstTincture, tinctureSet1);
    tinctureSet2 = Tinctures.exclude(firstTincture, tinctureSet2);
    if (firstTincture.type == "fur" && furCount == 0) {
      furCount = 1;
      tinctureSet1 = Tinctures.getSetExcluding(Tinctures.furs(), tinctureSet1);
    }
    let secondTincture = Tinctures.randomFrom(tinctureSet2);
    tinctureSet2 = Tinctures.exclude(secondTincture, tinctureSet2);
    if (secondTincture.type == "fur" && furCount == 0) {
      furCount = 1;
      tinctureSet2 = Tinctures.getSetExcluding(Tinctures.furs(), tinctureSet2);
    }

    variation.tinctures = [firstTincture, secondTincture];
    result.push(variation);
  }

  return result;
}

function randomNumberOfCharges(): number {
  const weights = [
    { item: 0, commonality: 20 },
    { item: 1, commonality: 50 },
    { item: 2, commonality: 5 },
    { item: 3, commonality: 3 },
  ];

  const result = RND.weighted(weights);

  return result.item;
}
