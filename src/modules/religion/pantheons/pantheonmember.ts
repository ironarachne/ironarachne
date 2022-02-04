'use strict';

import Deity from '../deities/deity';
import Relationship from '../../relationships/relationship';

export default class PantheonMember {
  deity: Deity;
  relationships: Relationship[];

  constructor() {
    this.relationships = [];
  }
}
