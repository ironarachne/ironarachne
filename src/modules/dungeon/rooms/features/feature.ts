'use strict';

export default class RoomFeature {
  name: string;
  description: string;
  isContainer: boolean;

  constructor(name: string, description: string, isContainer: boolean) {
    this.name = name;
    this.description = description;
    this.isContainer = isContainer;
  }
}
