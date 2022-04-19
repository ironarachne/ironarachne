'use strict';

import PhonemeCollection from "./collection";

export function all() {
  return [
    new PhonemeCollection(
      ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 'l', 'r', 's', 'ʃ', 'z', 'ʒ', 'ʧ'],
      ['a', 'e', 'i', 'o', 'u'],
      ['s', 'z', 'ʒ', 'ʃ'],
      ['r', 'l'],
      ['v', 'f', 'ð', 'θ', 'z', 's', 'ʒ', 'ʃ', 'h'],
    ),
  ];
}

export function soundToSpelling(sound: string) {
  const sounds: { [key: string]: string } = {
    ʃ: 'sh',
    ʒ: 'zh',
    ð: 'th',
    θ: 'th',
    ʧ: 'ch',
    ŋ: 'ng',
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
    e: 'e',
    f: 'f',
    g: 'g',
    h: 'h',
    i: 'i',
    j: 'j',
    k: 'k',
    l: 'l',
    m: 'm',
    n: 'n',
    o: 'o',
    p: 'p',
    q: 'q',
    r: 'r',
    s: 's',
    t: 't',
    u: 'u',
    v: 'v',
    w: 'w',
    x: 'x',
    y: 'y',
    z: 'z',
  };

  return sounds[sound];
}
