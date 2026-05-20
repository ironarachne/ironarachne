export type ReligionDimensionId =
  | 'ritual'
  | 'experiential'
  | 'mythological'
  | 'doctrinal'
  | 'ethical'
  | 'institutional'
  | 'material';

export const ALL_RELIGION_DIMENSION_IDS: ReligionDimensionId[] = [
  'ritual',
  'experiential',
  'mythological',
  'doctrinal',
  'ethical',
  'institutional',
  'material',
];

export type RitualPracticeKind =
  | 'prayer'
  | 'meditation'
  | 'chanting'
  | 'fasting'
  | 'sacrifice'
  | 'initiation_rite'
  | 'seasonal_festival'
  | 'pilgrimage'
  | 'silent_vigil'
  | 'communal_meal';

export type ReligionRitualDimension = {
  gatheringCadence: string;
  primaryPractices: RitualPracticeKind[];
  isLeaderLed: boolean;
  gatheringPlaceKind: string;
  summary: string;
};

export type ExperientialEmphasis = 'mystical' | 'conversion' | 'vision' | 'mixed' | 'restrained';

export type ReligionExperientialDimension = {
  emphasis: ExperientialEmphasis;
  summary: string;
};

export type MythStoryKind = 'creation' | 'hero' | 'apocalyptic' | 'moral' | 'cosmological';

export type ReligionMythologicalDimension = {
  storyKinds: MythStoryKind[];
  centralMythSummary: string;
};

export type DoctrinalAuthority =
  | 'scripture'
  | 'tradition'
  | 'revelation'
  | 'syncretic'
  | 'rational';

export type ReligionDoctrinalDimension = {
  authority: DoctrinalAuthority;
  hasFormalCreed: boolean;
  scriptureCharacter: string | null;
  summary: string;
};

export type EthicalFraming =
  | 'reciprocity'
  | 'divine_command'
  | 'virtue'
  | 'community_harmony'
  | 'karma_like'
  | 'law_code';

export type ReligionEthicalDimension = {
  framing: EthicalFraming;
  precepts: string[];
  forbiddenActs: string[];
  summary: string;
};

export type InstitutionalStructure = 'hierarchical' | 'congregational' | 'diffuse';

export type ReligionInstitutionalDimension = {
  structure: InstitutionalStructure;
  roles: string[];
  summary: string;
};

export type ReligionMaterialDimension = {
  sacredObjects: string[];
  sacredSpaces: string[];
  iconographyNotes: string;
  summary: string;
};

export type ReligionDimensionById = {
  ritual: ReligionRitualDimension;
  experiential: ReligionExperientialDimension;
  mythological: ReligionMythologicalDimension;
  doctrinal: ReligionDoctrinalDimension;
  ethical: ReligionEthicalDimension;
  institutional: ReligionInstitutionalDimension;
  material: ReligionMaterialDimension;
};

/** Omitted keys mean that dimension was not generated (excluded). */
export type ReligionDimensions = {
  [K in ReligionDimensionId]?: ReligionDimensionById[K];
};

export type ReligionDimensionHints = {
  ritual?: {
    favoredPractices?: RitualPracticeKind[];
    preferLeaderLed?: boolean;
  };
  experiential?: {
    favoredEmphases?: ExperientialEmphasis[];
  };
  mythological?: {
    favoredStoryKinds?: MythStoryKind[];
  };
  doctrinal?: {
    favoredAuthorities?: DoctrinalAuthority[];
  };
  ethical?: {
    favoredFramings?: EthicalFraming[];
  };
  institutional?: {
    favoredStructures?: InstitutionalStructure[];
  };
  material?: {
    emphasizeSacredObjects?: boolean;
  };
};

export type ReligionDimensionGenerationConfig = {
  /** If set, only these dimensions appear in output. */
  includedDimensions?: ReligionDimensionId[];
  /** Ignored when `includedDimensions` is set. Dimensions listed here are omitted from output. */
  excludedDimensions?: ReligionDimensionId[];
  ritual?: Partial<ReligionRitualDimension>;
  experiential?: Partial<ReligionExperientialDimension>;
  mythological?: Partial<ReligionMythologicalDimension>;
  doctrinal?: Partial<ReligionDoctrinalDimension>;
  ethical?: Partial<ReligionEthicalDimension>;
  institutional?: Partial<ReligionInstitutionalDimension>;
  material?: Partial<ReligionMaterialDimension>;
};
