/**
 * The result of the DCC source review, deliberately not a production `RulesDataSource`.
 *
 * Goodman Games advertises a free third-party programme, but the public material directs a
 * publisher to apply for a formal licence. Iron Arachne has no accepted agreement to record, and
 * the Quick Start Rules open only SRD-derived creature-stat portions. Keeping this object outside
 * `defineRulesDataSource` makes that absence impossible to mistake for redistribution approval.
 */
export const DCC_SOURCE_REVIEW = {
  id: 'goodman-games.dcc-third-party-programme',
  title: 'Dungeon Crawl Classics third-party publishing programme',
  publisher: 'Goodman Games',
  reviewedAt: '2026-09-05',
  status: 'blocked-pending-written-permission',
  redistributable: false,
  publicProgrammeUrl: 'https://goodman-games.com/third-party-publisher-hub/',
  quickStartUrl: 'https://goodman-games.com/wp-content/uploads/2020/03/DCC_QSR_Free.pdf',
  findings: [
    'The programme requires a publisher to obtain a formal Goodman Games licence and approval.',
    'No accepted Iron Arachne agreement or versioned licence text is present in the repository.',
    'The Quick Start Rules reserve DCC-specific terms and tables as Product Identity.',
    'The Quick Start Rules designate only SRD-derived portions of creature statistics as Open Game Content.',
  ],
  enablementRequirements: [
    'Record the exact accepted Goodman Games agreement and its version.',
    'Record its permitted content scope, attribution, logo, and approval conditions.',
    'Audit every admitted production row and algorithm against that grant.',
  ],
} as const;
