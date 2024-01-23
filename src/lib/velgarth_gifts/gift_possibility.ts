import type GiftStrengthLevel from "./gift_strength_level";

export default interface GiftPossibility {
  name: string;
  description: string;
  commonality: number;
  strength_levels: GiftStrengthLevel[];
}
