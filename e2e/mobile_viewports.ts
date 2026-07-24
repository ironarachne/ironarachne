export type MobileViewport = {
  /** Project name suffix; also the label in test output. */
  name: string;
  width: number;
  height: number;
  /** Real device(s) this width stands in for, for the reader's benefit. */
  represents: string;
};

/**
 * Widths chosen to bracket the range real phones report as `width=device-width`
 * in CSS pixels. Anything between two of these is layout-equivalent to one of
 * them in practice, so this is a baseline, not an exhaustive device matrix.
 */
export const MOBILE_VIEWPORTS: MobileViewport[] = [
  { name: '320', width: 320, height: 568, represents: 'iPhone SE (1st gen), small Android' },
  { name: '360', width: 360, height: 800, represents: 'Galaxy S-series, most common Android' },
  { name: '375', width: 375, height: 667, represents: 'iPhone SE (2nd/3rd gen), iPhone 13 mini' },
  { name: '390', width: 390, height: 844, represents: 'iPhone 12/13/14/15' },
  { name: '430', width: 430, height: 932, represents: 'iPhone 15 Pro Max' },
];
