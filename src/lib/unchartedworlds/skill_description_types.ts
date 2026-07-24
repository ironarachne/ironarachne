/** A run of prose lines within a skill description. */
export type SkillDescriptionTextBlock = {
  kind: 'text';
  text: string;
};

/** A consecutive run of bulleted choices within a skill description. */
export type SkillDescriptionOptionsBlock = {
  kind: 'options';
  items: string[];
};

export type SkillDescriptionBlock = SkillDescriptionTextBlock | SkillDescriptionOptionsBlock;
