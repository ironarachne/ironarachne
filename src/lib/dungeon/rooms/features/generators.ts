import * as RNG from '@ironarachne/rng';
import RoomFeatureGenerator from './featuregenerator.js';

function all(rng: RNG.RNG): RoomFeatureGenerator[] {
  return [
    new RoomFeatureGenerator(
      'boxes',
      [
        'There are several boxes in one corner here.',
        'This room has a number of boxes of various sizes.',
        'A bunch of boxes are strewn about here.',
        'There are many wooden crates here.',
      ],
      [],
      true,
      rng,
    ),
    new RoomFeatureGenerator('bookcase', ['There is a bookcase here.'], [], true, rng),
    new RoomFeatureGenerator('table', ['There is a table here.'], [], false, rng),
    new RoomFeatureGenerator(
      'chair',
      [
        `There is a ${rng.item(['broken', 'busted', 'simple', 'turned-over'])} chair here.`,
        `There is ${rng.item(['an ornate', 'a decorated', 'a carved'])} chair here.`,
      ],
      [],
      false,
      rng,
    ),
    new RoomFeatureGenerator('bench', ['There is a bench here.'], [], false, rng),
    new RoomFeatureGenerator(
      'chest',
      [
        'There is ' +
          rng.item(['an ornate', 'a simple', 'a large', 'an iron-bound', 'a small']) +
          ' chest here.',
      ],
      [],
      true,
      rng,
    ),
  ];
}
