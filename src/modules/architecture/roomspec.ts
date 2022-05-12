"use strict";

import Range from "../range";
import RoomType from "./roomtype";

export default class RoomSpec {
  quantity: Range;
  roomType: RoomType;

  constructor(roomType: RoomType, quantity: Range) {
    this.roomType = roomType;
    this.quantity = quantity;
  }
}
