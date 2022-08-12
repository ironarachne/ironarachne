'use strict';

export default class OSEAttributeRequirement {
  attribute: string;
  value: number;

  constructor(attribute: string, value: number) {
    this.attribute = attribute;
    this.value = value;
  }
}
