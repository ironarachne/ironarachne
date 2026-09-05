import { defineRulesDataSource } from '../ruleset_sources';

/**
 * The exact open rules reference used by this release.
 *
 * For Gold & Glory 2.0.1 designates the entire work as Open Game Content except its trademarks,
 * artwork, and trade dress. This package uses only numerical mechanics and independently written
 * code; it does not use those reserved elements or claim compatibility under the separate CSL.
 */
export const ADND_2E_OPEN_RULES_SOURCE = defineRulesDataSource({
  id: 'for-gold-and-glory.2.0.1',
  title: "For Gold & Glory: The Adventurer's Compendium",
  version: '2.0.1 (6 June 2016)',
  publisher: 'Justen Brown',
  url: 'https://www.drivethrurpg.com/en/product/156530/for-gold-glory',
  grant: {
    id: 'ogl-1.0a',
    name: 'Open Game License Version 1.0a',
    url: 'https://opengamingfoundation.org/ogl.html',
    scope: 'open-content',
    notice:
      'Open Game License v 1.0a Copyright 2000, Wizards of the Coast, Inc. ' +
      'System Reference Document Copyright 2000-2003, Wizards of the Coast, Inc.; ' +
      'Authors Jonathan Tweet, Monte Cook, Skip Williams, Rich Baker, Andy Collins, David Noonan, ' +
      'Rich Redman, Bruce R. Cordell, John D. Rateliff, Thomas Reid, James Wyatt, based on ' +
      'original material by E. Gary Gygax and Dave Arneson. ' +
      'For Gold & Glory™, Copyright 2014; Justen Brown.',
  },
  attribution:
    'For Gold & Glory 2.0.1 by Justen Brown, with contributions and editing by Moses Wildermuth, Chris Knowles, and Dan Hyland.',
  redistributable: true,
});
