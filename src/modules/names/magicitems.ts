'use strict';

import * as Invented from './invented';

export function generate() {
  const patterns = [
    'cvpv',
    'vccvc',
    'gvcvc',
    'cvDAR',
    'cvcDRING',
    'cApERI',
    'cvcAcI',
    'cApERv',
    "cvs'gARvc",
  ];

  return Invented.generate(patterns);
}
