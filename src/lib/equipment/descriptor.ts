export class Descriptor {
  description: string;
  objectTypes: string[];
  tags: string[];

  constructor(description: string, objectTypes: string[], tags: any[]) {
    this.description = description;
    this.objectTypes = objectTypes;
    this.tags = tags;
  }
}

export function getDescriptorsMatchingType(descriptors: Descriptor[], objectType: string) {
  const result = [];

  for (let i = 0; i < descriptors.length; i++) {
    if (descriptors[i].objectTypes.includes(objectType)) {
      result.push(descriptors[i]);
    }
  }

  return result;
}

export function getDescriptorsMatchingTag(descriptors: Descriptor[], tag: string) {
  const result = [];

  for (let i = 0; i < descriptors.length; i++) {
    if (descriptors[i].tags.includes(tag)) {
      result.push(descriptors[i]);
    }
  }

  return result;
}
