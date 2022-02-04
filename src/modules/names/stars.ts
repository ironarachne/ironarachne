'use strict';

import * as Invented from './invented';

export function generate() {
  const patterns = [
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

  return Invented.generate(patterns);
}
