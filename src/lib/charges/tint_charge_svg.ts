/**
 * Recolor standard charge artwork (white body, black line) to a flat fill. Used
 * by heraldry (tincture) and merchant marks (dye hex).
 */
export function tintChargeSvg(fillHex: string, styleIdSuffix: string, chargeSvg: string): string {
  /** Line art on sable fill: neutral grey so the charge does not read as argent-outlined. */
  const outlineHex = fillHex === '#000000' ? '#808080' : '#000000';

  let svgResult = chargeSvg;
  svgResult = svgResult.replaceAll('#010101', 'TEMP_CHARGE_OUTLINE_PLACEHOLDER');
  svgResult = svgResult.replaceAll('#000000', 'TEMP_CHARGE_OUTLINE_PLACEHOLDER');
  svgResult = svgResult.replaceAll('fill="black"', 'fill="TEMP_CHARGE_OUTLINE_PLACEHOLDER"');
  svgResult = svgResult.replaceAll('#FFFFFF', fillHex);
  svgResult = svgResult.replaceAll('#ffffff', fillHex);
  svgResult = svgResult.replaceAll('fill="white"', `fill="${fillHex}"`);
  svgResult = svgResult.replaceAll('TEMP_CHARGE_OUTLINE_PLACEHOLDER', outlineHex);

  svgResult = svgResult.replaceAll('st0', `st0-${styleIdSuffix}`);
  svgResult = svgResult.replaceAll('st1', `st1-${styleIdSuffix}`);

  return svgResult;
}
