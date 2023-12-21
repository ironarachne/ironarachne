var h=Object.defineProperty;var g=(o,e,n)=>e in o?h(o,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[e]=n;var t=(o,e,n)=>(g(o,typeof e!="symbol"?e+"":e,n),n);import{r as d,w as x}from"./index.a1591b4f.js";import{W as w,S as y,O as C,d as b,e as _,V as S,s as z,M as V,f as G,P,c as M}from"./generator.bc8d0f99.js";import"./index.2fc1e45c.js";import{b as X,r as R}from"./index.bd2dd152.js";import{g as W}from"./lodash.469a5080.js";function D(){return W(["pvn","pvnvn","pvnvv","slvnvn","lvfv","lvfvn","tvtv","pvtv+n","pvtv+","pv+c+v","tv+c+v","slv+c+vv","pvnvlv","pvnvlvnv","svnvlvnv","pv+llvlv","pvpvpv+n","slv+c+v+n","slvc+vn","slvc+vnv","slvpvpv","slvpv+pv"])}var q=`#ifdef GL_ES
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

vec3 hash3( vec3 p ) 
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
            dot(p,vec3(269.5,183.3,246.1)),
            dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

vec4 permute(vec4 t) {
    return t * (t * 34.0 + 133.0);
}

vec3 grad(float hash) {

    
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;

    
    
    
    vec3 cuboct = cube;
    cuboct[int(hash / 16.0)] = 0.0;

    
    float type = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));

    
    
    vec3 grad = cuboct * 1.22474487139 + rhomb;

    
    
    
    grad *= (1.0 - 0.042942436724648037 * type) * 32.80201376986577;

    return grad;
}

vec4 openSimplex2Base(vec3 X) {

    
    vec3 v1 = round(X);
    vec3 d1 = X - v1;
    vec3 score1 = abs(d1);
    vec3 dir1 = step(max(score1.yzx, score1.zxy), score1);
    vec3 v2 = v1 + dir1 * sign(d1);
    vec3 d2 = X - v2;

    
    vec3 X2 = X + 144.5;
    vec3 v3 = round(X2);
    vec3 d3 = X2 - v3;
    vec3 score2 = abs(d3);
    vec3 dir2 = step(max(score2.yzx, score2.zxy), score2);
    vec3 v4 = v3 + dir2 * sign(d3);
    vec3 d4 = X2 - v4;

    
    vec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
    hashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
    hashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);

    
    vec4 a = max(0.5 - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0);
    vec4 aa = a * a; vec4 aaaa = aa * aa;
    vec3 g1 = grad(hashes.x); vec3 g2 = grad(hashes.y);
    vec3 g3 = grad(hashes.z); vec3 g4 = grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));

    
    vec3 derivative = -8.0 * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations)
        + mat4x3(g1, g2, g3, g4) * aaaa;

    
    return vec4(derivative, dot(aaaa, extrapolations));
}

vec4 openSimplex2_Conventional(vec3 X) {

    
    vec4 result = openSimplex2Base(dot(X, vec3(2.0/3.0)) - X);
    return vec4(dot(result.xyz, vec3(2.0/3.0)) - result.xyz, result.w);
}

vec4 openSimplex2_ImproveXY(vec3 X) {

    
    mat3 orthonormalMap = mat3(
        0.788675134594813, -0.211324865405187, -0.577350269189626,
        -0.211324865405187, 0.788675134594813, -0.577350269189626,
        0.577350269189626, 0.577350269189626, 0.577350269189626);

    vec4 result = openSimplex2Base(orthonormalMap * X);
    return vec4(result.xyz * orthonormalMap, result.w);
}

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
}`;function Y(o,e,n){const r=document.createElement("canvas");r.width=e,r.height=n;const s=new w({canvas:r,antialias:!0});s.setSize(e,n);const i=new y,c=new C(0,1,1,0,.1,1e3);if(c.position.set(0,0,1),r===null)throw new Error("Canvas not found");const m=new b(1,1),u=new _({uniforms:{seed:{value:d.float(0,100)},resolution:{value:new S(e,n)},corona_width:{value:T(f(o.radius,Math.min(n,e)))},glow_color:{value:p(o.glowColor)},corona_color:{value:p(o.secondaryColor)},star_color:{value:p(o.primaryColor)},star_radius:{value:f(o.radius,Math.min(n,e))}},fragmentShader:q,vertexShader:z}),a=new V(m,u);a.position.set(.5,.5,0),i.add(a),s.render(i,c);const v=s.domElement.toDataURL("image/png");return u.dispose(),m.dispose(),s.dispose(),r.remove(),v}function T(o){return Math.max(o*.2,4)}function p(o){return new G(o.r,o.g,o.b)}function f(o,e){const n=o/695508,r=e/2,s=e/2.5,i=e/8,c=n*r;return Math.max(i,Math.min(s,c))}class I{constructor(){t(this,"name");t(this,"color");t(this,"primaryColor");t(this,"secondaryColor");t(this,"glowColor");t(this,"description");t(this,"classification");t(this,"radius");t(this,"mass");t(this,"temperature");t(this,"luminosity");this.name="",this.color="",this.primaryColor={r:0,g:0,b:0},this.secondaryColor={r:0,g:0,b:0},this.glowColor={r:0,g:0,b:0},this.description="",this.classification="",this.radius=0,this.mass=0,this.temperature=0,this.luminosity=0}}class k{constructor(e){t(this,"config");this.config=e}generate(){const e=x(this.config.possibleClassifications),n=new I;n.classification=e.name,n.radius=d.float(e.radius_min,e.radius_max)*695508,n.mass=d.float(e.mass_min,e.mass_max)*1.989,n.temperature=d.int(e.temperature_min,e.temperature_max),n.luminosity=d.float(e.luminosity_min,e.luminosity_max)*3.828;const r=this.getColorSetFromTemperature(n.temperature);n.color=this.getColorFromTemperature(n.temperature),n.primaryColor=r[0],n.secondaryColor=r[1],n.glowColor=r[2];const s=X(n.color);return n.description=`This is ${s} ${n.color} ${n.classification} star.`,n.name=D(),n}getColorFromTemperature(e){return e<3700?"red":e<5200?"orange":e<6e3?"yellow":e<7500?"yellow-white":e<1e4?"white":e<3e4?"blue-white":"blue"}getColorSetFromTemperature(e){return e<3700?[{r:1,g:0,b:0},{r:.5,g:0,b:0},{r:1,g:0,b:0}]:e<5200?[{r:1,g:.39,b:0},{r:.7,g:.13,b:0},{r:1,g:1,b:0}]:e<6e3?[{r:1,g:1,b:0},{r:.55,g:.35,b:0},{r:1,g:1,b:.5}]:e<7500?[{r:1,g:1,b:.9},{r:.95,g:.95,b:.7},{r:1,g:1,b:1}]:e<1e4?[{r:1,g:1,b:1},{r:.95,g:.95,b:.95},{r:1,g:1,b:1}]:e<3e4?[{r:.85,g:.9,b:1},{r:.7,g:.75,b:.95},{r:1,g:1,b:1}]:[{r:0,g:0,b:1},{r:0,g:0,b:.75},{r:0,g:.2,b:1}]}}class l{constructor(e,n,r,s,i,c,m,u,a,v){t(this,"name");t(this,"radius_min");t(this,"radius_max");t(this,"mass_min");t(this,"mass_max");t(this,"temperature_min");t(this,"temperature_max");t(this,"luminosity_min");t(this,"luminosity_max");t(this,"commonality");this.name=e,this.radius_min=n,this.radius_max=r,this.mass_min=s,this.mass_max=i,this.temperature_min=c,this.temperature_max=m,this.luminosity_min=u,this.luminosity_max=a,this.commonality=v}}function B(){return[new l("main sequence",.1,.5,.1,.5,2e3,4e3,.01,.05,40),new l("main sequence",.6,.9,.6,.8,4e3,5e3,.1,.8,45),new l("main sequence",.9,1.1,.8,1.3,5e3,6e3,.8,3,60),new l("main sequence",1.1,1.5,1.3,1.8,6e3,8e3,3,8,30),new l("main sequence",1.5,4,1.8,5,8e3,15e3,15,25,10),new l("main sequence",4,6,8,12,15e3,25e3,900,1100,5),new l("main sequence",8,12,45,55,35e3,45e3,9e4,11e4,1),new l("giant",10,50,1,5,3e3,1e4,50,1e3,2),new l("supergiant",30,500,10,70,4e3,4e4,3e4,1e6,1)]}class ${constructor(){t(this,"possibleClassifications");this.possibleClassifications=B()}}class j{constructor(){t(this,"minPlanets");t(this,"maxPlanets");this.minPlanets=3,this.maxPlanets=12}}class F{constructor(){t(this,"name");t(this,"description");t(this,"stars");t(this,"planets");this.name="",this.description="",this.stars=[],this.planets=[]}}class A{constructor(e){t(this,"config");this.config=e}generate(){let e=new F,n=new $;const s=new k(n).generate();e.name=s.name,e.stars.push(s);const i=d.int(this.config.minPlanets,this.config.maxPlanets);let c=new M,m=new P(c);for(let a=0;a<i;a++){const v=m.generate();e.planets.push(v)}e.planets.sort(function(a,v){return a.distance_from_sun<v.distance_from_sun?-1:a.distance_from_sun>v.distance_from_sun?1:0});for(let a=0;a<e.planets.length;a++)e.planets[a].is_inhabited||(e.planets[a].name=e.name+" "+R(a+1));return e.description=`The ${e.name} system has ${i} planets`,d.int(1,100)>70?e.description+=" and an asteroid belt.":e.description+=".",e}}export{A as S,j as a,Y as r};
//# sourceMappingURL=generator.3bfe35f1.js.map
