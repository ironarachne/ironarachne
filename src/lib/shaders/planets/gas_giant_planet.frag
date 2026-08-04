#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float seed;
uniform float render_background;
uniform float planet_radius;
uniform vec3 light_direction;
uniform vec3 main_color;
uniform vec3 band_color_1;
uniform vec3 band_color_2;


uniform float has_rings;
uniform float ring_angle;
uniform float ring_tilt;
uniform vec3 ring_color;

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
    int index = int(hash / 16.0);
    if (index == 0) cuboct.x = 0.0;
    else if (index == 1) cuboct.y = 0.0;
    else cuboct.z = 0.0;

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
    vec3 v1 = floor(X + 0.5);
    vec3 d1 = X - v1;
    vec3 score1 = abs(d1);
    vec3 dir1 = step(max(score1.yzx, score1.zxy), score1);
    vec3 v2 = v1 + dir1 * sign(d1);
    vec3 d2 = X - v2;

    // Second half-lattice, closest edge
    vec3 X2 = X + 144.5;
    vec3 v3 = floor(X2 + 0.5);
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
    vec4 m = aa * a * extrapolations;
    vec3 derivative = -8.0 * (d1 * m.x + d2 * m.y + d3 * m.z + d4 * m.w)
        + (g1 * aaaa.x + g2 * aaaa.y + g3 * aaaa.z + g4 * aaaa.w);

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

