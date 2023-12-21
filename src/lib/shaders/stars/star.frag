#ifdef GL_ES
precision mediump float;
#endif

uniform float corona_width;
uniform float seed;
uniform float star_radius;
uniform vec2 resolution;
uniform vec3 star_color;
uniform vec3 corona_color;
uniform vec3 glow_color;

varying vec2 vUvs;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

// The MIT License
// Copyright © 2013 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
//
// https://www.shadertoy.com/view/Xsl3Dl
vec3 hash3( vec3 p ) // replace this by something better
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
            dot(p,vec3(269.5,183.3,246.1)),
            dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

/**
 * OpenSimplex functions by KdotJPG
 * https://github.com/KdotJPG/OpenSimplex2
 */

// Inspired by Stefan Gustavson's noise
vec4 permute(vec4 t) {
    return t * (t * 34.0 + 133.0);
}

// Gradient set is a normalized expanded rhombic dodecahedron
vec3 grad(float hash) {

    // Random vertex of a cube, +/- 1 each
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;

    // Random edge of the three edges connected to that vertex
    // Also a cuboctahedral vertex
    // And corresponds to the face of its dual, the rhombic dodecahedron
    vec3 cuboct = cube;
    cuboct[int(hash / 16.0)] = 0.0;

    // In a funky way, pick one of the four points on the rhombic face
    float type = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));

    // Expand it so that the new edges are the same length
    // as the existing ones
    vec3 grad = cuboct * 1.22474487139 + rhomb;

    // To make all gradients the same length, we only need to shorten the
    // second type of vector. We also put in the whole noise scale constant.
    // The compiler should reduce it into the existing floats. I think.
    grad *= (1.0 - 0.042942436724648037 * type) * 32.80201376986577;

    return grad;
}

// BCC lattice split up into 2 cube lattices
vec4 openSimplex2Base(vec3 X) {

    // First half-lattice, closest edge
    vec3 v1 = round(X);
    vec3 d1 = X - v1;
    vec3 score1 = abs(d1);
    vec3 dir1 = step(max(score1.yzx, score1.zxy), score1);
    vec3 v2 = v1 + dir1 * sign(d1);
    vec3 d2 = X - v2;

    // Second half-lattice, closest edge
    vec3 X2 = X + 144.5;
    vec3 v3 = round(X2);
    vec3 d3 = X2 - v3;
    vec3 score2 = abs(d3);
    vec3 dir2 = step(max(score2.yzx, score2.zxy), score2);
    vec3 v4 = v3 + dir2 * sign(d3);
    vec3 d4 = X2 - v4;

    // Gradient hashes for the four points, two from each half-lattice
    vec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
    hashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
    hashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);

    // Gradient extrapolations & kernel function
    vec4 a = max(0.5 - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0);
    vec4 aa = a * a; vec4 aaaa = aa * aa;
    vec3 g1 = grad(hashes.x); vec3 g2 = grad(hashes.y);
    vec3 g3 = grad(hashes.z); vec3 g4 = grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));

    // Derivatives of the noise
    vec3 derivative = -8.0 * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations)
        + mat4x3(g1, g2, g3, g4) * aaaa;

    // Return it all as a vec4
    return vec4(derivative, dot(aaaa, extrapolations));
}

// Use this if you don't want Z to look different from X and Y
vec4 openSimplex2_Conventional(vec3 X) {

    // Rotate around the main diagonal. Not a skew transform.
    vec4 result = openSimplex2Base(dot(X, vec3(2.0/3.0)) - X);
    return vec4(dot(result.xyz, vec3(2.0/3.0)) - result.xyz, result.w);
}

// Use this if you want to show X and Y in a plane, then use Z for time, vertical, etc.
vec4 openSimplex2_ImproveXY(vec3 X) {

    // Rotate so Z points down the main diagonal. Not a skew transform.
    mat3 orthonormalMap = mat3(
        0.788675134594813, -0.211324865405187, -0.577350269189626,
        -0.211324865405187, 0.788675134594813, -0.577350269189626,
        0.577350269189626, 0.577350269189626, 0.577350269189626);

    vec4 result = openSimplex2Base(orthonormalMap * X);
    return vec4(result.xyz * orthonormalMap, result.w);
}

// End OpenSimplex functions

