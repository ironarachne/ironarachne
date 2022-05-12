"use strict";

import Range from "../range";

export default class RoomType {
  name: string;
  purpose: string;
  exits: Range;
  height: Range; // in stories
  length: Range; // in meters
  width: Range; // in meters

  constructor(
    name: string,
    purpose: string,
    exits: Range,
    height: Range,
    length: Range,
    width: Range,
  ) {
    this.name = name;
    this.purpose = purpose;
    this.exits = exits;
    this.height = height;
    this.length = length;
    this.width = width;
  }
}
