import type PronounSet from "./pronounSet";

export default interface Gender {
  name: string;
  pronouns: PronounSet;
}
