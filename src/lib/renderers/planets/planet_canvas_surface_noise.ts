/** Deterministic value noise / FBM for Canvas2D planet shading (inspired by gas giant fragment shader). */

function fract(x: number): number {
  return x - Math.floor(x);
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Scalar hash for lattice point (i,j,k). */
function hashScalar(ix: number, iy: number, iz: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7 + iz * 74.7 + 19.19) * 43758.5453123;
  return fract(n);
}

function valueNoise3(x: number, y: number, z: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const tx = x - x0;
  const ty = y - y0;
  const tz = z - z0;
  const u = tx * tx * (3 - 2 * tx);
  const v = ty * ty * (3 - 2 * ty);
  const w = tz * tz * (3 - 2 * tz);

  const c000 = hashScalar(x0, y0, z0);
  const c001 = hashScalar(x0, y0, z0 + 1);
  const c010 = hashScalar(x0, y0 + 1, z0);
  const c011 = hashScalar(x0, y0 + 1, z0 + 1);
  const c100 = hashScalar(x0 + 1, y0, z0);
  const c101 = hashScalar(x0 + 1, y0, z0 + 1);
  const c110 = hashScalar(x0 + 1, y0 + 1, z0);
  const c111 = hashScalar(x0 + 1, y0 + 1, z0 + 1);

  const c00 = mix(c000, c100, u);
  const c01 = mix(c001, c101, u);
  const c10 = mix(c010, c110, u);
  const c11 = mix(c011, c111, u);
  const c0 = mix(c00, c10, v);
  const c1 = mix(c01, c11, v);
  return mix(c0, c1, w);
}

/** ~ openSimplex .w style output mapped to roughly -1..1 */
function noiseSample3(x: number, y: number, z: number): number {
  return valueNoise3(x, y, z) * 2 - 1;
}

export function fbm(
  px: number,
  py: number,
  pz: number,
  octaves: number,
  persistence: number,
  lacunarity: number,
  exponentiation: number,
): number {
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  let normalization = 0;
  for (let i = 0; i < octaves; i++) {
    const noiseValue = noiseSample3(px * frequency, py * frequency, pz * frequency);
    total += noiseValue * amplitude;
    normalization += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  total /= normalization;
  total = total * 0.5 + 0.5;
  total = Math.pow(Math.max(0, total), exponentiation);
  return total;
}

/** SDF map for bump normal — same structure as `map()` in gas giant shader. */
export function fbmMap(px: number, py: number, pz: number): number {
  return fbm(px, py, pz, 6, 0.5, 2, 4);
}
