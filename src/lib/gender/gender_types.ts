export type Gender = {
  name: string;
  pronouns: PronounSet;
}

export type PronounSet = {
  subjective: string; // he/she/they
  objective: string; // him/her/them
  possessive: string; // his/her/their
  reflexive: string; // himself/herself/themselves
}