float fbm(vec3 p, int octaves, float persistence, float lacunarity, float exponentiation) {
  float amplitude = 0.5;
  float frequency = 1.0;
  float total = 0.0;
  float normalization = 0.0;

  for (int i = 0; i < 16; ++i) {
    if (i >= octaves) break;
    float noiseValue = openSimplex2_Conventional(p * frequency).w;
    total += noiseValue * amplitude;
    normalization += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  total /= normalization;
  total = total * 0.5 + 0.5;
  total = pow(max(0.0, total), exponentiation);

  return total;
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
  float cellWidth = 700.0;
  for (int i = 0; i < 3; i++) {
    stars += GenerateGridStars(pixelCoords, size, cellWidth, float(i), true);
    size *= 0.5;
    cellWidth *= 0.35;
  }

  for (int i = 3; i < 5; i++) {
    stars += GenerateGridStars(pixelCoords, size, cellWidth, float(i), false);
    size *= 0.5;
    cellWidth *= 0.35;
  }

  return stars;
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

mat2 rotate2d(float _angle){
  return mat2(cos(_angle),-sin(_angle),
              sin(_angle),cos(_angle));
}

vec3 DrawPlanet(vec2 pixelCoords, vec3 color, float planetRadius) {
  // Use the seed to divide gas giants into structural types
  float pType = fract(seed * 0.98765);

  // We rely on the uniformly passed colors from JS to maintain limitless palette variety!
  vec3 wBase = main_color;
  vec3 lBase = band_color_1;
  vec3 mBase = band_color_2;
  vec3 cBase = wBase; // Storm / Wisp color

  float baseFreq = 8.0;
  float turbulence = 0.18;
  float wispStrength = 0.1;
  float hasSpots = 1.0;
  float bandSmoothness = 0.01;

  if (pType < 0.25) {
    // JUPITER TYPE (Dynamic bands, highest turbulence, prominent distinct spots)
    baseFreq = 12.0 + fract(seed) * 8.0;
    turbulence = 0.25 + fract(seed * 1.5) * 0.1;
    wispStrength = 0.0;
    bandSmoothness = 0.02;
    // Storms get a contrasting mix of the band colors so they stand out like the Red Spot
    cBase = mix(mBase, vec3(1.0, 0.8, 0.6), 0.3);
  } else if (pType < 0.50) {
    // SATURN TYPE (Muted colors smoothly blending, low turbulence, almost no spots)
    baseFreq = 16.0 + fract(seed) * 10.0;
    turbulence = 0.05;
    wispStrength = 0.05;
    hasSpots = 0.0;
    bandSmoothness = 0.15; // wide smooth blends
    // Mute the bands heavily toward the main color to create pastel gradients
    lBase = mix(wBase, band_color_1, 0.4);
    mBase = mix(wBase, band_color_2, 0.4);
    cBase = mix(wBase, vec3(1.0), 0.1);
  } else if (pType < 0.75) {
    // URANUS TYPE (Almost completely featureless, very faint bands, zero spots)
    baseFreq = 4.0;
    turbulence = 0.02;
    wispStrength = 0.12;
    hasSpots = 0.0;
    bandSmoothness = 0.3;
    // Extremely subtle banding
    lBase = mix(wBase, band_color_1, 0.1);
    mBase = mix(wBase, band_color_2, 0.1);
    // Subtle lighter wisps, softly blending into the base
    cBase = mix(wBase, vec3(1.0), 0.15);
  } else {
    // NEPTUNE TYPE (Deep contrast, storms, horizontal wispy clouds)
    baseFreq = 6.0 + fract(seed) * 4.0;
    turbulence = 0.12;
    wispStrength = 0.35; // reduced from the harsh 0.8 white
    hasSpots = 0.8;
    bandSmoothness = 0.08;
    // Darken the base colors slightly to make it feel deep
    lBase = mix(wBase, vec3(0.0), 0.2);
    mBase = mix(band_color_2, vec3(0.0), 0.2);
    // Wisps are a slightly lighter version of the main color, NOT stark white
    cBase = mix(wBase, vec3(1.0), 0.35);
  }

  float d = sdfCircle(pixelCoords, planetRadius);

  vec3 planetColor = vec3(1.0);

  vec2 rotatedCoords = rotate2d(seed * 0.1) * pixelCoords;

  if (d <= 0.0) {
    float x = rotatedCoords.x / planetRadius;
    float y = rotatedCoords.y / planetRadius;
    float z = sqrt(max(0.0, 1.0 - x * x - y * y));

    vec3 viewNormal = vec3(x, y, z);
    vec3 wsPosition = viewNormal;
    vec3 wsNormal = normalize(wsPosition);
    vec3 wsViewDir = vec3(0.0, 0.0, 1.0);

    vec3 noiseCoord = wsPosition * 2.0;
    vec3 seededNoiseCoord = noiseCoord + seed / 100.0;
    float noiseSample1 = fbm(seededNoiseCoord, 6, 0.5, 2.0, 4.0);
    float noiseSample2 = fbm(seededNoiseCoord, 6, 0.5, 4.0, 4.0);

    // Generate storms (Great spots)
    vec2 spotCoords1 = rotatedCoords / planetRadius - vec2(0.2, -0.2); // static pos relative to rotation
    spotCoords1.y *= 1.8; // Squish into ellipse
    float spotDist1 = length(spotCoords1);
    float spotMask1 = 1.0 - smoothstep(0.1, 0.25, spotDist1 + fbm(seededNoiseCoord * 3.0, 4, 0.5, 2.0, 1.0) * 0.1);

    vec2 spotCoords2 = rotatedCoords / planetRadius - vec2(-0.4, 0.4);
    spotCoords2.y *= 2.2;
    float spotDist2 = length(spotCoords2);
    float spotMask2 = 1.0 - smoothstep(0.05, 0.15, spotDist2 + fbm(seededNoiseCoord * 4.0 + 10.0, 4, 0.5, 2.0, 1.0) * 0.1);

    float stormMask = max(spotMask1, spotMask2) * hasSpots;

    float amplitude = turbulence + noiseSample1 * (turbulence * 0.5);
    float frequency = baseFreq + noiseSample2;

    // Bands bend around storms slightly
    float warpedY = y + stormMask * 0.1 * sign(y);

    // Create variable transition rates so bands blend smoothly and organically
    float dynamicSmoothness = bandSmoothness + (noiseSample2 * 0.1);

    float bandValue1 = smoothstep(0.15 - dynamicSmoothness, 0.15 + dynamicSmoothness, abs(amplitude * sin(warpedY * frequency) + pow(noiseSample1, 1.5)));
    float bandValue2 = smoothstep(0.15 - dynamicSmoothness, 0.15 + dynamicSmoothness, abs(amplitude * sin(warpedY * frequency * 1.35) + pow(noiseSample1, 1.5)));
    float bandValue3 = smoothstep(0.10 - dynamicSmoothness, 0.10 + dynamicSmoothness, abs(amplitude * sin(warpedY * frequency * 1.75) + pow(noiseSample1, 1.5)));

    planetColor = mix(wBase, lBase, bandValue1);
    planetColor = mix(planetColor, mBase, bandValue2);
    planetColor = mix(planetColor, lBase, bandValue3);

    // Add storms
    planetColor = mix(planetColor, cBase, stormMask * 0.9);

    // Add wispy clouds (high frequency longitudinal strips)
    float wispMap = fbm(seededNoiseCoord * vec3(1.5, 8.0, 1.5), 5, 0.5, 2.0, 1.0);
    float wispMask = smoothstep(0.5 - bandSmoothness, 0.7 + bandSmoothness, wispMap);
    planetColor = mix(planetColor, cBase, wispMask * wispStrength);

    // Lighting
    vec2 specParams = mix(
        vec2(0.15, 8.0),
        vec2(0.01, 2.0),
        smoothstep(0.05, 0.06, 0.0));
    vec3 wsLightDir = normalize(light_direction);
    vec3 wsSurfaceNormal = normalize(calcNormal(wsPosition) + 16.0 * wsNormal);

    // Subsurface scattering
    float wrap = 0.05;
    float dp = max(
        0.0, (dot(wsLightDir, wsNormal) + wrap) / (1.0 + wrap));

    vec3 lightColor = mix(
        vec3(0.25, 0.0, 0.0),
        vec3(0.75),
        smoothstep(0.05, 0.5, dp));
    vec3 ambient = vec3(0.002);
    vec3 diffuse = lightColor * dp;

    vec3 r = normalize(reflect(-wsLightDir, wsNormal));
    float phongValue = max(0.0, dot(wsViewDir, r));
    phongValue = pow(phongValue, specParams.y);

    vec3 specular = vec3(phongValue) * specParams.x * diffuse;

    vec3 planetShading = planetColor * (diffuse + ambient) + specular;
    planetColor = planetShading;

    // Fresnel
    float fresnel = 1.0 - smoothstep(0.1, 1.0, viewNormal.z);
    fresnel = pow(max(0.0, fresnel), 8.0) * dp;
    planetColor = mix(planetColor, wBase * 1.5, fresnel);
  }

  color = mix(color, planetColor, 1.0 - smoothstep(-1.0, 0.0, d));

  // Atmosphere glow
  float atmosphereAmount = planetRadius * 0.05;
  float atmosphereRadius = planetRadius + atmosphereAmount;

  if (d < atmosphereAmount + 24.0 && d >= -1.0) {
    float x = rotatedCoords.x / atmosphereRadius;
    float y = rotatedCoords.y / atmosphereRadius;
    float z = sqrt(max(0.0, 1.0 - x * x - y * y));
    vec3 normal = vec3(x, y, z);

    float lighting = dot(normal, normalize(light_direction));
    lighting = smoothstep(-0.15, 1.0, lighting);

    float glowDegree = -0.1; // more negative = tighter glow
    // modify the degree based on the size of the image, where -0.2 is appropriate for 512x512
    glowDegree *= 512.0 / resolution.x;

    vec3 glowColor = main_color *
        exp(glowDegree * d * d) * lighting * 0.75;
    color += glowColor;
  }

  return color;
}


vec3 DrawRings(vec2 pixelCoords, vec3 color, float planetRadius, bool front) {
  if (has_rings < 0.5) return color;

  float sizeSeed = fract(seed * 0.123);
  float innerR = planetRadius * (1.1 + sizeSeed * 0.8); 
  float outerR = innerR + planetRadius * (0.2 + fract(seed * 0.765) * 1.5);

  float s = sin(ring_angle);
  float c = cos(ring_angle);
  mat2 rot = mat2(c, -s, s, c);

  vec2 rP = rot * pixelCoords;
  if (front && rP.y < 0.0) return color;
  if (!front && rP.y >= 0.0) return color;

  vec2 dp = vec2(1.5 / resolution.x, 1.5 / resolution.y);
  
  float bandTotal = 0.0;
  float alphaTotal = 0.0;
  float validSamples = 0.0;
  vec3 colorTotal = vec3(0.0);

  for (float dx = -0.5; dx <= 0.5; dx += 1.0) {
    for (float dy = -0.5; dy <= 0.5; dy += 1.0) {
       vec2 jp = rot * (pixelCoords + vec2(dx, dy) * dp);
       jp.y /= max(0.05, ring_tilt);
       float jd = length(jp);
       if (jd > innerR && jd < outerR) {
           float jt = (jd - innerR) / (outerR - innerR);
           
           // Lower frequencies significantly to create massive, continuous bands
           float f_big = 4.0 + sizeSeed * 6.0;
           float noiseBig = sin(jt * f_big + seed * 10.0);
           
           float f_med = 15.0 + fract(sizeSeed * 2.0) * 10.0;
           float noiseMed = sin(jt * f_med - seed * 5.0);
           
           float f_small = 40.0;
           float noiseSmall = sin(jt * f_small + seed);
           
           // Extremely wide coverage. By using -0.8 to -0.2, the ring is solid 1.0 
           // for over 80% of the sine wave, only dipping in the deep valleys.
           float bigRing = smoothstep(-0.8, -0.2, noiseBig);
           
           // Medium bands don't go exactly to 0, leaving a translucent floor 
           // instead of empty space.
           float medRing = mix(0.4, 1.0, smoothstep(-0.2, 0.6, noiseMed));
           
           float jband = bigRing * medRing;
           // Add small detail bands
           jband += smoothstep(0.6, 1.0, abs(noiseSmall)) * 0.15 * bigRing;
           
           bandTotal += jband;
           alphaTotal += clamp(jband, 0.0, 1.0) * 0.9;
           validSamples += 1.0;
           
           vec3 baseCol = ring_color;
           // Darken using the medium bands to create structural depth
           baseCol *= mix(0.6, 1.0, smoothstep(0.0, 1.0, noiseMed));
           
           // Subtle hue shifts using the noise channels
           vec3 hueShift = vec3(noiseBig * 0.05, noiseMed * 0.05, (noiseBig * noiseMed) * 0.08);
           vec3 sampleColor = clamp(baseCol + hueShift, 0.0, 1.0);
           colorTotal += sampleColor;
       }
    }
  }

  if (validSamples > 0.0) {
    float band = bandTotal / validSamples;
    float alpha = alphaTotal / validSamples;
    vec3 finalRingColor = colorTotal / validSamples;
    
    vec2 p = rot * pixelCoords;
    p.y /= max(0.05, ring_tilt);
    float d = length(p);
    
    float edge = smoothstep(innerR, innerR + planetRadius * 0.01, d) * 
                 (1.0 - smoothstep(outerR - planetRadius * 0.01, outerR, d));
    
    float shadow = 1.0;
    vec2 ldXY = normalize(light_direction.xy);
    float dotLight = dot(normalize(pixelCoords), ldXY);
    if (dotLight < 0.0) {
      float lineDist = abs(pixelCoords.x * ldXY.y - pixelCoords.y * ldXY.x);
      if (lineDist < planetRadius) {
         shadow = mix(1.0, 0.05, smoothstep(planetRadius, planetRadius * 0.8, lineDist) * smoothstep(0.0, -0.4, dotLight));
      }
    }
    
    float highlight = 1.0 + smoothstep(0.4, 1.0, band) * 0.25 * max(0.0, dotLight);
    return mix(color, finalRingColor * shadow * highlight, alpha * edge);
  }
  return color;
}

void main() {
  vec2 pixelCoords = (vUvs - 0.5) * resolution;

  // render_background is honoured rather than ignored: the scene draws the background once, in its
  // own pass, from the star positions both backends share. A body plane that generated its own
  // starfield would paint a different sky over that one — and, in a star system, over its
  // neighbours as well.
  vec3 color = render_background > 0.5 ? GenerateStars(pixelCoords) : vec3(0.0);
  color = DrawRings(pixelCoords, color, planet_radius, false);
  color = DrawPlanet(pixelCoords, color, planet_radius);
  color = DrawRings(pixelCoords, color, planet_radius, true);

  vec3 finalColor = pow(max(vec3(0.0), color), vec3(1.0 / 2.2));

  // Nothing was drawn at this pixel, so let the background through instead of covering it with an
  // opaque black square. The threshold is below one 8-bit step; the planet's night side sits an
  // order of magnitude above it and still occludes what is behind it.
  if (render_background < 0.5 && max(finalColor.r, max(finalColor.g, finalColor.b)) < 0.004) {
    discard;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
