"use strict";

export default class RoomFeature {
  name: string;
  description: string;
  secret: string;
  isContainer: boolean;

  constructor(name: string, description: string, secret: string, isContainer: boolean) {
    this.name = name;
    this.description = description;
    this.secret = secret;
    this.isContainer = isContainer;
  }
}
