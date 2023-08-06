"use strict";

export default class StarshipSensor {
  name: string;
  grade: number;
  range: number;
  detectionStrength: number;
  sensorType: string; // e.g., 'active', 'passive'
  cost: number;
}
