'use strict';

import GenericNameGenerator from '../generators/generic';

export default class StarNationNameGenerator extends GenericNameGenerator {
  constructor() {
    super();
    this.patterns = [
      'pvn',
      'pvnvn',
      'pvnvv',
      'slvnvn',
      'lvfv',
      'lvfvn',
      'tvtv',
      'pvtun',
      'pvtu',
      'pudv',
      'tudv',
      'sludvv',
      'pvnvlv',
      'pvnvlvnv',
      'svnvlvnv',
      'pullvlv',
      'pvpvpun',
      'sludun',
      'slvdvn',
      'slvdvnv',
      'slvpvpv',
      'slvpupv',
    ];
  }
}
