"use strict";

import RoomFeatureGenerator from "../features/featuregenerator.js";
import Mutator from "../mutators/mutator.js";

export default class RoomTheme {
  name: string;
  allowedEnvironments: string[];
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  flooringOptions: string[];
  dressingGenerators: RoomFeatureGenerator[];
  featureGenerators: RoomFeatureGenerator[];
  mutators: Mutator[];
  shapes: string[];
  tags: string[];
  commonality: number;

  constructor(
    name: string,
    allowedEnvironments: string[],
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
    flooringOptions: string[],
    dressingGenerators: RoomFeatureGenerator[],
    featureGenerators: RoomFeatureGenerator[],
    mutators: Mutator[],
    shapes: string[],
    tags: string[],
    commonality: number,
  ) {
    this.name = name;
    this.allowedEnvironments = allowedEnvironments;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.flooringOptions = flooringOptions;
    this.dressingGenerators = dressingGenerators;
    this.featureGenerators = featureGenerators;
    this.mutators = mutators;
    this.shapes = shapes;
    this.tags = tags;
    this.commonality = commonality;
  }
}
