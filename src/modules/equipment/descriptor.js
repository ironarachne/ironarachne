"use strict";

export class Descriptor {
  constructor(description, objectTypes, tags) {
    this.description = description;
    this.objectTypes = objectTypes;
    this.tags = tags;
  }
}

export function getDescriptorsMatchingType(descriptors, objectType) {
  let result = [];

  for (let i = 0; i < descriptors.length; i++) {
    if (descriptors[i].objectTypes.includes(objectType)) {
      result.push(descriptors[i]);
    }
  }

  return result;
}

export function getDescriptorsMatchingTag(descriptors, tag) {
  let result = [];

  for (let i = 0; i < descriptors.length; i++) {
    if (descriptors[i].tags.includes(tag)) {
      result.push(descriptors[i]);
    }
  }

  return result;
}
