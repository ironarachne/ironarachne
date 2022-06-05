'use strict';

import RoomFeature from './roomfeature';
import * as RND from '../random';

function all(): RoomFeature[] {
  return [
    new RoomFeature(
      'boxes',
      RND.item([
        'There are several boxes in one corner here.',
        'This room has a number of boxes of various sizes.',
        'A bunch of boxes are strewn about here.',
        'There are many wooden crates here.',
      ]),
      true,
    ),
    new RoomFeature('bookcase', 'There is a bookcase here.', true),
    new RoomFeature('table', 'There is a table here.', false),
    new RoomFeature(
      'chair',
      RND.item([
        `There is a ${RND.item(['broken', 'busted', 'simple', 'turned-over'])} chair here.`,
        `There is ${RND.item(['an ornate', 'a decorated', 'a carved'])} chair here.`,
      ]),
      false,
    ),
    new RoomFeature('bench', 'There is a bench here.', false),
    new RoomFeature(
      'chest',
      'There is ' +
        RND.item(['an ornate', 'a simple', 'a large', 'an iron-bound', 'a small']) +
        ' chest here.',
      true,
    ),
  ];
}

export function random(): RoomFeature {
  let features = all();

  return RND.item(features);
}