float fbm(vec3 p, int octaves, float persistence, float lacunarity, float exponentiation) {
  float amplitude = 0.5;
  float frequency = 1.0;
  float total = 0.0;
  float normalization = 0.0;

  for (int i = 0; i < octaves; ++i) {
    float noiseValue = openSimplex2_Conventional(p * frequency).w;
    total += noiseValue * amplitude;
    normalization += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  total /= normalization;
  total = total * 0.5 + 0.5;
  total = pow(total, exponentiation);

  return total;
}

float sdfCircle(vec2 p, float r) {
  return length(p) - r;
}

float map(vec3 pos) {
  return fbm(pos, 6, 0.5, 2.0, 4.0);
}

vec3 calcNormal(vec3 pos) {
  vec2 e = vec2(0.00015, 0.0);
  return normalize(
      vec3(
          map(pos + e.xyy) - map(pos - e.xyy),
          map(pos + e.yxy) - map(pos - e.yxy),
          map(pos + e.yyx) - map(pos - e.yyx)
      )
  );
}

vec3 DrawStar(vec2 pixelCoords, vec3 primaryColor, vec3 secondaryColor, vec3 glowColor, vec3 color, float starRadius, float coronaWidth) {
  float d = sdfCircle(pixelCoords, starRadius);

  vec3 starColor = vec3(1.0);

  if (d <= 0.0) {
    float x = pixelCoords.x / starRadius;
    float y = pixelCoords.y / starRadius;
    float z = sqrt(1.0 - x * x - y * y);

    vec3 viewNormal = vec3(x, y, z);
    vec3 wsPosition = viewNormal;
    vec3 wsNormal = normalize(wsPosition);
    vec3 wsViewDir = vec3(0.0, 0.0, 1.0);

    vec3 noiseCoord = wsPosition * 2.0;
    float noiseSample = fbm(noiseCoord, 6, 0.5, 2.0, 4.0);

    starColor = mix(primaryColor, secondaryColor, smoothstep(0.05, 0.01, noiseSample));

    float fresnel = pow(1.0 - dot(wsNormal, wsViewDir), 2.0);
    starColor = mix(starColor, glowColor, fresnel);
  }

  color = mix(starColor, color, smoothstep(-1.0, 1.0, d));

  if (d > 0.0) {
    color = mix(glowColor, color, smoothstep(-20.0, coronaWidth * 2.0, d));
  }

  return color;
}

vec3 GenerateGridStars(
    vec2 pixelCoords, float starRadius, float cellWidth,
    float variant, bool twinkle) {

  float seedVariant = clamp((seed + variant) / 100.0, 0.0, 1.0);
  vec2 cellCoords = (fract(pixelCoords / cellWidth) - 0.5 + seedVariant) * cellWidth;
  vec2 cellID = floor(pixelCoords / cellWidth);
  vec3 cellHashValue = hash3(vec3(cellID, 0.0));

  float starBrightness = saturate(cellHashValue.z);
  vec2 starPosition = vec2(seedVariant);
  starPosition += cellHashValue.xy * (cellWidth * 0.5 - starRadius * 4.0 + seedVariant);
  float distToStar = length(cellCoords - starPosition);
  float glow = exp(-2.0 * distToStar / starRadius);

  if (twinkle) {
    float noiseSample = openSimplex2_Conventional(vec3(cellID, seedVariant)).w;
    float twinkleSize = (
        remap(noiseSample, -1.0, 1.0, 1.0, 0.1) * starRadius * 6.0);
    vec2 absDist = abs(cellCoords - starPosition);
    float twinkleValue = smoothstep(starRadius * 0.25, 0.0, absDist.y) *
        smoothstep(twinkleSize, 0.0, absDist.x);
    twinkleValue += smoothstep(starRadius * 0.25, 0.0, absDist.x) *
        smoothstep(twinkleSize, 0.0, absDist.y);
    glow += twinkleValue;
  }

  return vec3(glow * starBrightness);
}

vec3 GenerateStars(vec2 pixelCoords) {
  vec3 stars = vec3(0.0);

  float size = 4.0;
  float cellWidth = 500.0;
  for (float i = 0.0; i <= 2.0; i++) {
    stars += GenerateGridStars(pixelCoords, size, cellWidth, i, true);
    size *= 0.5;
    cellWidth *= 0.35;
  }

  for (float i = 3.0; i < 5.0; i++) {
    stars += GenerateGridStars(pixelCoords, size, cellWidth, i, false);
    size *= 0.5;
    cellWidth *= 0.35;
  }

  return stars;
}

void main(void) {
  vec2 pixelCoords = (vUvs - 0.5) * resolution;

  vec3 color = GenerateStars(pixelCoords);
  color = DrawStar(pixelCoords, star_color, corona_color, glow_color, color, star_radius, corona_width);

  gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
