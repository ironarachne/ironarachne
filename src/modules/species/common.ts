'use strict';

import type Species from './species';
import * as RND from '../random';

export function byAnyTag(tags: string[], options: Species[]): Species[] {
  let result = [];

  let unique = true;

  for (let i = 0; i < options.length; i++) {
    unique = true;
    for (let j = 0; j < tags.length; j++) {
      if (options[i].tags.includes(tags[j]) && unique) {
        result.push(options[i]);
        unique = false;
      }
    }
  }

  return result;
}

export function byEnvironment(environment: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].environments.includes(environment) || options[i].environments.length == 0) {
      result.push(options[i]);
    }
  }

  return result;
}

export function byTag(tag: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }

  return result;
}

export function randomWeighted(options: Species[]): Species {
  return RND.weighted(options);
}
