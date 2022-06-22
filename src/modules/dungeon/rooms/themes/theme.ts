'use strict';

import RoomFeatureGenerator from '../features/featuregenerator';

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
    this.shapes = shapes;
    this.tags = tags;
    this.commonality = commonality;
  }
}
