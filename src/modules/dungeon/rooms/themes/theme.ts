'use strict';

import RoomFeatureGenerator from '../features/featuregenerator';

export default class RoomTheme {
  name: string;
  environment: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  featureGenerators: RoomFeatureGenerator[];
  shapes: string[];
  tags: string[];

  constructor(
    name: string,
    environment: string,
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
    featureGenerators: RoomFeatureGenerator[],
    shapes: string[],
    tags: string[],
  ) {
    this.name = name;
    this.environment = environment;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.featureGenerators = featureGenerators;
    this.shapes = shapes;
    this.tags = tags;
  }
}
