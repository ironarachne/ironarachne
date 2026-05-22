export type PageKind = 'hub' | 'generator' | 'static' | 'tool';

export type OutputCheck = 'canvas' | 'svg' | 'stats' | 'preview-image' | 'default';

export type PageEntry = {
  path: string;
  title: string;
  heading?: string;
  welcomeText?: string;
  kind: PageKind;
  outputCheck?: OutputCheck;
  generateButton?: RegExp;
  /** Longer waits for WebGL-heavy pages. */
  webgl?: boolean;
};

export const PAGE_MANIFEST: PageEntry[] = [
  {
    path: '/',
    title: 'Iron Arachne',
    welcomeText: 'Welcome to Iron Arachne!',
    kind: 'hub',
  },
  {
    path: '/changelog',
    title: 'Change Log | Iron Arachne',
    heading: 'Change Log',
    kind: 'static',
  },
  {
    path: '/characters',
    title: 'Characters & People | Iron Arachne',
    heading: 'Characters & People',
    kind: 'hub',
  },
  {
    path: '/factions',
    title: 'Factions & Groups | Iron Arachne',
    heading: 'Factions & Groups',
    kind: 'hub',
  },
  {
    path: '/locations',
    title: 'Locations & Places | Iron Arachne',
    heading: 'Locations & Places',
    kind: 'hub',
  },
  {
    path: '/objects',
    title: 'Objects & Items | Iron Arachne',
    heading: 'Objects & Items',
    kind: 'hub',
  },
  {
    path: '/utilities',
    title: 'Utilities & Reference | Iron Arachne',
    heading: 'Utilities & Reference',
    kind: 'hub',
  },
  {
    path: '/saved-data',
    title: 'Saved Data | Iron Arachne',
    heading: 'Saved Data',
    kind: 'static',
  },
  {
    path: '/character',
    title: 'Character | Iron Arachne',
    heading: 'Character',
    kind: 'generator',
  },
  {
    path: '/fantasy/adnd/character',
    title: 'AD&D 2e Character Generator | Iron Arachne',
    heading: 'AD&D 2e Character Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/adnd/character/build',
    title: 'AD&D 2e Character Builder | Iron Arachne',
    heading: 'AD&D 2e Character Builder',
    kind: 'static',
  },
  {
    path: '/fantasy/dcc/character',
    title: 'Dungeon Crawl Classics Character Generator | Iron Arachne',
    heading: 'Dungeon Crawl Classics Character Generator',
    kind: 'generator',
  },
  {
    path: '/swn/character',
    title: 'Stars Without Number Character Generator | Iron Arachne',
    heading: 'Stars Without Number Character Generator',
    kind: 'generator',
  },
  {
    path: '/unchartedworlds/character',
    title: 'Uncharted Worlds Character Generator | Iron Arachne',
    heading: 'Uncharted Worlds Character Generator',
    kind: 'generator',
  },
  {
    path: '/heraldry',
    title: 'Heraldry Generator | Iron Arachne',
    heading: 'Heraldry Generator',
    kind: 'generator',
    outputCheck: 'svg',
  },
  {
    path: '/velgarth-gifts',
    title: 'Velgarth Gifts Generator | Iron Arachne',
    heading: 'Velgarth Gifts Generator',
    kind: 'generator',
  },
  {
    path: '/arms-manufacturer',
    title: 'Arms Manufacturer Generator | Iron Arachne',
    heading: 'Arms Manufacturer Generator',
    kind: 'generator',
  },
  {
    path: '/culture',
    title: 'Culture Generator | Iron Arachne',
    heading: 'Culture Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/encounter',
    title: 'Encounter | Iron Arachne',
    heading: 'Encounter Generation',
    kind: 'generator',
  },
  {
    path: '/fantasy/family',
    title: 'Fantasy Family Generator | Iron Arachne',
    heading: 'Fantasy Family Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/organization',
    title: 'Organization Generator | Iron Arachne',
    heading: 'Organization Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/religion',
    title: 'Religion Generator | Iron Arachne',
    heading: 'Fantasy Religion Generator',
    kind: 'generator',
  },
  {
    path: '/star-nation',
    title: 'Star Nation Generator | Iron Arachne',
    heading: 'Star Nation Generator',
    kind: 'generator',
    outputCheck: 'preview-image',
    webgl: true,
  },
  {
    path: '/chop-shop',
    title: 'Chop Shop Generator | Iron Arachne',
    heading: 'Chop Shop Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/dungeon',
    title: 'Dungeon Generator | Iron Arachne',
    heading: 'Dungeon Generator',
    kind: 'generator',
    outputCheck: 'canvas',
  },
  {
    path: '/environment',
    title: 'Environment Generator | Iron Arachne',
    heading: 'Environment Generator',
    kind: 'generator',
  },
  {
    path: '/planet',
    title: 'Planet Generator | Iron Arachne',
    heading: 'Planet Generator',
    kind: 'generator',
    outputCheck: 'preview-image',
    webgl: true,
  },
  {
    path: '/region',
    title: 'Region Generator | Iron Arachne',
    heading: 'Region Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/settlement',
    title: 'Settlement Generator | Iron Arachne',
    heading: 'Settlement Generator',
    kind: 'generator',
  },
  {
    path: '/star-system',
    title: 'Star System Generator | Iron Arachne',
    heading: 'Star System Generator',
    kind: 'generator',
    outputCheck: 'preview-image',
    webgl: true,
  },
  {
    path: '/drug',
    title: 'Cyberpunk Drug Generator | Iron Arachne',
    heading: 'Drug Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/equipment',
    title: 'Fantasy Equipment Lists | Iron Arachne',
    heading: 'Fantasy Equipment Lists',
    kind: 'static',
  },
  {
    path: '/fantasy/equipment-generator',
    title: 'Equipment Generator | Iron Arachne',
    heading: 'Equipment Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/merchant',
    title: 'Fantasy Merchant Generator | Iron Arachne',
    heading: 'Fantasy Merchant Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/potion-generator',
    title: 'Potion Generator | Iron Arachne',
    heading: 'Potion Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/weapon',
    title: 'Magic Weapon Generator | Iron Arachne',
    heading: 'Magic Weapon Generator',
    kind: 'generator',
  },
  {
    path: '/fantasy/treasure-hoard',
    title: 'Treasure Hoard Generator | Iron Arachne',
    heading: 'Treasure Hoard Generator',
    kind: 'generator',
    generateButton: /^Generate Treasure Hoard/i,
  },
  {
    path: '/spooky-ship',
    title: 'Spooky Ship Generator | Iron Arachne',
    heading: 'Spooky Ship Generator',
    kind: 'generator',
  },
  {
    path: '/swn/starship',
    title: 'Stars Without Number Starship Generator | Iron Arachne',
    heading: 'Stars Without Number Starship Generator',
    kind: 'generator',
  },
  {
    path: '/language',
    title: 'Language Generator | Iron Arachne',
    heading: 'Language Generator',
    kind: 'tool',
  },
  {
    path: '/species-stats',
    title: 'Species Stats Tool | Iron Arachne',
    heading: 'Species Stats Tool',
    kind: 'tool',
    outputCheck: 'stats',
  },
  {
    path: '/word-generator-cheat-sheet',
    title: 'Word Generator Cheat Sheet | Iron Arachne',
    heading: 'Word Generator Cheat Sheet',
    kind: 'tool',
  },
];

export const GENERATE_TEST_PAGES = PAGE_MANIFEST.filter(
  (entry) => entry.kind === 'generator' || entry.kind === 'tool',
);
