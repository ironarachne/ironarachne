'use strict';

export default class DCCLanguage {
  name: string;
  commonality: number;

  constructor(name: string, commonality: number) {
    this.name = name;
    this.commonality = commonality;
  }
}
