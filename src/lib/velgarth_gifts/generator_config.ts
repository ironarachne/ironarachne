import type GiftPossibility from "./gift_possibility";

export default interface GiftGeneratorConfig {
  possibilities: GiftPossibility[];
  max_gifts: number;
  min_gifts: number;
}
