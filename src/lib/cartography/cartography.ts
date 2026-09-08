import type { Cartography, StrokeWeight } from './cartography_types';
import { BOUNDARY_EDGES } from './edges';

/** Sepia ink on parchment, shared by every drawing pass. Widths are in map units. */
export const CARTOGRAPHY: Cartography = {
  ground: { fill: '#ede4d3', grainFilterId: 'paperGrain', grainOpacity: 0.12 },
  palette: {
    body: { color: '#4a3d32', opacity: 1 },
    secondary: { color: '#786451', opacity: 1 },
    text: { color: '#2a1d12', opacity: 1 },
    water: { color: '#4a3d32', opacity: 1 },
  },
  edges: BOUNDARY_EDGES,
};

export const STROKE_WIDTHS: Record<StrokeWeight, number> = {
  hairline: 0.08,
  fine: 0.12,
  medium: 0.2,
  heavy: 0.36,
};

/** Temporary, uniform sepia wash for the existing region fills; #232/#233 remove those passes. */
export const INK_WASH = '#ded3c1';
/** Mask luminance is coverage, independent of the visible palette. */
export const MASK_PAINT = { hidden: 'black', visible: 'white', taper: 'rgb(210,210,210)' };

/** SVG displacement scale is a full signed range on each axis. */
export const INK_EDGE_DISPLACEMENT_SCALE = 0.28;
export const INK_EDGE_MAX_OFFSET = (Math.SQRT2 * INK_EDGE_DISPLACEMENT_SCALE) / 2;

/** Keep one map-sized displacement buffer per layer and the existing single-octave grain. */
export function cartographyFilterDefs(width: number, height: number): string {
  return `<filter id="${CARTOGRAPHY.ground.grainFilterId}" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" seed="42"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.38  0 0 0 ${CARTOGRAPHY.ground.grainOpacity} 0" in="noise" result="colored"/>
    <feBlend in="SourceGraphic" in2="colored" mode="multiply"/>
  </filter>
  <filter id="inkEdge" filterUnits="userSpaceOnUse" x="-1" y="-1" width="${width + 2}" height="${height + 2}">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="turb"/>
    <feDisplacementMap in="SourceGraphic" in2="turb" scale="${INK_EDGE_DISPLACEMENT_SCALE}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;
}

export function parchmentRect(width: number, height: number): string {
  return `<rect width="${width}" height="${height}" fill="${CARTOGRAPHY.ground.fill}" filter="url(#${CARTOGRAPHY.ground.grainFilterId})"/>`;
}
