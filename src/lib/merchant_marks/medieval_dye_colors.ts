/**
 * Small palette of colors plausible for medieval dyes and simple trade marks (not full heraldic tinctures).
 */
export type MedievalDyeSwatch = {
  name: string;
  hex: string;
  commonality: number;
};

export const MEDIEVAL_DYE_SWATCHES: MedievalDyeSwatch[] = [
  { name: 'madder red', hex: '#8B2942', commonality: 18 },
  { name: 'woad blue', hex: '#2B4A6F', commonality: 16 },
  { name: 'weld yellow', hex: '#C9A227', commonality: 14 },
  { name: 'iron black', hex: '#1A1A1A', commonality: 12 },
  { name: 'walnut brown', hex: '#5C3D2E', commonality: 14 },
  { name: 'undivided linen', hex: '#E8E0D4', commonality: 10 },
  { name: 'woad green', hex: '#2D4A3E', commonality: 10 },
  { name: 'Brazilwood pink', hex: '#A85C6A', commonality: 8 },
  { name: 'oak galls gray', hex: '#6B6560', commonality: 10 },
  { name: 'saffron gold', hex: '#B8860B', commonality: 8 },
];

export function allMedievalDyeSwatches(): MedievalDyeSwatch[] {
  return MEDIEVAL_DYE_SWATCHES;
}
