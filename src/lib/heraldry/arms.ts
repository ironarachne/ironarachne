"use strict";

import type Device from "./device.js";

export default class Arms {
  device: Device;
  blazon: string;

  constructor(device: Device, blazon: string) {
    this.device = device;
    this.blazon = blazon;
  }
}
