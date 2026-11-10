export type SizeRange = readonly [min: number, max: number];

export type AdultBodySize = {
  height: SizeRange;
  length: SizeRange;
  mass: SizeRange;
};
