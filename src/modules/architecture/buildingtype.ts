"use strict";

import Range from "../range";
import RoomSpec from "./roomspec";

export default class BuildingType {
  name: string;
  purpose: string;
  stories: Range;
  roomSpecs: RoomSpec[];

  constructor(name: string, purpose: string, stories: Range, roomSpecs: RoomSpec[]) {
    this.name = name;
    this.purpose = purpose;
    this.stories = stories;
    this.roomSpecs = roomSpecs;
  }
}
