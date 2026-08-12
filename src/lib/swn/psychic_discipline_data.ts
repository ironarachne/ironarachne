/**
 * The signature power each psychic discipline grants, and the stronger version it becomes at
 * level 1. A character with the discipline as a skill gets the matching entry; at level 1 they
 * also learn one random ability drawn from that discipline.
 */
export type PsychicDisciplinePower = {
  skillName: string;
  levelZero: string;
  levelOne: string;
  /** Metapsionics alone also raises the character's maximum Effort at level 1. */
  raisesMaximumEffort?: boolean;
};

export const PSYCHIC_DISCIPLINE_POWERS: PsychicDisciplinePower[] = [
  {
    skillName: 'Biopsionics',
    levelZero:
      'Psychic Succor-0: The psychic’s touch can automatically stabilize a mortally-wounded target as a Main Action. This power must be used on a target within six rounds of their collapse, and does not function on targets that have been decapitated or killed by Heavy weapons. It’s the GM’s decision as to whether a target is intact enough for this power to work.',
    levelOne:
      'Psychic Succor-1: The psychic’s touch can automatically stabilize a mortally-wounded target as a Main Action. This power must be used on a target within six rounds of their collapse, and does not function on targets that have been decapitated or killed by Heavy weapons. It’s the GM’s decision as to whether a target is intact enough for this power to work. Also heal 1d6+1 hit points of damage. If used on a mortally-wounded target, they revive with the rolled hit points and can act normally on the next round.',
  },
  {
    skillName: 'Metapsionics',
    levelZero:
      'Psychic Refinement-0: The adept can visually and audibly detect the use of psychic powers. If both the source and target are visible to the metapsion, they can tell who’s using the power, even if it’s normally imperceptible. They gain a +2 bonus on any saving throw versus a psionic power.',
    levelOne:
      'Psychic Refinement-1: The adept can visually and audibly detect the use of psychic powers. If both the source and target are visible to the metapsion, they can tell who’s using the power, even if it’s normally imperceptible. They gain a +2 bonus on any saving throw versus a psionic power. The metapsion’s maximum Effort increases by an additional point.',
    raisesMaximumEffort: true,
  },
  {
    skillName: 'Precognition',
    levelZero:
      'Oracle-0: The precog gains a progressively-greater intuitive understanding of their own future. Each invocation of the Oracle technique requires a Main Action and that the user Commit Effort for the day. Once triggered, the adept gets a single brief vision related to the question about the future that they’re asking. This vision is always from their own personal vantage point and never reveals more than a minute of insight, though the psychic processes it almost instantly as part of the power’s use. Range: One minute into the future.',
    levelOne:
      'Oracle-1: The precog gains a progressively-greater intuitive understanding of their own future. Each invocation of the Oracle technique requires a Main Action and that the user Commit Effort for the day. Once triggered, the adept gets a single brief vision related to the question about the future that they’re asking. This vision is always from their own personal vantage point and never reveals more than a minute of insight, though the psychic processes it almost instantly as part of the power’s use. Range: One day into the future.',
  },
  {
    skillName: 'Telekinesis',
    levelZero:
      'Telekinetic Manipulation-0: The psychic can exert force as if with one hand and their own strength.',
    levelOne:
      'Telekinetic Manipulation-1: The psychic can manipulate objects as if with both hands and can lift up to two hundred kilograms with this ability.',
  },
  {
    skillName: 'Telepathy',
    levelZero:
      'Telepathic Contact-0: Observe emotional states in a target. Intense emotions provide a single word or image related to the focus of the feelings.',
    levelOne:
      'Telepathic Contact-1: A shallow gestalt with the target’s language centers allows the telepath to understand any form of communication made by the target. If the psychic has the requisite body parts to speak the target’s language, they can communicate with it in turn.',
  },
  {
    skillName: 'Teleportation',
    levelZero: 'Personal Apportation-0: The psychic can teleport up to 10 meters.',
    levelOne: 'Personal Apportation-1: The psychic can teleport up to 100 meters.',
  },
];
