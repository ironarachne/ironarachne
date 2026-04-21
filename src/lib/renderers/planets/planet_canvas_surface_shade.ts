import { fbm, fbmMap } from '$lib/renderers/planets/planet_canvas_surface_noise';
import { isGasGiantPlanetClassification } from '$lib/renderers/astronomical/planet_canvas_classification';
import type { PlanetCanvasTheme } from '$lib/renderers/astronomical/planet_canvas_theme';
import type RGBColor from '$lib/graphics/rgb_color';

const GAMMA = 1 / 2.2;

function rotate2d(angle: number, x: number, y: number): [number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * x - s * y, s * x + c * y];
}

function dot3(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize3(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 1e-10) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function add3(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale3(v: [number, number, number], s: number): [number, number, number] {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function reflect3(incident: [number, number, number], normal: [number, number, number]): [number, number, number] {
  const d = dot3(incident, normal);
  return [
    incident[0] - 2 * d * normal[0],
    incident[1] - 2 * d * normal[1],
    incident[2] - 2 * d * normal[2],
  ];
}

function rgbToTriplet(c: RGBColor): [number, number, number] {
  return [c.r, c.g, c.b];
}

function mix3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const k = Math.max(0, Math.min(1, t));
  return [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function calcNormalFromMap(pos: [number, number, number], eps: number): [number, number, number] {
  const dx = fbmMap(pos[0] + eps, pos[1], pos[2]) - fbmMap(pos[0] - eps, pos[1], pos[2]);
  const dy = fbmMap(pos[0], pos[1] + eps, pos[2]) - fbmMap(pos[0], pos[1] - eps, pos[2]);
  const dz = fbmMap(pos[0], pos[1], pos[2] + eps) - fbmMap(pos[0], pos[1], pos[2] - eps);
  return normalize3([dx, dy, dz]);
}

export type PlanetShadeParams = {
  seedFloat: number;
  lightDir: [number, number, number];
  cloudCoverage: number;
  stormActivity: number;
};

/**
 * Gas giants: banding + storms (ported from `gas_giant_planet.frag`).
 * All other types: multi-scale FBM albedo on the sphere (no horizontal striped-giant structure).
 */
export function shadePlanetDiskPixel(
  offsetX: number,
  offsetY: number,
  planetRadiusPx: number,
  theme: PlanetCanvasTheme,
  params: PlanetShadeParams,
  classification: string,
): [number, number, number] {
  if (isGasGiantPlanetClassification(classification)) {
    return shadeGasGiantDiskPixel(offsetX, offsetY, planetRadiusPx, theme, params);
  }
  return shadeTerrestrialDiskPixel(offsetX, offsetY, planetRadiusPx, theme, params);
}

function shadeTerrestrialDiskPixel(
  offsetX: number,
  offsetY: number,
  planetRadiusPx: number,
  theme: PlanetCanvasTheme,
  params: PlanetShadeParams,
): [number, number, number] {
  const { seedFloat, lightDir, stormActivity, cloudCoverage } = params;

  const angle = seedFloat * 0.1;
  const [rx, ry] = rotate2d(angle, offsetX, offsetY);

  const x = rx / planetRadiusPx;
  const y = ry / planetRadiusPx;
  const r2 = x * x + y * y;
  if (r2 > 1.0000001) {
    return [0, 0, 0];
  }

  const z = Math.sqrt(Math.max(0, 1 - r2));
  const wsNormal: [number, number, number] = [x, y, z];
  const wsPosition: [number, number, number] = wsNormal;

  const wBase = rgbToTriplet(theme.main);
  const lBase = rgbToTriplet(theme.band1);
  const mBase = rgbToTriplet(theme.band2);

  const noiseCoord = scale3(wsPosition, 2);
  const P: [number, number, number] = [
    noiseCoord[0] + seedFloat / 100,
    noiseCoord[1] + seedFloat / 100,
    noiseCoord[2] + seedFloat / 100,
  ];

  const nMacro = fbm(P[0], P[1], P[2], 5, 0.5, 2.1, 1.5);
  const nMeso = fbm(P[0] * 1.9 + 2.1, P[1] * 1.9 - 1.3, P[2] * 1.9 + 0.7, 4, 0.48, 2.4, 1.25);
  const nFine = fbm(P[0] * 5 + 0.2, P[1] * 5 - 0.4, P[2] * 5 + 0.9, 3, 0.45, 2.8, 1);

  const macroMix = smoothstep(0.12, 0.88, nMacro);
  let planetColor = mix3(wBase, lBase, macroMix);

  const mesoBlend = smoothstep(0.2, 0.78, nMeso) * (0.35 + 0.55 * stormActivity);
  planetColor = mix3(planetColor, mBase, mesoBlend);

  const grain = 0.06 * cloudCoverage * (nFine - 0.5);
  planetColor = [
    Math.min(1.1, Math.max(0, planetColor[0] * (1 + grain))),
    Math.min(1.1, Math.max(0, planetColor[1] * (1 + grain))),
    Math.min(1.1, Math.max(0, planetColor[2] * (1 + grain))),
  ];

  const capBlend = smoothstep(0.45, 0.98, Math.abs(y));
  const polar = mix3(planetColor, mix3(wBase, [0.95, 0.95, 1], 0.25), capBlend * 0.12);
  planetColor = polar;

  const epsNormal = 0.042;
  const gradN = calcNormalFromMap(wsPosition, epsNormal);
  const bumpScale = 0.32;
  const wsSurfaceNormal = normalize3(add3(scale3(gradN, bumpScale), scale3(wsNormal, 16)));

  return finishLitPlanetSurface(planetColor, wsNormal, wsSurfaceNormal, lightDir, wBase);
}

function shadeGasGiantDiskPixel(
  offsetX: number,
  offsetY: number,
  planetRadiusPx: number,
  theme: PlanetCanvasTheme,
  params: PlanetShadeParams,
): [number, number, number] {
  const { seedFloat, lightDir, stormActivity, cloudCoverage } = params;

  const angle = seedFloat * 0.1;
  const [rx, ry] = rotate2d(angle, offsetX, offsetY);

  const x = rx / planetRadiusPx;
  const y = ry / planetRadiusPx;
  const r2 = x * x + y * y;
  if (r2 > 1.0000001) {
    return [0, 0, 0];
  }

  const z = Math.sqrt(Math.max(0, 1 - r2));
  const wsNormal: [number, number, number] = [x, y, z];
  const wsPosition: [number, number, number] = wsNormal;

  const wBase = rgbToTriplet(theme.main);
  let lBase = rgbToTriplet(theme.band1);
  let mBase = rgbToTriplet(theme.band2);
  let cBase = [...wBase] as [number, number, number];

  const pType = fract11(seedFloat * 0.98765);
  const fractSeed = fract11(seedFloat);
  let baseFreq = 8;
  let turbulence = 0.18 * mix(0.7, 1.3, stormActivity);
  let wispStrength = 0.1 * mix(0.5, 1.2, cloudCoverage);
  let hasSpots = 1;
  let bandSmoothness = 0.01;

  if (pType < 0.25) {
    baseFreq = 12 + fractSeed * 8;
    turbulence = (0.25 + fract11(seedFloat * 1.5) * 0.1) * mix(0.85, 1.2, stormActivity);
    wispStrength = 0;
    bandSmoothness = 0.02;
    cBase = mix3(mBase, [1, 0.8, 0.6], 0.3);
  } else if (pType < 0.5) {
    baseFreq = 16 + fractSeed * 10;
    turbulence = 0.05;
    wispStrength = 0.05 * cloudCoverage;
    hasSpots = 0;
    bandSmoothness = 0.15;
    lBase = mix3(wBase, lBase, 0.4);
    mBase = mix3(wBase, mBase, 0.4);
    cBase = mix3(wBase, [1, 1, 1], 0.1);
  } else if (pType < 0.75) {
    baseFreq = 4;
    turbulence = 0.02;
    wispStrength = 0.12 * cloudCoverage;
    hasSpots = 0;
    bandSmoothness = 0.3;
    lBase = mix3(wBase, lBase, 0.1);
    mBase = mix3(wBase, mBase, 0.1);
    cBase = mix3(wBase, [1, 1, 1], 0.15);
  } else {
    baseFreq = 6 + fractSeed * 4;
    turbulence = 0.12 * mix(0.8, 1.3, stormActivity);
    wispStrength = 0.35 * cloudCoverage;
    hasSpots = 0.8;
    bandSmoothness = 0.08;
    lBase = mix3(wBase, [0, 0, 0], 0.2);
    mBase = mix3(mBase, [0, 0, 0], 0.2);
    cBase = mix3(wBase, [1, 1, 1], 0.35);
  }

  const noiseCoord = scale3(wsPosition, 2);
  const seededNoiseCoord: [number, number, number] = [
    noiseCoord[0] + seedFloat / 100,
    noiseCoord[1] + seedFloat / 100,
    noiseCoord[2] + seedFloat / 100,
  ];

  const noiseSample1 = fbm(
    seededNoiseCoord[0],
    seededNoiseCoord[1],
    seededNoiseCoord[2],
    6,
    0.5,
    2,
    4,
  );
  const noiseSample2 = fbm(
    seededNoiseCoord[0],
    seededNoiseCoord[1],
    seededNoiseCoord[2],
    6,
    0.5,
    4,
    4,
  );

  const spotNoise1 = fbm(
    seededNoiseCoord[0] * 3,
    seededNoiseCoord[1] * 3,
    seededNoiseCoord[2] * 3,
    4,
    0.5,
    2,
    1,
  );
  const spotNoise2 = fbm(
    seededNoiseCoord[0] * 4 + 10,
    seededNoiseCoord[1] * 4 + 10,
    seededNoiseCoord[2] * 4 + 10,
    4,
    0.5,
    2,
    1,
  );

  const spotCoords1X = x - 0.2;
  const spotCoords1Y = (y - -0.2) * 1.8;
  const spotDist1 = Math.hypot(spotCoords1X, spotCoords1Y);
  const spotMask1 =
    1 -
    smoothstep(0.1, 0.25, spotDist1 + spotNoise1 * 0.1);

  const spotCoords2X = x - -0.4;
  const spotCoords2Y = (y - 0.4) * 2.2;
  const spotDist2 = Math.hypot(spotCoords2X, spotCoords2Y);
  const spotMask2 =
    1 -
    smoothstep(0.05, 0.15, spotDist2 + spotNoise2 * 0.1);

  const stormMask = Math.max(spotMask1, spotMask2) * hasSpots;

  const amplitude = turbulence + noiseSample1 * (turbulence * 0.5);
  const frequency = baseFreq + noiseSample2;

  const warpedY = y + stormMask * 0.1 * Math.sign(y || 1);
  const dynamicSmoothness = bandSmoothness + noiseSample2 * 0.1;

  const bandValue1 = smoothstep(
    0.15 - dynamicSmoothness,
    0.15 + dynamicSmoothness,
    Math.abs(amplitude * Math.sin(warpedY * frequency) + Math.pow(noiseSample1, 1.5)),
  );
  const bandValue2 = smoothstep(
    0.15 - dynamicSmoothness,
    0.15 + dynamicSmoothness,
    Math.abs(amplitude * Math.sin(warpedY * frequency * 1.35) + Math.pow(noiseSample1, 1.5)),
  );
  const bandValue3 = smoothstep(
    0.1 - dynamicSmoothness,
    0.1 + dynamicSmoothness,
    Math.abs(amplitude * Math.sin(warpedY * frequency * 1.75) + Math.pow(noiseSample1, 1.5)),
  );

  let planetColor = mix3(wBase, lBase, bandValue1);
  planetColor = mix3(planetColor, mBase, bandValue2);
  planetColor = mix3(planetColor, lBase, bandValue3);
  planetColor = mix3(planetColor, cBase, stormMask * 0.9);

  const wispMap = fbm(
    seededNoiseCoord[0] * 1.5,
    seededNoiseCoord[1] * 8,
    seededNoiseCoord[2] * 1.5,
    5,
    0.5,
    2,
    1,
  );
  const wispMask = smoothstep(0.5 - bandSmoothness, 0.7 + bandSmoothness, wispMap);
  planetColor = mix3(planetColor, cBase, wispMask * wispStrength);

  const epsNormal = 0.035;
  const gradN = calcNormalFromMap(wsPosition, epsNormal);
  const wsSurfaceNormal = normalize3(add3(gradN, scale3(wsNormal, 16)));

  return finishLitPlanetSurface(planetColor, wsNormal, wsSurfaceNormal, lightDir, wBase);
}

function finishLitPlanetSurface(
  planetColor: [number, number, number],
  wsNormal: [number, number, number],
  wsSurfaceNormal: [number, number, number],
  lightDir: [number, number, number],
  wBase: [number, number, number],
): [number, number, number] {
  const wsLightDir = normalize3(lightDir);
  const wrap = 0.05;
  const dp = Math.max(0, (dot3(wsLightDir, wsSurfaceNormal) + wrap) / (1 + wrap));

  const lightColor = mix3([0.25, 0, 0], [0.75, 0.75, 0.75], smoothstep(0.05, 0.5, dp));
  const ambient: [number, number, number] = [0.002, 0.002, 0.002];
  const diffuse: [number, number, number] = scale3(lightColor, dp);

  const wsViewDir: [number, number, number] = [0, 0, 1];
  const rSpec = normalize3(reflect3(scale3(wsLightDir, -1), wsSurfaceNormal));
  const specParamsY = 8;
  let phongValue = Math.max(0, dot3(wsViewDir, rSpec));
  phongValue = Math.pow(phongValue, specParamsY);
  const specular = scale3([phongValue, phongValue, phongValue], 0.15 * dp);

  let planetShading: [number, number, number] = [
    planetColor[0] * (diffuse[0] + ambient[0]) + specular[0],
    planetColor[1] * (diffuse[1] + ambient[1]) + specular[1],
    planetColor[2] * (diffuse[2] + ambient[2]) + specular[2],
  ];

  const viewNormal = wsNormal;
  let fresnel = 1 - smoothstep(0.1, 1, viewNormal[2]);
  fresnel = Math.pow(Math.max(0, fresnel), 8) * dp;
  planetShading = mix3(planetShading, scale3(wBase, 1.5), fresnel);

  return [
    Math.pow(Math.max(0, planetShading[0]), GAMMA),
    Math.pow(Math.max(0, planetShading[1]), GAMMA),
    Math.pow(Math.max(0, planetShading[2]), GAMMA),
  ];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function fract11(x: number): number {
  return x - Math.floor(x);
}
