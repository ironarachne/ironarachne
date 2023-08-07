import{s as lh,h as ch,n as No,r as hh,o as uh}from"../chunks/scheduler.db8c6f43.js";import{S as dh,i as fh,s as $e,g as ke,m as it,z as ph,f as ut,c as Ke,h as We,j as St,x as _t,n as rt,k as Be,D as xs,a as Fo,y as te,E as wa,C as Or,o as Vt,A as mh,F as gh}from"../chunks/index.776ff577.js";import{g as vh}from"../chunks/globals.7f7f1b26.js";import{e as Sa}from"../chunks/each.e59479a4.js";import{r as Ea}from"../chunks/index.c74e36a8.js";import{g as xh,P as _h,a as yh,b as bh,c as Mh}from"../chunks/generator.654f4b1b.js";import{r as Vn}from"../chunks/random.5c9619ef.js";import{s as Ta}from"../chunks/index.d820e4cb.js";const bn=`varying vec3 vertPos;
varying vec2 vUv;
varying vec3 v_Normal;

void main() {
  vUv = uv;
  vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
  vertPos = vec3(vertPos4) / vertPos4.w;
  gl_Position = projectionMatrix * vertPos4;
  v_Normal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
}`,Jt=`vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x, float seed) {
      return mod289(((x*seed)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v, float seed)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ), seed)
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ), seed)
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ), seed);

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  float result = 48.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );

  result = result + 0.35;

  return result;
  }`,Mn=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;
uniform int numOctaves;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                fbm( p + vec2(5.2, 1.3), 1.0 ) );

  return fbm( p + 4.0 * q, 1.0 );
}

float opacity( in float h )
{
  if ( h < 0.7 ) {
    return 0.0;
  }

  return h * h;
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  float height = pattern(vec2(x, y));

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = height;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian +
    specularI * specular * specularColor, opacity(height));
}`,wh=`float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio

float gold_noise(in vec2 xy, in float seed){
        return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}`,Sh=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);

  float height = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  vec3 color1 = vec3(0.6, 0.3, 0.15);
  vec3 color2 = vec3(0.95, 0.9, 0.45);
  vec3 color3 = vec3(0.5, 0.35, 0.2);
  vec3 color = mix(color3, color2, height);
  color = mix(color, color1, qh);

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Eh=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);

  float height = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  vec3 color1 = vec3(0.6, 0.6, 0.5);
  vec3 color2 = vec3(0.9, 0.9, 0.9);
  vec3 color3 = vec3(0.3, 0.32, 0.3);
  vec3 color = mix(color3, color2, height);
  color = mix(color, color1, qh);

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Th=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

vec3 overlay( in vec3 c1, in vec3 c2 )
{
  if ((c1.x + c1.y + c1.z) / 3.0 < 0.5) {
    return (1.0 - (1.0 - c1) * (1.0 - c2)) * 0.5;
  } else {
    return c1 * c2 * 0.5;
  }
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);
  float height = fbm(3.0 * q, 1.0);

  float h = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  float oceanh = clamp(pattern2(r), 0.0, 0.2);
  vec3 color1 = vec3(0.0, 0.15, 0.45);
  vec3 color2 = vec3(0.95, 0.9, 0.45);
  vec3 color3 = vec3(0.2, 0.7, 0.2);
  vec3 color4 = vec3(0.1, 0.1, 0.5);
  vec3 color5 = vec3(0.0, 0.0, 0.3);
  vec3 color = mix(color1, color2, h);
  color = mix(color, color3, rh * rh * 0.5);

  if (height < 0.55) {
    color = mix(color4, color5, h);
  }

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Ah=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);

  float height = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  vec3 color1 = vec3(0.95, 0.95, 0.95);
  vec3 color2 = vec3(0.7, 0.9, 0.9);
  vec3 color3 = vec3(0.0, 0.5, 0.5);
  vec3 color = mix(color1, color2, height);
  color = mix(color, color3, qh);

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Ch=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

vec3 overlay( in vec3 c1, in vec3 c2 )
{
  if ((c1.x + c1.y + c1.z) / 3.0 < 0.5) {
    return (1.0 - (1.0 - c1) * (1.0 - c2)) * 0.5;
  } else {
    return c1 * c2 * 0.5;
  }
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);
  float height = fbm(3.0 * q, 1.0);

  float h = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  float oceanh = clamp(pattern2(r), 0.0, 0.2);
  vec3 color1 = vec3(0.0, 0.15, 0.5);
  vec3 color2 = vec3(0.0, 0.5, 0.15);
  vec3 color3 = vec3(0.0, 0.3, 0.0);
  vec3 color4 = vec3(0.1, 0.1, 0.5);
  vec3 color5 = vec3(0.0, 0.0, 0.3);
  vec3 color = mix(color1, color2, h);
  color = mix(color, color3, rh * rh);

  if (height < 0.45) {
    color = mix(color4, color5, h);
  }

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Lh=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);

  float height = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  vec3 color1 = vec3(0.0, 0.1, 0.3);
  vec3 color2 = vec3(0.0, 0.0, 0.1);
  vec3 color3 = vec3(0.1, 0.1, 0.5);
  vec3 color = mix(color1, color2, height);
  color = mix(color, color3, qh);

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Rh=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

vec3 overlay( in vec3 c1, in vec3 c2 )
{
  if ((c1.x + c1.y + c1.z) / 3.0 < 0.5) {
    return (1.0 - (1.0 - c1) * (1.0 - c2)) * 0.5;
  } else {
    return c1 * c2 * 0.5;
  }
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);
  float height = fbm(3.0 * q, 1.0);

  float h = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  float oceanh = clamp(pattern2(r), 0.0, 0.2);
  vec3 color1 = vec3(0.0, 0.55, 0.5);
  vec3 color2 = vec3(0.0, 0.5, 0.25);
  vec3 color3 = vec3(0.0, 0.3, 0.0);
  vec3 color4 = vec3(0.1, 0.3, 0.5);
  vec3 color5 = vec3(0.0, 0.2, 0.3);
  vec3 color = mix(color1, color2, h);
  color = mix(color, color3, rh * rh);
  color = mix(color, color1, qh * qh * qh);

  if (height < 0.45) {
    color = mix(color4, color5, h);
  }

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Ph=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

vec3 overlay( in vec3 c1, in vec3 c2 )
{
  if ((c1.x + c1.y + c1.z) / 3.0 < 0.5) {
    return (1.0 - (1.0 - c1) * (1.0 - c2)) * 0.5;
  } else {
    return c1 * c2 * 0.5;
  }
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);

  float height = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  float oceanh = clamp(pattern2(r), 0.0, 0.2);
  vec3 color1 = vec3(0.0, 0.15, 0.45);
  vec3 color2 = vec3(0.95, 0.9, 0.45);
  vec3 color3 = vec3(0.5, 0.35, 0.2);
  vec3 color4 = vec3(0.9, 0.9, 0.8);
  vec3 color5 = vec3(0.0, 0.5, 0.35);
  vec3 color = mix(color3, color4, height);
  color = color * color2;
  color = mix(color, color5, rh * 0.5);

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`,Dh=`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${Jt}

float fbm( in vec2 x, in float H )
{
  float G = exp2(-H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  int numOctaves = 8;
  for( int i=0; i<numOctaves; i++ )
  {
    t += a * snoise(f * vec3(x, 1.0), seed);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float pattern( in vec2 p, out vec2 q, out vec2 r )
{
  q.x = fbm( p + vec2(0.0,0.0), 1.0 );
  q.y = fbm( p + vec2(5.2,1.3), 1.0 );

  r.x = fbm( p + 4.0*q + vec2(1.7,9.2), 1.0 );
  r.y = fbm( p + 4.0*q + vec2(8.3,2.8), 1.0 );

  return fbm( p + 4.0*r, 1.0 );
}

float pattern2( in vec2 p )
{
  vec2 q = vec2( fbm( p + vec2(0.0, 0.0), 1.0 ),
                  fbm( p + vec2(5.2, 1.3), 1.0 ));

  return fbm( p + 4.0*q, 1.0 );
}

vec3 overlay( in vec3 c1, in vec3 c2 )
{
  if ((c1.x + c1.y + c1.z) / 3.0 < 0.5) {
    return (1.0 - (1.0 - c1) * (1.0 - c2)) * 0.5;
  } else {
    return c1 * c2 * 0.5;
  }
}

void main(void) {
  vec3 lightPos = vec3(-15.0, 15.0, 2.0);
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(lightPos - vertPos);

  float x = vUv.x;
  float y = vUv.y;

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 39.0);
  }

  vec2 q = vec2(x, y);
  vec2 r = vec2(x, y);
  float height = fbm(3.0 * q, 1.0);

  float h = clamp(pattern(vec2(x, y), q, r), 0.1, 1.0);
  float qh = clamp(pattern2(q), 0.1, 1.0);
  float rh = clamp(pattern2(r), 0.1, 1.0);
  float oceanh = clamp(pattern2(r), 0.0, 0.2);
  vec3 color1 = vec3(0.15, 0.0, 0.0);
  vec3 color2 = vec3(0.05, 0.0, 0.0);
  vec3 color3 = vec3(0.05, 0.1, 0.0);
  vec3 color4 = vec3(1.0, 0.6, 0.0);
  vec3 color5 = vec3(1.0, 0.8, 0.0);
  vec3 color = mix(color1, color2, h);
  color = mix(color, color3, rh * rh);
  color = mix(color, color1, qh * qh * qh);

  if (qh < 0.45) {
    color = mix(color4, color5, h);
  }

  vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(1.0, 1.0, 0.3);

  float specularI = 0.12;
  float diffuseI = 1.0;

  gl_FragColor = vec4(1.0 * ambientColor +
    diffuseI * lambertian * color +
    specularI * specular * specularColor, 1.0);
}`;function Ih(s){let e=Math.floor(s/2e3)+1;return s>19e3&&(e=10),e}function Nh(s){return Reflect.get({arid:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Sh},generateVertexShader:function(){return bn}},barren:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Eh},generateVertexShader:function(){const t=Jt,n=Vn.float(0,100);return`varying vec3 vertPos;
        varying vec2 vUv;
        varying vec3 v_Normal;

        ${t}

        void main() {
          vUv = uv;
          vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
          vertPos = vec3(vertPos4) / vertPos4.w;

          float x = vUv.x;
          float y = vUv.y;

          float height = 1.0 * snoise(vec3(x * 38.0, y * 38.0, 1.0), ${n});
          height += 0.55 * snoise(vec3(x * 8.0, y * 8.0, 1.0), ${n});
          height += 0.15 * snoise(vec3(x * 24.0, y * 24.0, 1.0), ${n});
          height += 0.05 * snoise(vec3(x * 48.0, y * 48.0, 1.0), ${n});

          float bumpScale = 0.25;

          vec3 newPosition = position + normal * bumpScale * height;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          v_Normal = (modelViewMatrix * vec4(normal * bumpScale * height, 0.0)).xyz;
        }`}},garden:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Th},generateVertexShader:function(){return bn}},"gas giant":{generateCloudShader:function(){const t=Jt,n=Vn.float(0,200);return`#ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 u_resolution;

        varying vec2 vUv;
        varying vec3 vertPos;
        varying vec3 v_Normal;

        ${t}

        void main(void) {
          vec3 lightPos = vec3(-15.0, 15.0, 2.0);
          vec3 N = normalize(v_Normal);
          vec3 L = normalize(lightPos - vertPos);

          float x = vUv.x;
          float y = vUv.y;

          // Lambert's cosine law
          float lambertian = max(dot(N, L), 0.0);
          float specular = 0.0;
          if(lambertian > 0.0) {
            vec3 R = reflect(-L, N);      // Reflected light vector
            vec3 V = normalize(-vertPos); // Vector to viewer
            // Compute the specular term
            float specAngle = max(dot(R, V), 0.0);
            specular = pow(specAngle, 39.0);
          }

          float density = 1.0 * snoise(vec3(x * 6.0, y * 6.0, 1.0), ${n});
          density += 0.35 * snoise(vec3(x * 32.0, y * 32.0, 1.0), ${n});
          density += 0.15 * snoise(vec3(x * 48.0, y * 48.0, 1.0), ${n});
          //density += 0.05 * snoise(vec3(x * 128.0, y * 128.0, 1.0), ${n});
          density *= 0.8;

          float opacity = mix(0.2, 1.0, density);

          if (density < 0.5) {
            opacity = 0.0;
          }

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          gl_FragColor = vec4(1.0 * ambientColor +
            1.0 * lambertian * vec3(1.0, 1.0, 1.0) +
            0.12 * specular * specularColor, opacity);
        }`},generateFragmentShader:function(){const t=Jt,n=wh,i=Vn.float(0,100),r=[];for(let a=0;a<6;a++)r.push(Vn.float(0,1));return`#ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 u_resolution;

        varying vec2 vUv;
        varying vec3 vertPos;
        varying vec3 v_Normal;

        ${t}
        ${n}

        void main(void) {
          vec3 lightPos = vec3(-15.0, 15.0, 2.0);
          vec3 N = normalize(v_Normal);
          vec3 L = normalize(lightPos - vertPos);

          float x = vUv.x;
          float y = vUv.y;

          // Lambert's cosine law
          float lambertian = max(dot(N, L), 0.0);
          float specular = 0.0;
          if(lambertian > 0.0) {
            vec3 R = reflect(-L, N);      // Reflected light vector
            vec3 V = normalize(-vertPos); // Vector to viewer
            // Compute the specular term
            float specAngle = max(dot(R, V), 0.0);
            specular = pow(specAngle, 39.0);
          }

          float height = 1.0 * snoise(vec3(x * 0.0, y * 8.0, 1.0), ${i});
          //height += 0.8 * snoise(vec3(x * 0.0, y * 128.0, 1.0), ${i});
          height += 0.15 * snoise(vec3(x * 3.0, y * 64.0, 1.0), ${i});
          //height += 0.05 * snoise(vec3(x * 0.0, y * 128.0, 1.0), ${i});

          height = round(height * 18.0)/18.0;

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          float specularI = 0.02;
          float diffuseI = 1.0;

          float clampedHeight = clamp(height, 0.3, 0.6);

          vec3 bandColor = vec3(${r[0]}, ${r[1]}, ${r[2]});
          vec3 baseColor = vec3(${r[3]}, ${r[4]}, ${r[5]});

          vec3 diffuseColor = mix(baseColor, bandColor, clampedHeight);

          gl_FragColor = vec4(1.0 * ambientColor +
            diffuseI * lambertian * diffuseColor +
            specularI * specular * specularColor, 1.0);
        }`},generateVertexShader:function(){return bn}},ice:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Ah},generateVertexShader:function(){return bn}},jungle:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Ch},generateVertexShader:function(){return bn}},ocean:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Lh},generateVertexShader:function(){return bn}},swamp:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Rh},generateVertexShader:function(){return bn}},toxic:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Ph},generateVertexShader:function(){return bn}},volcanic:{generateCloudShader:function(){return Mn},generateFragmentShader:function(){return Dh},generateVertexShader:function(){return bn}}},s)}/**
 * @license
 * Copyright 2010-2022 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Zo="140",Fh=0,Aa=1,zh=2,hc=1,Bh=2,fr=3,xr=0,ln=1,Oi=2,uc=1,Gn=0,Bi=1,Ca=2,La=3,Ra=4,Uh=5,Di=100,Oh=101,Hh=102,Pa=103,Da=104,Vh=200,Gh=201,kh=202,Wh=203,dc=204,fc=205,qh=206,Xh=207,jh=208,Jh=209,Yh=210,Zh=0,$h=1,Kh=2,zo=3,Qh=4,eu=5,tu=6,nu=7,Ls=0,iu=1,ru=2,Pn=0,su=1,ou=2,au=3,lu=4,cu=5,pc=300,Hi=301,Vi=302,Bo=303,Uo=304,Rs=306,Oo=1e3,on=1001,Ho=1002,bt=1003,Ia=1004,Na=1005,Gt=1006,hu=1007,Ps=1008,li=1009,uu=1010,du=1011,_r=1012,fu=1013,_s=1014,ri=1015,yr=1016,pu=1017,mu=1018,Ui=1020,gu=1021,vu=1022,an=1023,xu=1024,_u=1025,oi=1026,Gi=1027,yu=1028,bu=1029,Mu=1030,wu=1031,Su=1033,Xs=33776,js=33777,Js=33778,Ys=33779,Fa=35840,za=35841,Ba=35842,Ua=35843,Eu=36196,Oa=37492,Ha=37496,Va=37808,Ga=37809,ka=37810,Wa=37811,qa=37812,Xa=37813,ja=37814,Ja=37815,Ya=37816,Za=37817,$a=37818,Ka=37819,Qa=37820,el=37821,tl=36492,Tu=2200,Au=2201,Cu=2202,bs=2300,Ms=2301,Zs=2302,Ii=2400,Ni=2401,ws=2402,$o=2500,mc=2501,Lu=0,qn=3e3,ot=3001,Ru=3200,Pu=3201,qi=0,Du=1,Ln="srgb",si="srgb-linear",$s=7680,Iu=519,br=35044,Ss=35048,nl="300 es",Vo=1035;class ci{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}}const Et=[];for(let s=0;s<256;s++)Et[s]=(s<16?"0":"")+s.toString(16);const Ks=Math.PI/180,Go=180/Math.PI;function gn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Et[s&255]+Et[s>>8&255]+Et[s>>16&255]+Et[s>>24&255]+"-"+Et[e&255]+Et[e>>8&255]+"-"+Et[e>>16&15|64]+Et[e>>24&255]+"-"+Et[t&63|128]+Et[t>>8&255]+"-"+Et[t>>16&255]+Et[t>>24&255]+Et[n&255]+Et[n>>8&255]+Et[n>>16&255]+Et[n>>24&255]).toLowerCase()}function Rt(s,e,t){return Math.max(e,Math.min(t,s))}function Nu(s,e){return(s%e+e)%e}function Qs(s,e,t){return(1-t)*s+t*e}function il(s){return(s&s-1)===0&&s!==0}function ko(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}class Q{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e,t){return t!==void 0?(console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this)}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e,t){return t!==void 0?(console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this)}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn("THREE.Vector2: offset has been removed from .fromBufferAttribute()."),this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}Q.prototype.isVector2=!0;class Tt{constructor(){this.elements=[1,0,0,0,1,0,0,0,1],arguments.length>0&&console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")}set(e,t,n,i,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],m=i[0],f=i[3],v=i[6],w=i[1],E=i[4],b=i[7],T=i[2],L=i[5],I=i[8];return r[0]=o*m+a*w+l*T,r[3]=o*f+a*E+l*L,r[6]=o*v+a*b+l*I,r[1]=c*m+h*w+u*T,r[4]=c*f+h*E+u*L,r[7]=c*v+h*b+u*I,r[2]=d*m+p*w+g*T,r[5]=d*f+p*E+g*L,r[8]=d*v+p*b+g*I,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,p=c*r-o*l,g=t*u+n*d+i*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const m=1/g;return e[0]=u*m,e[1]=(i*c-h*n)*m,e[2]=(a*n-i*o)*m,e[3]=d*m,e[4]=(h*t-i*l)*m,e[5]=(i*r-a*t)*m,e[6]=p*m,e[7]=(n*l-c*t)*m,e[8]=(o*t-n*r)*m,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=t,n[4]*=t,n[7]*=t,this}rotate(e){const t=Math.cos(e),n=Math.sin(e),i=this.elements,r=i[0],o=i[3],a=i[6],l=i[1],c=i[4],h=i[7];return i[0]=t*r+n*l,i[3]=t*o+n*c,i[6]=t*a+n*h,i[1]=-n*r+t*l,i[4]=-n*o+t*c,i[7]=-n*a+t*h,this}translate(e,t){const n=this.elements;return n[0]+=e*n[2],n[3]+=e*n[5],n[6]+=e*n[8],n[1]+=t*n[2],n[4]+=t*n[5],n[7]+=t*n[8],this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}Tt.prototype.isMatrix3=!0;function gc(s){for(let e=s.length-1;e>=0;--e)if(s[e]>65535)return!0;return!1}function Mr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function ai(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ys(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const eo={[Ln]:{[si]:ai},[si]:{[Ln]:ys}},tn={legacyMode:!0,get workingColorSpace(){return si},set workingColorSpace(s){console.warn("THREE.ColorManagement: .workingColorSpace is readonly.")},convert:function(s,e,t){if(this.legacyMode||e===t||!e||!t)return s;if(eo[e]&&eo[e][t]!==void 0){const n=eo[e][t];return s.r=n(s.r),s.g=n(s.g),s.b=n(s.b),s}throw new Error("Unsupported color space conversion.")},fromWorkingColorSpace:function(s,e){return this.convert(s,this.workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this.workingColorSpace)}},vc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mt={r:0,g:0,b:0},nn={h:0,s:0,l:0},Hr={h:0,s:0,l:0};function to(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}function Vr(s,e){return e.r=s.r,e.g=s.g,e.b=s.b,e}class xe{constructor(e,t,n){return t===void 0&&n===void 0?this.set(e):this.setRGB(e,t,n)}set(e){return e&&e.isColor?this.copy(e):typeof e=="number"?this.setHex(e):typeof e=="string"&&this.setStyle(e),this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ln){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tn.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=si){return this.r=e,this.g=t,this.b=n,tn.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=si){if(e=Nu(e,1),t=Rt(t,0,1),n=Rt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=to(o,r,e+1/3),this.g=to(o,r,e),this.b=to(o,r,e-1/3)}return tn.toWorkingColorSpace(this,i),this}setStyle(e,t=Ln){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(e)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(255,parseInt(r[1],10))/255,this.g=Math.min(255,parseInt(r[2],10))/255,this.b=Math.min(255,parseInt(r[3],10))/255,tn.toWorkingColorSpace(this,t),n(r[4]),this;if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(100,parseInt(r[1],10))/100,this.g=Math.min(100,parseInt(r[2],10))/100,this.b=Math.min(100,parseInt(r[3],10))/100,tn.toWorkingColorSpace(this,t),n(r[4]),this;break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)){const l=parseFloat(r[1])/360,c=parseInt(r[2],10)/100,h=parseInt(r[3],10)/100;return n(r[4]),this.setHSL(l,c,h,t)}break}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],o=r.length;if(o===3)return this.r=parseInt(r.charAt(0)+r.charAt(0),16)/255,this.g=parseInt(r.charAt(1)+r.charAt(1),16)/255,this.b=parseInt(r.charAt(2)+r.charAt(2),16)/255,tn.toWorkingColorSpace(this,t),this;if(o===6)return this.r=parseInt(r.charAt(0)+r.charAt(1),16)/255,this.g=parseInt(r.charAt(2)+r.charAt(3),16)/255,this.b=parseInt(r.charAt(4)+r.charAt(5),16)/255,tn.toWorkingColorSpace(this,t),this}return e&&e.length>0?this.setColorName(e,t):this}setColorName(e,t=Ln){const n=vc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ai(e.r),this.g=ai(e.g),this.b=ai(e.b),this}copyLinearToSRGB(e){return this.r=ys(e.r),this.g=ys(e.g),this.b=ys(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ln){return tn.fromWorkingColorSpace(Vr(this,mt),e),Rt(mt.r*255,0,255)<<16^Rt(mt.g*255,0,255)<<8^Rt(mt.b*255,0,255)<<0}getHexString(e=Ln){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=si){tn.fromWorkingColorSpace(Vr(this,mt),t);const n=mt.r,i=mt.g,r=mt.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=si){return tn.fromWorkingColorSpace(Vr(this,mt),t),e.r=mt.r,e.g=mt.g,e.b=mt.b,e}getStyle(e=Ln){return tn.fromWorkingColorSpace(Vr(this,mt),e),e!==Ln?`color(${e} ${mt.r} ${mt.g} ${mt.b})`:`rgb(${mt.r*255|0},${mt.g*255|0},${mt.b*255|0})`}offsetHSL(e,t,n){return this.getHSL(nn),nn.h+=e,nn.s+=t,nn.l+=n,this.setHSL(nn.h,nn.s,nn.l),this}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(nn),e.getHSL(Hr);const n=Qs(nn.h,Hr.h,t),i=Qs(nn.s,Hr.s,t),r=Qs(nn.l,Hr.l,t);return this.setHSL(n,i,r),this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),e.normalized===!0&&(this.r/=255,this.g/=255,this.b/=255),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}xe.NAMES=vc;xe.prototype.isColor=!0;xe.prototype.r=1;xe.prototype.g=1;xe.prototype.b=1;let pi;class hi{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{pi===void 0&&(pi=Mr("canvas")),pi.width=e.width,pi.height=e.height;const n=pi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=pi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Mr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=ai(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ai(t[n]/255)*255):t[n]=ai(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}class Ko{constructor(e=null){this.uuid=gn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(no(i[o].image)):r.push(no(i[o]))}else r=no(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function no(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?hi.getDataURL(s):s.data?{data:Array.prototype.slice.call(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}Ko.prototype.isSource=!0;let Fu=0;class Mt extends ci{constructor(e=Mt.DEFAULT_IMAGE,t=Mt.DEFAULT_MAPPING,n=on,i=on,r=Gt,o=Ps,a=an,l=li,c=1,h=qn){super(),Object.defineProperty(this,"id",{value:Fu++}),this.uuid=gn(),this.name="",this.source=new Ko(e),this.mipmaps=[],this.mapping=t,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.encoding=e.encoding,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,type:this.type,encoding:this.encoding,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return JSON.stringify(this.userData)!=="{}"&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==pc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Oo:e.x=e.x-Math.floor(e.x);break;case on:e.x=e.x<0?0:1;break;case Ho:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Oo:e.y=e.y-Math.floor(e.y);break;case on:e.y=e.y<0?0:1;break;case Ho:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}}Mt.DEFAULT_IMAGE=null;Mt.DEFAULT_MAPPING=pc;Mt.prototype.isTexture=!0;class nt{constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e,t){return t!==void 0?(console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this)}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e,t){return t!==void 0?(console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this)}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],m=l[2],f=l[6],v=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-m)<.01&&Math.abs(g-f)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+m)<.1&&Math.abs(g+f)<.1&&Math.abs(c+p+v-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,b=(p+1)/2,T=(v+1)/2,L=(h+d)/4,I=(u+m)/4,y=(g+f)/4;return E>b&&E>T?E<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(E),i=L/n,r=I/n):b>T?b<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(b),n=L/i,r=y/i):T<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(T),n=I/r,i=y/r),this.set(n,i,r,t),this}let w=Math.sqrt((f-g)*(f-g)+(u-m)*(u-m)+(d-h)*(d-h));return Math.abs(w)<.001&&(w=1),this.x=(f-g)/w,this.y=(u-m)/w,this.z=(d-h)/w,this.w=Math.acos((c+p+v-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn("THREE.Vector4: offset has been removed from .fromBufferAttribute()."),this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}nt.prototype.isVector4=!0;class Yt extends ci{constructor(e,t,n={}){super(),this.width=e,this.height=t,this.depth=1,this.scissor=new nt(0,0,e,t),this.scissorTest=!1,this.viewport=new nt(0,0,e,t);const i={width:e,height:t,depth:1};this.texture=new Mt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.encoding),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.internalFormat=n.internalFormat!==void 0?n.internalFormat:null,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Gt,this.depthBuffer=n.depthBuffer!==void 0?n.depthBuffer:!0,this.stencilBuffer=n.stencilBuffer!==void 0?n.stencilBuffer:!1,this.depthTexture=n.depthTexture!==void 0?n.depthTexture:null,this.samples=n.samples!==void 0?n.samples:0}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Ko(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}Yt.prototype.isWebGLRenderTarget=!0;class Ds extends Mt{constructor(e=null,t=1,n=1,i=1){super(null),this.image={data:e,width:t,height:n,depth:i},this.magFilter=bt,this.minFilter=bt,this.wrapR=on,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}Ds.prototype.isDataArrayTexture=!0;class zu extends Yt{constructor(e,t,n){super(e,t),this.depth=n,this.texture=new Ds(null,e,t,n),this.texture.isRenderTargetTexture=!0}}zu.prototype.isWebGLArrayRenderTarget=!0;class Qo extends Mt{constructor(e=null,t=1,n=1,i=1){super(null),this.image={data:e,width:t,height:n,depth:i},this.magFilter=bt,this.minFilter=bt,this.wrapR=on,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}Qo.prototype.isData3DTexture=!0;class Bu extends Yt{constructor(e,t,n){super(e,t),this.depth=n,this.texture=new Qo(null,e,t,n),this.texture.isRenderTargetTexture=!0}}Bu.prototype.isWebGL3DRenderTarget=!0;class Uu extends Yt{constructor(e,t,n,i={}){super(e,t,i);const r=this.texture;this.texture=[];for(let o=0;o<n;o++)this.texture[o]=r.clone(),this.texture[o].isRenderTargetTexture=!0}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.texture.length;i<r;i++)this.texture[i].image.width=e,this.texture[i].image.height=t,this.texture[i].image.depth=n;this.dispose()}return this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t),this}copy(e){this.dispose(),this.width=e.width,this.height=e.height,this.depth=e.depth,this.viewport.set(0,0,this.width,this.height),this.scissor.set(0,0,this.width,this.height),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.texture.length=0;for(let t=0,n=e.texture.length;t<n;t++)this.texture[t]=e.texture[t].clone(),this.texture[t].isRenderTargetTexture=!0;return this}}Uu.prototype.isWebGLMultipleRenderTargets=!0;class kt{constructor(e=0,t=0,n=0,i=1){this._x=e,this._y=t,this._z=n,this._w=i}static slerp(e,t,n,i){return console.warn("THREE.Quaternion: Static .slerp() has been deprecated. Use qm.slerpQuaternions( qa, qb, t ) instead."),n.slerpQuaternions(e,t,i)}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[o+0],p=r[o+1],g=r[o+2],m=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=g,e[t+3]=m;return}if(u!==m||l!==d||c!==p||h!==g){let f=1-a;const v=l*d+c*p+h*g+u*m,w=v>=0?1:-1,E=1-v*v;if(E>Number.EPSILON){const T=Math.sqrt(E),L=Math.atan2(T,v*w);f=Math.sin(f*L)/T,a=Math.sin(a*L)/T}const b=a*w;if(l=l*f+d*b,c=c*f+p*b,h=h*f+g*b,u=u*f+m*b,f===1-a){const T=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=T,c*=T,h*=T,u*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*p-c*d,e[t+1]=l*g+h*d+c*u-a*p,e[t+2]=c*g+h*p+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t){if(!(e&&e.isEuler))throw new Error("THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.");const n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),p=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-i)*p}else if(n>a&&n>u){const p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(i+o)/p,this._z=(r+c)/p}else if(a>u){const p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(i+o)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-a);this._w=(o-i)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Rt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e,t){return t!==void 0?(console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."),this.multiplyQuaternions(e,t)):this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*r+t*this._z,this.normalize(),this._onChangeCallback(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),i=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(i),n*Math.sin(r),n*Math.cos(r),t*Math.sin(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}kt.prototype.isQuaternion=!0;class S{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e,t){return t!==void 0?(console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this.z+=e.z,this)}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e,t){return t!==void 0?(console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this.z-=e.z,this)}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e,t){return t!==void 0?(console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."),this.multiplyVectors(e,t)):(this.x*=e.x,this.y*=e.y,this.z*=e.z,this)}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return e&&e.isEuler||console.error("THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order."),this.applyQuaternion(rl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(rl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=l*t+o*i-a*n,h=l*n+a*t-r*i,u=l*i+r*n-o*t,d=-r*t-o*n-a*i;return this.x=c*l+d*-r+h*-a-u*-o,this.y=h*l+d*-o+u*-r-c*-a,this.z=u*l+d*-a+c*-o-h*-r,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e,t){return t!==void 0?(console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."),this.crossVectors(e,t)):this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return io.copy(this).projectOnVector(e),this.sub(io)}reflect(e){return this.sub(io.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn("THREE.Vector3: offset has been removed from .fromBufferAttribute()."),this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}S.prototype.isVector3=!0;const io=new S,rl=new kt;class cn{constructor(e=new S(1/0,1/0,1/0),t=new S(-1/0,-1/0,-1/0)){this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){let t=1/0,n=1/0,i=1/0,r=-1/0,o=-1/0,a=-1/0;for(let l=0,c=e.length;l<c;l+=3){const h=e[l],u=e[l+1],d=e[l+2];h<t&&(t=h),u<n&&(n=u),d<i&&(i=d),h>r&&(r=h),u>o&&(o=u),d>a&&(a=d)}return this.min.set(t,n,i),this.max.set(r,o,a),this}setFromBufferAttribute(e){let t=1/0,n=1/0,i=1/0,r=-1/0,o=-1/0,a=-1/0;for(let l=0,c=e.count;l<c;l++){const h=e.getX(l),u=e.getY(l),d=e.getZ(l);h<t&&(t=h),u<n&&(n=u),d<i&&(i=d),h>r&&(r=h),u>o&&(o=u),d>a&&(a=d)}return this.min.set(t,n,i),this.max.set(r,o,a),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Qn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0)if(t&&n.attributes!=null&&n.attributes.position!==void 0){const r=n.attributes.position;for(let o=0,a=r.count;o<a;o++)Qn.fromBufferAttribute(r,o).applyMatrix4(e.matrixWorld),this.expandByPoint(Qn)}else n.boundingBox===null&&n.computeBoundingBox(),ro.copy(n.boundingBox),ro.applyMatrix4(e.matrixWorld),this.union(ro);const i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Qn),Qn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(sr),Gr.subVectors(this.max,sr),mi.subVectors(e.a,sr),gi.subVectors(e.b,sr),vi.subVectors(e.c,sr),In.subVectors(gi,mi),Nn.subVectors(vi,gi),ei.subVectors(mi,vi);let t=[0,-In.z,In.y,0,-Nn.z,Nn.y,0,-ei.z,ei.y,In.z,0,-In.x,Nn.z,0,-Nn.x,ei.z,0,-ei.x,-In.y,In.x,0,-Nn.y,Nn.x,0,-ei.y,ei.x,0];return!so(t,mi,gi,vi,Gr)||(t=[1,0,0,0,1,0,0,0,1],!so(t,mi,gi,vi,Gr))?!1:(kr.crossVectors(In,Nn),t=[kr.x,kr.y,kr.z],so(t,mi,gi,vi,Gr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return Qn.copy(e).clamp(this.min,this.max).sub(e).length()}getBoundingSphere(e){return this.getCenter(e.center),e.radius=this.getSize(Qn).length()*.5,e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(wn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),wn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),wn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),wn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),wn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),wn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),wn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),wn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(wn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}cn.prototype.isBox3=!0;const wn=[new S,new S,new S,new S,new S,new S,new S,new S],Qn=new S,ro=new cn,mi=new S,gi=new S,vi=new S,In=new S,Nn=new S,ei=new S,sr=new S,Gr=new S,kr=new S,ti=new S;function so(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){ti.fromArray(s,r);const a=i.x*Math.abs(ti.x)+i.y*Math.abs(ti.y)+i.z*Math.abs(ti.z),l=e.dot(ti),c=t.dot(ti),h=n.dot(ti);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Ou=new cn,sl=new S,Wr=new S,oo=new S;class Xi{constructor(e=new S,t=-1){this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Ou.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){oo.subVectors(e,this.center);const t=oo.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.add(oo.multiplyScalar(i/n)),this.radius+=i}return this}union(e){return this.center.equals(e.center)===!0?Wr.set(0,0,1).multiplyScalar(e.radius):Wr.subVectors(e.center,this.center).normalize().multiplyScalar(e.radius),this.expandByPoint(sl.copy(e.center).add(Wr)),this.expandByPoint(sl.copy(e.center).sub(Wr)),this}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Sn=new S,ao=new S,qr=new S,Fn=new S,lo=new S,Xr=new S,co=new S;class ji{constructor(e=new S,t=new S(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.direction).multiplyScalar(e).add(this.origin)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Sn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.direction).multiplyScalar(n).add(this.origin)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Sn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Sn.copy(this.direction).multiplyScalar(t).add(this.origin),Sn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){ao.copy(e).add(t).multiplyScalar(.5),qr.copy(t).sub(e).normalize(),Fn.copy(this.origin).sub(ao);const r=e.distanceTo(t)*.5,o=-this.direction.dot(qr),a=Fn.dot(this.direction),l=-Fn.dot(qr),c=Fn.lengthSq(),h=Math.abs(1-o*o);let u,d,p,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const m=1/h;u*=m,d*=m,p=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.direction).multiplyScalar(u).add(this.origin),i&&i.copy(qr).multiplyScalar(d).add(ao),p}intersectSphere(e,t){Sn.subVectors(e.center,this.origin);const n=Sn.dot(this.direction),i=Sn.dot(Sn)-n*n,r=e.radius*e.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return a<0&&l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>i||((r>n||n!==n)&&(n=r),(o<i||i!==i)&&(i=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Sn)!==null}intersectTriangle(e,t,n,i,r){lo.subVectors(t,e),Xr.subVectors(n,e),co.crossVectors(lo,Xr);let o=this.direction.dot(co),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Fn.subVectors(this.origin,e);const l=a*this.direction.dot(Xr.crossVectors(Fn,Xr));if(l<0)return null;const c=a*this.direction.dot(lo.cross(Fn));if(c<0||l+c>o)return null;const h=-a*Fn.dot(co);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ce{constructor(){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],arguments.length>0&&console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")}set(e,t,n,i,r,o,a,l,c,h,u,d,p,g,m,f){const v=this.elements;return v[0]=e,v[4]=t,v[8]=n,v[12]=i,v[1]=r,v[5]=o,v[9]=a,v[13]=l,v[2]=c,v[6]=h,v[10]=u,v[14]=d,v[3]=p,v[7]=g,v[11]=m,v[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ce().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/xi.setFromMatrixColumn(e,0).length(),r=1/xi.setFromMatrixColumn(e,1).length(),o=1/xi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){e&&e.isEuler||console.error("THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");const t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=o*h,p=o*u,g=a*h,m=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=d-m*c,t[9]=-a*l,t[2]=m-d*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*h,p=l*u,g=c*h,m=c*u;t[0]=d+m*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-g,t[6]=m+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*h,p=l*u,g=c*h,m=c*u;t[0]=d-m*a,t[4]=-o*u,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*h,t[9]=m-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*h,p=o*u,g=a*h,m=a*u;t[0]=l*h,t[4]=g*c-p,t[8]=d*c+m,t[1]=l*u,t[5]=m*c+d,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,p=o*c,g=a*l,m=a*c;t[0]=l*h,t[4]=m-d*u,t[8]=g*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+g,t[10]=d-m*u}else if(e.order==="XZY"){const d=o*l,p=o*c,g=a*l,m=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+m,t[5]=o*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=a*h,t[10]=m*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Hu,e,Vu)}lookAt(e,t,n){const i=this.elements;return Xt.subVectors(e,t),Xt.lengthSq()===0&&(Xt.z=1),Xt.normalize(),zn.crossVectors(n,Xt),zn.lengthSq()===0&&(Math.abs(n.z)===1?Xt.x+=1e-4:Xt.z+=1e-4,Xt.normalize(),zn.crossVectors(n,Xt)),zn.normalize(),jr.crossVectors(Xt,zn),i[0]=zn.x,i[4]=jr.x,i[8]=Xt.x,i[1]=zn.y,i[5]=jr.y,i[9]=Xt.y,i[2]=zn.z,i[6]=jr.z,i[10]=Xt.z,this}multiply(e,t){return t!==void 0?(console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."),this.multiplyMatrices(e,t)):this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],m=n[6],f=n[10],v=n[14],w=n[3],E=n[7],b=n[11],T=n[15],L=i[0],I=i[4],y=i[8],C=i[12],N=i[1],P=i[5],ee=i[9],ne=i[13],R=i[2],G=i[6],z=i[10],k=i[14],X=i[3],B=i[7],H=i[11],K=i[15];return r[0]=o*L+a*N+l*R+c*X,r[4]=o*I+a*P+l*G+c*B,r[8]=o*y+a*ee+l*z+c*H,r[12]=o*C+a*ne+l*k+c*K,r[1]=h*L+u*N+d*R+p*X,r[5]=h*I+u*P+d*G+p*B,r[9]=h*y+u*ee+d*z+p*H,r[13]=h*C+u*ne+d*k+p*K,r[2]=g*L+m*N+f*R+v*X,r[6]=g*I+m*P+f*G+v*B,r[10]=g*y+m*ee+f*z+v*H,r[14]=g*C+m*ne+f*k+v*K,r[3]=w*L+E*N+b*R+T*X,r[7]=w*I+E*P+b*G+T*B,r[11]=w*y+E*ee+b*z+T*H,r[15]=w*C+E*ne+b*k+T*K,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],g=e[3],m=e[7],f=e[11],v=e[15];return g*(+r*l*u-i*c*u-r*a*d+n*c*d+i*a*p-n*l*p)+m*(+t*l*p-t*c*d+r*o*d-i*o*p+i*c*h-r*l*h)+f*(+t*c*u-t*a*p-r*o*u+n*o*p+r*a*h-n*c*h)+v*(-i*a*h-t*l*u+t*a*d+i*o*u-n*o*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],g=e[12],m=e[13],f=e[14],v=e[15],w=u*f*c-m*d*c+m*l*p-a*f*p-u*l*v+a*d*v,E=g*d*c-h*f*c-g*l*p+o*f*p+h*l*v-o*d*v,b=h*m*c-g*u*c+g*a*p-o*m*p-h*a*v+o*u*v,T=g*u*l-h*m*l-g*a*d+o*m*d+h*a*f-o*u*f,L=t*w+n*E+i*b+r*T;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/L;return e[0]=w*I,e[1]=(m*d*r-u*f*r-m*i*p+n*f*p+u*i*v-n*d*v)*I,e[2]=(a*f*r-m*l*r+m*i*c-n*f*c-a*i*v+n*l*v)*I,e[3]=(u*l*r-a*d*r-u*i*c+n*d*c+a*i*p-n*l*p)*I,e[4]=E*I,e[5]=(h*f*r-g*d*r+g*i*p-t*f*p-h*i*v+t*d*v)*I,e[6]=(g*l*r-o*f*r-g*i*c+t*f*c+o*i*v-t*l*v)*I,e[7]=(o*d*r-h*l*r+h*i*c-t*d*c-o*i*p+t*l*p)*I,e[8]=b*I,e[9]=(g*u*r-h*m*r-g*n*p+t*m*p+h*n*v-t*u*v)*I,e[10]=(o*m*r-g*a*r+g*n*c-t*m*c-o*n*v+t*a*v)*I,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*p-t*a*p)*I,e[12]=T*I,e[13]=(h*m*i-g*u*i+g*n*d-t*m*d-h*n*f+t*u*f)*I,e[14]=(g*a*i-o*m*i-g*n*l+t*m*l+o*n*f-t*a*f)*I,e[15]=(o*u*i-h*a*i+h*n*l-t*u*l-o*n*d+t*a*d)*I,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,p=r*h,g=r*u,m=o*h,f=o*u,v=a*u,w=l*c,E=l*h,b=l*u,T=n.x,L=n.y,I=n.z;return i[0]=(1-(m+v))*T,i[1]=(p+b)*T,i[2]=(g-E)*T,i[3]=0,i[4]=(p-b)*L,i[5]=(1-(d+v))*L,i[6]=(f+w)*L,i[7]=0,i[8]=(g+E)*I,i[9]=(f-w)*I,i[10]=(1-(d+m))*I,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=xi.set(i[0],i[1],i[2]).length();const o=xi.set(i[4],i[5],i[6]).length(),a=xi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],rn.copy(this);const c=1/r,h=1/o,u=1/a;return rn.elements[0]*=c,rn.elements[1]*=c,rn.elements[2]*=c,rn.elements[4]*=h,rn.elements[5]*=h,rn.elements[6]*=h,rn.elements[8]*=u,rn.elements[9]*=u,rn.elements[10]*=u,t.setFromRotationMatrix(rn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o){o===void 0&&console.warn("THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.");const a=this.elements,l=2*r/(t-e),c=2*r/(n-i),h=(t+e)/(t-e),u=(n+i)/(n-i),d=-(o+r)/(o-r),p=-2*o*r/(o-r);return a[0]=l,a[4]=0,a[8]=h,a[12]=0,a[1]=0,a[5]=c,a[9]=u,a[13]=0,a[2]=0,a[6]=0,a[10]=d,a[14]=p,a[3]=0,a[7]=0,a[11]=-1,a[15]=0,this}makeOrthographic(e,t,n,i,r,o){const a=this.elements,l=1/(t-e),c=1/(n-i),h=1/(o-r),u=(t+e)*l,d=(n+i)*c,p=(o+r)*h;return a[0]=2*l,a[4]=0,a[8]=0,a[12]=-u,a[1]=0,a[5]=2*c,a[9]=0,a[13]=-d,a[2]=0,a[6]=0,a[10]=-2*h,a[14]=-p,a[3]=0,a[7]=0,a[11]=0,a[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}Ce.prototype.isMatrix4=!0;const xi=new S,rn=new Ce,Hu=new S(0,0,0),Vu=new S(1,1,1),zn=new S,jr=new S,Xt=new S,ol=new Ce,al=new kt;class ui{constructor(e=0,t=0,n=0,i=ui.DefaultOrder){this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(Rt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Rt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Rt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Rt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Rt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Rt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ol.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ol,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return al.setFromEuler(this),this.setFromQuaternion(al,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ui.prototype.isEuler=!0;ui.DefaultOrder="XYZ";ui.RotationOrders=["XYZ","YZX","ZXY","XZY","YXZ","ZYX"];class xc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Gu=0;const ll=new S,_i=new kt,En=new Ce,Jr=new S,or=new S,ku=new S,Wu=new kt,cl=new S(1,0,0),hl=new S(0,1,0),ul=new S(0,0,1),qu={type:"added"},dl={type:"removed"};class et extends ci{constructor(){super(),Object.defineProperty(this,"id",{value:Gu++}),this.uuid=gn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=et.DefaultUp.clone();const e=new S,t=new ui,n=new kt,i=new S(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ce},normalMatrix:{value:new Tt}}),this.matrix=new Ce,this.matrixWorld=new Ce,this.matrixAutoUpdate=et.DefaultMatrixAutoUpdate,this.matrixWorldNeedsUpdate=!1,this.layers=new xc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return _i.setFromAxisAngle(e,t),this.quaternion.multiply(_i),this}rotateOnWorldAxis(e,t){return _i.setFromAxisAngle(e,t),this.quaternion.premultiply(_i),this}rotateX(e){return this.rotateOnAxis(cl,e)}rotateY(e){return this.rotateOnAxis(hl,e)}rotateZ(e){return this.rotateOnAxis(ul,e)}translateOnAxis(e,t){return ll.copy(e).applyQuaternion(this.quaternion),this.position.add(ll.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(cl,e)}translateY(e){return this.translateOnAxis(hl,e)}translateZ(e){return this.translateOnAxis(ul,e)}localToWorld(e){return e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return e.applyMatrix4(En.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Jr.copy(e):Jr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),or.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?En.lookAt(or,Jr,this.up):En.lookAt(Jr,or,this.up),this.quaternion.setFromRotationMatrix(En),i&&(En.extractRotation(i.matrixWorld),_i.setFromRotationMatrix(En),this.quaternion.premultiply(_i.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(qu)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(dl)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){for(let e=0;e<this.children.length;e++){const t=this.children[e];t.parent=null,t.dispatchEvent(dl)}return this.children.length=0,this}attach(e){return this.updateWorldMatrix(!0,!1),En.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),En.multiply(e.parent.matrixWorld)),e.applyMatrix4(En),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,e,ku),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,Wu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),JSON.stringify(this.userData)!=="{}"&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}et.DefaultUp=new S(0,1,0);et.DefaultMatrixAutoUpdate=!0;et.prototype.isObject3D=!0;const sn=new S,Tn=new S,ho=new S,An=new S,yi=new S,bi=new S,fl=new S,uo=new S,fo=new S,po=new S;class gt{constructor(e=new S,t=new S,n=new S){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),sn.subVectors(e,t),i.cross(sn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){sn.subVectors(i,t),Tn.subVectors(n,t),ho.subVectors(e,t);const o=sn.dot(sn),a=sn.dot(Tn),l=sn.dot(ho),c=Tn.dot(Tn),h=Tn.dot(ho),u=o*c-a*a;if(u===0)return r.set(-2,-1,-1);const d=1/u,p=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,An),An.x>=0&&An.y>=0&&An.x+An.y<=1}static getUV(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,An),l.set(0,0),l.addScaledVector(r,An.x),l.addScaledVector(o,An.y),l.addScaledVector(a,An.z),l}static isFrontFacing(e,t,n,i){return sn.subVectors(n,t),Tn.subVectors(e,t),sn.cross(Tn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return sn.subVectors(this.c,this.b),Tn.subVectors(this.a,this.b),sn.cross(Tn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return gt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return gt.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,i,r){return gt.getUV(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return gt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return gt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let o,a;yi.subVectors(i,n),bi.subVectors(r,n),uo.subVectors(e,n);const l=yi.dot(uo),c=bi.dot(uo);if(l<=0&&c<=0)return t.copy(n);fo.subVectors(e,i);const h=yi.dot(fo),u=bi.dot(fo);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(yi,o);po.subVectors(e,r);const p=yi.dot(po),g=bi.dot(po);if(g>=0&&p<=g)return t.copy(r);const m=p*c-l*g;if(m<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(bi,a);const f=h*g-p*u;if(f<=0&&u-h>=0&&p-g>=0)return fl.subVectors(r,i),a=(u-h)/(u-h+(p-g)),t.copy(i).addScaledVector(fl,a);const v=1/(f+m+d);return o=m*v,a=d*v,t.copy(n).addScaledVector(yi,o).addScaledVector(bi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}let Xu=0;class xt extends ci{constructor(){super(),Object.defineProperty(this,"id",{value:Xu++}),this.uuid=gn(),this.name="",this.type="Material",this.blending=Bi,this.side=xr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.blendSrc=dc,this.blendDst=fc,this.blendEquation=Di,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=zo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Iu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$s,this.stencilZFail=$s,this.stencilZPass=$s,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn("THREE.Material: '"+t+"' parameter is undefined.");continue}if(t==="shading"){console.warn("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead."),this.flatShading=n===uc;continue}const i=this[t];if(i===void 0){console.warn("THREE."+this.type+": '"+t+"' is not a property of this material.");continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Bi&&(n.blending=this.blending),this.side!==xr&&(n.side=this.side),this.vertexColors&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=this.transparent),n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.stencilWrite=this.stencilWrite,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(n.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=this.premultipliedAlpha),this.wireframe===!0&&(n.wireframe=this.wireframe),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=this.flatShading),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),JSON.stringify(this.userData)!=="{}"&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}xt.prototype.isMaterial=!0;xt.fromType=function(){return null};class Is extends xt{constructor(e){super(),this.type="MeshBasicMaterial",this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Ls,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}Is.prototype.isMeshBasicMaterial=!0;const ft=new S,Yr=new Q;class vt{constructor(e,t,n){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n===!0,this.usage=br,this.updateRange={offset:0,count:-1},this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}copyColorsArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn("THREE.BufferAttribute.copyColorsArray(): color is undefined",i),o=new xe),t[n++]=o.r,t[n++]=o.g,t[n++]=o.b}return this}copyVector2sArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn("THREE.BufferAttribute.copyVector2sArray(): vector is undefined",i),o=new Q),t[n++]=o.x,t[n++]=o.y}return this}copyVector3sArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn("THREE.BufferAttribute.copyVector3sArray(): vector is undefined",i),o=new S),t[n++]=o.x,t[n++]=o.y,t[n++]=o.z}return this}copyVector4sArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn("THREE.BufferAttribute.copyVector4sArray(): vector is undefined",i),o=new nt),t[n++]=o.x,t[n++]=o.y,t[n++]=o.z,t[n++]=o.w}return this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Yr.fromBufferAttribute(this,t),Yr.applyMatrix3(e),this.setXY(t,Yr.x,Yr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix3(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix4(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyNormalMatrix(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.transformDirection(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getX(e){return this.array[e*this.itemSize]}setX(e,t){return this.array[e*this.itemSize]=t,this}getY(e){return this.array[e*this.itemSize+1]}setY(e,t){return this.array[e*this.itemSize+1]=t,this}getZ(e){return this.array[e*this.itemSize+2]}setZ(e,t){return this.array[e*this.itemSize+2]=t,this}getW(e){return this.array[e*this.itemSize+3]}setW(e,t){return this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.prototype.slice.call(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==br&&(e.usage=this.usage),(this.updateRange.offset!==0||this.updateRange.count!==-1)&&(e.updateRange=this.updateRange),e}}vt.prototype.isBufferAttribute=!0;class _c extends vt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class yc extends vt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ju extends vt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}ju.prototype.isFloat16BufferAttribute=!0;class dt extends vt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Ju=0;const Kt=new Ce,mo=new et,Mi=new S,jt=new cn,ar=new cn,yt=new S;class st extends ci{constructor(){super(),Object.defineProperty(this,"id",{value:Ju++}),this.uuid=gn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(gc(e)?yc:_c)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Tt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Kt.makeRotationFromQuaternion(e),this.applyMatrix4(Kt),this}rotateX(e){return Kt.makeRotationX(e),this.applyMatrix4(Kt),this}rotateY(e){return Kt.makeRotationY(e),this.applyMatrix4(Kt),this}rotateZ(e){return Kt.makeRotationZ(e),this.applyMatrix4(Kt),this}translate(e,t,n){return Kt.makeTranslation(e,t,n),this.applyMatrix4(Kt),this}scale(e,t,n){return Kt.makeScale(e,t,n),this.applyMatrix4(Kt),this}lookAt(e){return mo.lookAt(e),mo.updateMatrix(),this.applyMatrix4(mo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Mi).negate(),this.translate(Mi.x,Mi.y,Mi.z),this}setFromPoints(e){const t=[];for(let n=0,i=e.length;n<i;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new dt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new cn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new S(-1/0,-1/0,-1/0),new S(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];jt.setFromBufferAttribute(r),this.morphTargetsRelative?(yt.addVectors(this.boundingBox.min,jt.min),this.boundingBox.expandByPoint(yt),yt.addVectors(this.boundingBox.max,jt.max),this.boundingBox.expandByPoint(yt)):(this.boundingBox.expandByPoint(jt.min),this.boundingBox.expandByPoint(jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Xi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new S,1/0);return}if(e){const n=this.boundingSphere.center;if(jt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ar.setFromBufferAttribute(a),this.morphTargetsRelative?(yt.addVectors(jt.min,ar.min),jt.expandByPoint(yt),yt.addVectors(jt.max,ar.max),jt.expandByPoint(yt)):(jt.expandByPoint(ar.min),jt.expandByPoint(ar.max))}jt.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)yt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(yt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)yt.fromBufferAttribute(a,c),l&&(Mi.fromBufferAttribute(e,c),yt.add(Mi)),i=Math.max(i,n.distanceToSquared(yt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.array,i=t.position.array,r=t.normal.array,o=t.uv.array,a=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new vt(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,c=[],h=[];for(let N=0;N<a;N++)c[N]=new S,h[N]=new S;const u=new S,d=new S,p=new S,g=new Q,m=new Q,f=new Q,v=new S,w=new S;function E(N,P,ee){u.fromArray(i,N*3),d.fromArray(i,P*3),p.fromArray(i,ee*3),g.fromArray(o,N*2),m.fromArray(o,P*2),f.fromArray(o,ee*2),d.sub(u),p.sub(u),m.sub(g),f.sub(g);const ne=1/(m.x*f.y-f.x*m.y);isFinite(ne)&&(v.copy(d).multiplyScalar(f.y).addScaledVector(p,-m.y).multiplyScalar(ne),w.copy(p).multiplyScalar(m.x).addScaledVector(d,-f.x).multiplyScalar(ne),c[N].add(v),c[P].add(v),c[ee].add(v),h[N].add(w),h[P].add(w),h[ee].add(w))}let b=this.groups;b.length===0&&(b=[{start:0,count:n.length}]);for(let N=0,P=b.length;N<P;++N){const ee=b[N],ne=ee.start,R=ee.count;for(let G=ne,z=ne+R;G<z;G+=3)E(n[G+0],n[G+1],n[G+2])}const T=new S,L=new S,I=new S,y=new S;function C(N){I.fromArray(r,N*3),y.copy(I);const P=c[N];T.copy(P),T.sub(I.multiplyScalar(I.dot(P))).normalize(),L.crossVectors(y,P);const ne=L.dot(h[N])<0?-1:1;l[N*4]=T.x,l[N*4+1]=T.y,l[N*4+2]=T.z,l[N*4+3]=ne}for(let N=0,P=b.length;N<P;++N){const ee=b[N],ne=ee.start,R=ee.count;for(let G=ne,z=ne+R;G<z;G+=3)C(n[G+0]),C(n[G+1]),C(n[G+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new vt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const i=new S,r=new S,o=new S,a=new S,l=new S,c=new S,h=new S,u=new S;if(e)for(let d=0,p=e.count;d<p;d+=3){const g=e.getX(d+0),m=e.getX(d+1),f=e.getX(d+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,m),o.fromBufferAttribute(t,f),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,m),c.fromBufferAttribute(n,f),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(m,l.x,l.y,l.z),n.setXYZ(f,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}merge(e,t){if(!(e&&e.isBufferGeometry)){console.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.",e);return}t===void 0&&(t=0,console.warn("THREE.BufferGeometry.merge(): Overwriting original geometry, starting at offset=0. Use BufferGeometryUtils.mergeBufferGeometries() for lossless merge."));const n=this.attributes;for(const i in n){if(e.attributes[i]===void 0)continue;const o=n[i].array,a=e.attributes[i],l=a.array,c=a.itemSize*t,h=Math.min(l.length,o.length-c);for(let u=0,d=c;u<h;u++,d++)o[d]=l[u]}return this}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)yt.fromBufferAttribute(e,t),yt.normalize(),e.setXYZ(t,yt.x,yt.y,yt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let p=0,g=0;for(let m=0,f=l.length;m<f;m++){a.isInterleavedBufferAttribute?p=l[m]*a.data.stride+a.offset:p=l[m]*h;for(let v=0;v<h;v++)d[g++]=c[p++]}return new vt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new st,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,e.parameters!==void 0&&(this.parameters=Object.assign({},e.parameters)),this}dispose(){this.dispatchEvent({type:"dispose"})}}st.prototype.isBufferGeometry=!0;const pl=new Ce,wi=new ji,go=new Xi,Bn=new S,Un=new S,On=new S,vo=new S,xo=new S,_o=new S,Zr=new S,$r=new S,Kr=new S,Qr=new Q,es=new Q,ts=new Q,yo=new S,ns=new S;class At extends et{constructor(e=new st,t=new Is){super(),this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=e.material,this.geometry=e.geometry,this}updateMorphTargets(){const e=this.geometry;if(e.isBufferGeometry){const t=e.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}else{const t=e.morphTargets;t!==void 0&&t.length>0&&console.error("THREE.Mesh.updateMorphTargets() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;if(i===void 0||(n.boundingSphere===null&&n.computeBoundingSphere(),go.copy(n.boundingSphere),go.applyMatrix4(r),e.ray.intersectsSphere(go)===!1)||(pl.copy(r).invert(),wi.copy(e.ray).applyMatrix4(pl),n.boundingBox!==null&&wi.intersectsBox(n.boundingBox)===!1))return;let o;if(n.isBufferGeometry){const a=n.index,l=n.attributes.position,c=n.morphAttributes.position,h=n.morphTargetsRelative,u=n.attributes.uv,d=n.attributes.uv2,p=n.groups,g=n.drawRange;if(a!==null)if(Array.isArray(i))for(let m=0,f=p.length;m<f;m++){const v=p[m],w=i[v.materialIndex],E=Math.max(v.start,g.start),b=Math.min(a.count,Math.min(v.start+v.count,g.start+g.count));for(let T=E,L=b;T<L;T+=3){const I=a.getX(T),y=a.getX(T+1),C=a.getX(T+2);o=is(this,w,e,wi,l,c,h,u,d,I,y,C),o&&(o.faceIndex=Math.floor(T/3),o.face.materialIndex=v.materialIndex,t.push(o))}}else{const m=Math.max(0,g.start),f=Math.min(a.count,g.start+g.count);for(let v=m,w=f;v<w;v+=3){const E=a.getX(v),b=a.getX(v+1),T=a.getX(v+2);o=is(this,i,e,wi,l,c,h,u,d,E,b,T),o&&(o.faceIndex=Math.floor(v/3),t.push(o))}}else if(l!==void 0)if(Array.isArray(i))for(let m=0,f=p.length;m<f;m++){const v=p[m],w=i[v.materialIndex],E=Math.max(v.start,g.start),b=Math.min(l.count,Math.min(v.start+v.count,g.start+g.count));for(let T=E,L=b;T<L;T+=3){const I=T,y=T+1,C=T+2;o=is(this,w,e,wi,l,c,h,u,d,I,y,C),o&&(o.faceIndex=Math.floor(T/3),o.face.materialIndex=v.materialIndex,t.push(o))}}else{const m=Math.max(0,g.start),f=Math.min(l.count,g.start+g.count);for(let v=m,w=f;v<w;v+=3){const E=v,b=v+1,T=v+2;o=is(this,i,e,wi,l,c,h,u,d,E,b,T),o&&(o.faceIndex=Math.floor(v/3),t.push(o))}}}else n.isGeometry&&console.error("THREE.Mesh.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}}At.prototype.isMesh=!0;function Yu(s,e,t,n,i,r,o,a){let l;if(e.side===ln?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side!==Oi,a),l===null)return null;ns.copy(a),ns.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(ns);return c<t.near||c>t.far?null:{distance:c,point:ns.clone(),object:s}}function is(s,e,t,n,i,r,o,a,l,c,h,u){Bn.fromBufferAttribute(i,c),Un.fromBufferAttribute(i,h),On.fromBufferAttribute(i,u);const d=s.morphTargetInfluences;if(r&&d){Zr.set(0,0,0),$r.set(0,0,0),Kr.set(0,0,0);for(let g=0,m=r.length;g<m;g++){const f=d[g],v=r[g];f!==0&&(vo.fromBufferAttribute(v,c),xo.fromBufferAttribute(v,h),_o.fromBufferAttribute(v,u),o?(Zr.addScaledVector(vo,f),$r.addScaledVector(xo,f),Kr.addScaledVector(_o,f)):(Zr.addScaledVector(vo.sub(Bn),f),$r.addScaledVector(xo.sub(Un),f),Kr.addScaledVector(_o.sub(On),f)))}Bn.add(Zr),Un.add($r),On.add(Kr)}s.isSkinnedMesh&&(s.boneTransform(c,Bn),s.boneTransform(h,Un),s.boneTransform(u,On));const p=Yu(s,e,t,n,Bn,Un,On,yo);if(p){a&&(Qr.fromBufferAttribute(a,c),es.fromBufferAttribute(a,h),ts.fromBufferAttribute(a,u),p.uv=gt.getUV(yo,Bn,Un,On,Qr,es,ts,new Q)),l&&(Qr.fromBufferAttribute(l,c),es.fromBufferAttribute(l,h),ts.fromBufferAttribute(l,u),p.uv2=gt.getUV(yo,Bn,Un,On,Qr,es,ts,new Q));const g={a:c,b:h,c:u,normal:new S,materialIndex:0};gt.getNormal(Bn,Un,On,g.normal),p.face=g}return p}class Ar extends st{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new dt(c,3)),this.setAttribute("normal",new dt(h,3)),this.setAttribute("uv",new dt(u,2));function g(m,f,v,w,E,b,T,L,I,y,C){const N=b/I,P=T/y,ee=b/2,ne=T/2,R=L/2,G=I+1,z=y+1;let k=0,X=0;const B=new S;for(let H=0;H<z;H++){const K=H*P-ne;for(let Y=0;Y<G;Y++){const se=Y*N-ee;B[m]=se*w,B[f]=K*E,B[v]=R,c.push(B.x,B.y,B.z),B[m]=0,B[f]=0,B[v]=L>0?1:-1,h.push(B.x,B.y,B.z),u.push(Y/I),u.push(1-H/y),k+=1}}for(let H=0;H<y;H++)for(let K=0;K<I;K++){const Y=d+K+G*H,se=d+K+G*(H+1),de=d+(K+1)+G*(H+1),ge=d+(K+1)+G*H;l.push(Y,se,ge),l.push(se,de,ge),X+=6}a.addGroup(p,X,C),p+=X,d+=k}}static fromJSON(e){return new Ar(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ki(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Lt(s){const e={};for(let t=0;t<s.length;t++){const n=ki(s[t]);for(const i in n)e[i]=n[i]}return e}const bc={clone:ki,merge:Lt};var Zu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$u=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Wt extends xt{constructor(e){super(),this.type="ShaderMaterial",this.defines={},this.uniforms={},this.vertexShader=Zu,this.fragmentShader=$u,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&(e.attributes!==void 0&&console.error("THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."),this.setValues(e))}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ki(e.uniforms),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}Wt.prototype.isShaderMaterial=!0;class ea extends et{constructor(){super(),this.type="Camera",this.matrixWorldInverse=new Ce,this.projectionMatrix=new Ce,this.projectionMatrixInverse=new Ce}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(-t[8],-t[9],-t[10]).normalize()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}ea.prototype.isCamera=!0;class Ft extends ea{constructor(e=50,t=1,n=.1,i=2e3){super(),this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Go*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ks*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Go*2*Math.atan(Math.tan(Ks*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ks*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}Ft.prototype.isPerspectiveCamera=!0;const Si=90,Ei=1;class ta extends et{constructor(e,t,n){if(super(),this.type="CubeCamera",n.isWebGLCubeRenderTarget!==!0){console.error("THREE.CubeCamera: The constructor now expects an instance of WebGLCubeRenderTarget as third parameter.");return}this.renderTarget=n;const i=new Ft(Si,Ei,e,t);i.layers=this.layers,i.up.set(0,-1,0),i.lookAt(new S(1,0,0)),this.add(i);const r=new Ft(Si,Ei,e,t);r.layers=this.layers,r.up.set(0,-1,0),r.lookAt(new S(-1,0,0)),this.add(r);const o=new Ft(Si,Ei,e,t);o.layers=this.layers,o.up.set(0,0,1),o.lookAt(new S(0,1,0)),this.add(o);const a=new Ft(Si,Ei,e,t);a.layers=this.layers,a.up.set(0,0,-1),a.lookAt(new S(0,-1,0)),this.add(a);const l=new Ft(Si,Ei,e,t);l.layers=this.layers,l.up.set(0,-1,0),l.lookAt(new S(0,0,1)),this.add(l);const c=new Ft(Si,Ei,e,t);c.layers=this.layers,c.up.set(0,-1,0),c.lookAt(new S(0,0,-1)),this.add(c)}update(e,t){this.parent===null&&this.updateMatrixWorld();const n=this.renderTarget,[i,r,o,a,l,c]=this.children,h=e.getRenderTarget(),u=e.toneMapping,d=e.xr.enabled;e.toneMapping=Pn,e.xr.enabled=!1;const p=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0),e.render(t,i),e.setRenderTarget(n,1),e.render(t,r),e.setRenderTarget(n,2),e.render(t,o),e.setRenderTarget(n,3),e.render(t,a),e.setRenderTarget(n,4),e.render(t,l),n.texture.generateMipmaps=p,e.setRenderTarget(n,5),e.render(t,c),e.setRenderTarget(h),e.toneMapping=u,e.xr.enabled=d,n.texture.needsPMREMUpdate=!0}}class Ns extends Mt{constructor(e,t,n,i,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Hi,super(e,t,n,i,r,o,a,l,c,h),this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}Ns.prototype.isCubeTexture=!0;class Mc extends Yt{constructor(e,t={}){super(e,e,t);const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Ns(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.encoding),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Gt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.encoding=t.encoding,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ar(5,5,5),r=new Wt({name:"CubemapFromEquirect",uniforms:ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ln,blending:Gn});r.uniforms.tEquirect.value=t;const o=new At(i,r),a=t.minFilter;return t.minFilter===Ps&&(t.minFilter=Gt),new ta(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}}Mc.prototype.isWebGLCubeRenderTarget=!0;const bo=new S,Ku=new S,Qu=new Tt;class Rn{constructor(e=new S(1,0,0),t=0){this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=bo.subVectors(n,t).cross(Ku.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(this.normal).multiplyScalar(-this.distanceToPoint(e)).add(e)}intersectLine(e,t){const n=e.delta(bo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(n).multiplyScalar(r).add(e.start)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Qu.getNormalMatrix(e),i=this.coplanarPoint(bo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}Rn.prototype.isPlane=!0;const Ti=new Xi,rs=new S;class Fs{constructor(e=new Rn,t=new Rn,n=new Rn,i=new Rn,r=new Rn,o=new Rn){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e){const t=this.planes,n=e.elements,i=n[0],r=n[1],o=n[2],a=n[3],l=n[4],c=n[5],h=n[6],u=n[7],d=n[8],p=n[9],g=n[10],m=n[11],f=n[12],v=n[13],w=n[14],E=n[15];return t[0].setComponents(a-i,u-l,m-d,E-f).normalize(),t[1].setComponents(a+i,u+l,m+d,E+f).normalize(),t[2].setComponents(a+r,u+c,m+p,E+v).normalize(),t[3].setComponents(a-r,u-c,m-p,E-v).normalize(),t[4].setComponents(a-o,u-h,m-g,E-w).normalize(),t[5].setComponents(a+o,u+h,m+g,E+w).normalize(),this}intersectsObject(e){const t=e.geometry;return t.boundingSphere===null&&t.computeBoundingSphere(),Ti.copy(t.boundingSphere).applyMatrix4(e.matrixWorld),this.intersectsSphere(Ti)}intersectsSprite(e){return Ti.center.set(0,0,0),Ti.radius=.7071067811865476,Ti.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ti)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(rs.x=i.normal.x>0?e.max.x:e.min.x,rs.y=i.normal.y>0?e.max.y:e.min.y,rs.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(rs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function wc(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function ed(s,e){const t=e.isWebGL2,n=new WeakMap;function i(c,h){const u=c.array,d=c.usage,p=s.createBuffer();s.bindBuffer(h,p),s.bufferData(h,u,d),c.onUploadCallback();let g;if(u instanceof Float32Array)g=5126;else if(u instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)g=5131;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else g=5123;else if(u instanceof Int16Array)g=5122;else if(u instanceof Uint32Array)g=5125;else if(u instanceof Int32Array)g=5124;else if(u instanceof Int8Array)g=5120;else if(u instanceof Uint8Array)g=5121;else if(u instanceof Uint8ClampedArray)g=5121;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:p,type:g,bytesPerElement:u.BYTES_PER_ELEMENT,version:c.version}}function r(c,h,u){const d=h.array,p=h.updateRange;s.bindBuffer(u,c),p.count===-1?s.bufferSubData(u,0,d):(t?s.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d,p.offset,p.count):s.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d.subarray(p.offset,p.offset+p.count)),p.count=-1)}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);h&&(s.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){const d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const u=n.get(c);u===void 0?n.set(c,i(c,h)):u.version<c.version&&(r(u.buffer,c,h),u.version=c.version)}return{get:o,remove:a,update:l}}class zs extends st{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=e/a,d=t/l,p=[],g=[],m=[],f=[];for(let v=0;v<h;v++){const w=v*d-o;for(let E=0;E<c;E++){const b=E*u-r;g.push(b,-w,0),m.push(0,0,1),f.push(E/a),f.push(1-v/l)}}for(let v=0;v<l;v++)for(let w=0;w<a;w++){const E=w+c*v,b=w+c*(v+1),T=w+1+c*(v+1),L=w+1+c*v;p.push(E,b,L),p.push(b,T,L)}this.setIndex(p),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(m,3)),this.setAttribute("uv",new dt(f,2))}static fromJSON(e){return new zs(e.width,e.height,e.widthSegments,e.heightSegments)}}var td=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,nd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,id=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,rd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,sd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,od=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ad="vec3 transformed = vec3( position );",ld=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cd=`vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif`,hd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );
		vec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ud=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,dd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,fd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,pd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,md=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,gd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,vd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,xd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,_d=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float linearToRelativeLuminance( const in vec3 color ) {
	vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
	return dot( weights, color.rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,yd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define r0 1.0
	#define v0 0.339
	#define m0 - 2.0
	#define r1 0.8
	#define v1 0.276
	#define m1 - 1.0
	#define r4 0.4
	#define v4 0.046
	#define m4 2.0
	#define r5 0.305
	#define v5 0.016
	#define m5 3.0
	#define r6 0.21
	#define v6 0.0038
	#define m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= r1 ) {
			mip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;
		} else if ( roughness >= r4 ) {
			mip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;
		} else if ( roughness >= r5 ) {
			mip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;
		} else if ( roughness >= r6 ) {
			mip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,bd=`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Md=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,Sd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ed=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Td="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ad=`vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Cd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 envColor = textureCubeUV( envMap, reflectVec, 0.0 );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Ld=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Rd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Pd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) ||defined( PHONG )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Dd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Id=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Nd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Fd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		return ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );
	#endif
}`,Ud=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Od=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Hd=`vec3 diffuse = vec3( 1.0 );
GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( -mvPosition.xyz );
GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;
vLightFront = vec3( 0.0 );
vIndirectFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
	vIndirectBack = vec3( 0.0 );
#endif
IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;
vIndirectFront += getAmbientLightIrradiance( ambientLightColor );
vIndirectFront += getLightProbeIrradiance( lightProbe, geometry.normal );
#ifdef DOUBLE_SIDED
	vIndirectBack += getAmbientLightIrradiance( ambientLightColor );
	vIndirectBack += getLightProbeIrradiance( lightProbe, backGeometry.normal );
#endif
#if NUM_POINT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		getPointLightInfo( pointLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_SPOT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotLightInfo( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_DIR_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		getDirectionalLightInfo( directionalLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_HEMI_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
		vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		#ifdef DOUBLE_SIDED
			vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry.normal );
		#endif
	}
	#pragma unroll_loop_end
#endif`,Vd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( PHYSICALLY_CORRECT_LIGHTS )
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#else
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Gd=`#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,kd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Wd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon
#define Material_LightProbeLOD( material )	(0)`,qd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Xd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
#define Material_LightProbeLOD( material )	(0)`,jd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= texture2D( specularColorMap, vUv ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( ior - 1.0 ) / ( ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,Jd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	vec3 FssEss = specularColor * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	vec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Yd=`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Zd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,$d=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,Kd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Qd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ef=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,tf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,nf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,rf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,sf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,of=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,af=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,lf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,cf=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,hf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,uf=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,df=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,ff=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,pf=`#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,mf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,xf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
		vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,_f=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,yf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,bf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,Mf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,wf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,Sf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ef=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Tf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Af=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Lf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Rf=`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );
		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
		bool frustumTest = all( frustumTestVec );
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ), 
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ), 
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,Pf=`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Df=`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		vec4 shadowWorldPosition;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias, 0 );
		vSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
		vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
#endif`,If=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Nf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ff=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,zf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Bf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Uf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Of=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Hf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Vf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Gf=`#ifdef USE_TRANSMISSION
	float transmissionAlpha = 1.0;
	float transmissionFactor = transmission;
	float thicknessFactor = thickness;
	#ifdef USE_TRANSMISSIONMAP
		transmissionFactor *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		thicknessFactor *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, roughnessFactor, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, ior, thicknessFactor,
		attenuationColor, attenuationDistance );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, transmissionFactor );
	transmissionAlpha = mix( transmissionAlpha, transmission.a, transmissionFactor );
#endif`,kf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		#ifdef texture2DLodEXT
			return texture2DLodEXT( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#else
			return texture2D( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#endif
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( attenuationDistance == 0.0 ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,Wf=`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,qf=`#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,Xf=`#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,jf=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,Jf=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,Yf=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,Zf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION )
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const $f=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Kf=`uniform sampler2D t2D;
varying vec2 vUv;
void main() {
	gl_FragColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		gl_FragColor = vec4( mix( pow( gl_FragColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), gl_FragColor.rgb * 0.0773993808, vec3( lessThanEqual( gl_FragColor.rgb, vec3( 0.04045 ) ) ) ), gl_FragColor.w );
	#endif
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Qf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ep=`#include <envmap_common_pars_fragment>
uniform float opacity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	vec3 vReflect = vWorldDirection;
	#include <envmap_fragment>
	gl_FragColor = envColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,tp=`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,np=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,ip=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,rp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,sp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,op=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,ap=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cp=`#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,hp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,up=`#define LAMBERT
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dp=`uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <emissivemap_fragment>
	#ifdef DOUBLE_SIDED
		reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
	#else
		reflectedLight.indirectDiffuse += vIndirectFront;
	#endif
	#include <lightmap_fragment>
	reflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );
	#ifdef DOUBLE_SIDED
		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
	#else
		reflectedLight.directDiffuse = vLightFront;
	#endif
	reflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb ) * getShadowMask();
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,pp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,gp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,vp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_p=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,yp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Sp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ep=`#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,Ap=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Cp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,Ve={alphamap_fragment:td,alphamap_pars_fragment:nd,alphatest_fragment:id,alphatest_pars_fragment:rd,aomap_fragment:sd,aomap_pars_fragment:od,begin_vertex:ad,beginnormal_vertex:ld,bsdfs:cd,bumpmap_pars_fragment:hd,clipping_planes_fragment:ud,clipping_planes_pars_fragment:dd,clipping_planes_pars_vertex:fd,clipping_planes_vertex:pd,color_fragment:md,color_pars_fragment:gd,color_pars_vertex:vd,color_vertex:xd,common:_d,cube_uv_reflection_fragment:yd,defaultnormal_vertex:bd,displacementmap_pars_vertex:Md,displacementmap_vertex:wd,emissivemap_fragment:Sd,emissivemap_pars_fragment:Ed,encodings_fragment:Td,encodings_pars_fragment:Ad,envmap_fragment:Cd,envmap_common_pars_fragment:Ld,envmap_pars_fragment:Rd,envmap_pars_vertex:Pd,envmap_physical_pars_fragment:Gd,envmap_vertex:Dd,fog_vertex:Id,fog_pars_vertex:Nd,fog_fragment:Fd,fog_pars_fragment:zd,gradientmap_pars_fragment:Bd,lightmap_fragment:Ud,lightmap_pars_fragment:Od,lights_lambert_vertex:Hd,lights_pars_begin:Vd,lights_toon_fragment:kd,lights_toon_pars_fragment:Wd,lights_phong_fragment:qd,lights_phong_pars_fragment:Xd,lights_physical_fragment:jd,lights_physical_pars_fragment:Jd,lights_fragment_begin:Yd,lights_fragment_maps:Zd,lights_fragment_end:$d,logdepthbuf_fragment:Kd,logdepthbuf_pars_fragment:Qd,logdepthbuf_pars_vertex:ef,logdepthbuf_vertex:tf,map_fragment:nf,map_pars_fragment:rf,map_particle_fragment:sf,map_particle_pars_fragment:of,metalnessmap_fragment:af,metalnessmap_pars_fragment:lf,morphcolor_vertex:cf,morphnormal_vertex:hf,morphtarget_pars_vertex:uf,morphtarget_vertex:df,normal_fragment_begin:ff,normal_fragment_maps:pf,normal_pars_fragment:mf,normal_pars_vertex:gf,normal_vertex:vf,normalmap_pars_fragment:xf,clearcoat_normal_fragment_begin:_f,clearcoat_normal_fragment_maps:yf,clearcoat_pars_fragment:bf,output_fragment:Mf,packing:wf,premultiplied_alpha_fragment:Sf,project_vertex:Ef,dithering_fragment:Tf,dithering_pars_fragment:Af,roughnessmap_fragment:Cf,roughnessmap_pars_fragment:Lf,shadowmap_pars_fragment:Rf,shadowmap_pars_vertex:Pf,shadowmap_vertex:Df,shadowmask_pars_fragment:If,skinbase_vertex:Nf,skinning_pars_vertex:Ff,skinning_vertex:zf,skinnormal_vertex:Bf,specularmap_fragment:Uf,specularmap_pars_fragment:Of,tonemapping_fragment:Hf,tonemapping_pars_fragment:Vf,transmission_fragment:Gf,transmission_pars_fragment:kf,uv_pars_fragment:Wf,uv_pars_vertex:qf,uv_vertex:Xf,uv2_pars_fragment:jf,uv2_pars_vertex:Jf,uv2_vertex:Yf,worldpos_vertex:Zf,background_vert:$f,background_frag:Kf,cube_vert:Qf,cube_frag:ep,depth_vert:tp,depth_frag:np,distanceRGBA_vert:ip,distanceRGBA_frag:rp,equirect_vert:sp,equirect_frag:op,linedashed_vert:ap,linedashed_frag:lp,meshbasic_vert:cp,meshbasic_frag:hp,meshlambert_vert:up,meshlambert_frag:dp,meshmatcap_vert:fp,meshmatcap_frag:pp,meshnormal_vert:mp,meshnormal_frag:gp,meshphong_vert:vp,meshphong_frag:xp,meshphysical_vert:_p,meshphysical_frag:yp,meshtoon_vert:bp,meshtoon_frag:Mp,points_vert:wp,points_frag:Sp,shadow_vert:Ep,shadow_frag:Tp,sprite_vert:Ap,sprite_frag:Cp},le={common:{diffuse:{value:new xe(16777215)},opacity:{value:1},map:{value:null},uvTransform:{value:new Tt},uv2Transform:{value:new Tt},alphaMap:{value:null},alphaTest:{value:0}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotShadowMap:{value:[]},spotShadowMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Tt}},sprite:{diffuse:{value:new xe(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Tt}}},mn={basic:{uniforms:Lt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.fog]),vertexShader:Ve.meshbasic_vert,fragmentShader:Ve.meshbasic_frag},lambert:{uniforms:Lt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.fog,le.lights,{emissive:{value:new xe(0)}}]),vertexShader:Ve.meshlambert_vert,fragmentShader:Ve.meshlambert_frag},phong:{uniforms:Lt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new xe(0)},specular:{value:new xe(1118481)},shininess:{value:30}}]),vertexShader:Ve.meshphong_vert,fragmentShader:Ve.meshphong_frag},standard:{uniforms:Lt([le.common,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.roughnessmap,le.metalnessmap,le.fog,le.lights,{emissive:{value:new xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag},toon:{uniforms:Lt([le.common,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.gradientmap,le.fog,le.lights,{emissive:{value:new xe(0)}}]),vertexShader:Ve.meshtoon_vert,fragmentShader:Ve.meshtoon_frag},matcap:{uniforms:Lt([le.common,le.bumpmap,le.normalmap,le.displacementmap,le.fog,{matcap:{value:null}}]),vertexShader:Ve.meshmatcap_vert,fragmentShader:Ve.meshmatcap_frag},points:{uniforms:Lt([le.points,le.fog]),vertexShader:Ve.points_vert,fragmentShader:Ve.points_frag},dashed:{uniforms:Lt([le.common,le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ve.linedashed_vert,fragmentShader:Ve.linedashed_frag},depth:{uniforms:Lt([le.common,le.displacementmap]),vertexShader:Ve.depth_vert,fragmentShader:Ve.depth_frag},normal:{uniforms:Lt([le.common,le.bumpmap,le.normalmap,le.displacementmap,{opacity:{value:1}}]),vertexShader:Ve.meshnormal_vert,fragmentShader:Ve.meshnormal_frag},sprite:{uniforms:Lt([le.sprite,le.fog]),vertexShader:Ve.sprite_vert,fragmentShader:Ve.sprite_frag},background:{uniforms:{uvTransform:{value:new Tt},t2D:{value:null}},vertexShader:Ve.background_vert,fragmentShader:Ve.background_frag},cube:{uniforms:Lt([le.envmap,{opacity:{value:1}}]),vertexShader:Ve.cube_vert,fragmentShader:Ve.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ve.equirect_vert,fragmentShader:Ve.equirect_frag},distanceRGBA:{uniforms:Lt([le.common,le.displacementmap,{referencePosition:{value:new S},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ve.distanceRGBA_vert,fragmentShader:Ve.distanceRGBA_frag},shadow:{uniforms:Lt([le.lights,le.fog,{color:{value:new xe(0)},opacity:{value:1}}]),vertexShader:Ve.shadow_vert,fragmentShader:Ve.shadow_frag}};mn.physical={uniforms:Lt([mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatNormalScale:{value:new Q(1,1)},clearcoatNormalMap:{value:null},sheen:{value:0},sheenColor:{value:new xe(0)},sheenColorMap:{value:null},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},transmission:{value:0},transmissionMap:{value:null},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:0},attenuationColor:{value:new xe(0)},specularIntensity:{value:1},specularIntensityMap:{value:null},specularColor:{value:new xe(1,1,1)},specularColorMap:{value:null}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag};function Lp(s,e,t,n,i,r){const o=new xe(0);let a=i===!0?0:1,l,c,h=null,u=0,d=null;function p(m,f){let v=!1,w=f.isScene===!0?f.background:null;w&&w.isTexture&&(w=e.get(w));const E=s.xr,b=E.getSession&&E.getSession();b&&b.environmentBlendMode==="additive"&&(w=null),w===null?g(o,a):w&&w.isColor&&(g(w,1),v=!0),(s.autoClear||v)&&s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil),w&&(w.isCubeTexture||w.mapping===Rs)?(c===void 0&&(c=new At(new Ar(1,1,1),new Wt({name:"BackgroundCubeMaterial",uniforms:ki(mn.cube.uniforms),vertexShader:mn.cube.vertexShader,fragmentShader:mn.cube.fragmentShader,side:ln,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,L,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=w,c.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,(h!==w||u!==w.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=w,u=w.version,d=s.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null)):w&&w.isTexture&&(l===void 0&&(l=new At(new zs(2,2),new Wt({name:"BackgroundMaterial",uniforms:ki(mn.background.uniforms),vertexShader:mn.background.vertexShader,fragmentShader:mn.background.fragmentShader,side:xr,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=w,w.matrixAutoUpdate===!0&&w.updateMatrix(),l.material.uniforms.uvTransform.value.copy(w.matrix),(h!==w||u!==w.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=w,u=w.version,d=s.toneMapping),l.layers.enableAll(),m.unshift(l,l.geometry,l.material,0,0,null))}function g(m,f){t.buffers.color.setClear(m.r,m.g,m.b,f,r)}return{getClearColor:function(){return o},setClearColor:function(m,f=1){o.set(m),a=f,g(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(m){a=m,g(o,a)},render:p}}function Rp(s,e,t,n){const i=s.getParameter(34921),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||r!==null,a={},l=f(null);let c=l,h=!1;function u(R,G,z,k,X){let B=!1;if(o){const H=m(k,z,G);c!==H&&(c=H,p(c.object)),B=v(R,k,z,X),B&&w(R,k,z,X)}else{const H=G.wireframe===!0;(c.geometry!==k.id||c.program!==z.id||c.wireframe!==H)&&(c.geometry=k.id,c.program=z.id,c.wireframe=H,B=!0)}X!==null&&t.update(X,34963),(B||h)&&(h=!1,y(R,G,z,k),X!==null&&s.bindBuffer(34963,t.get(X).buffer))}function d(){return n.isWebGL2?s.createVertexArray():r.createVertexArrayOES()}function p(R){return n.isWebGL2?s.bindVertexArray(R):r.bindVertexArrayOES(R)}function g(R){return n.isWebGL2?s.deleteVertexArray(R):r.deleteVertexArrayOES(R)}function m(R,G,z){const k=z.wireframe===!0;let X=a[R.id];X===void 0&&(X={},a[R.id]=X);let B=X[G.id];B===void 0&&(B={},X[G.id]=B);let H=B[k];return H===void 0&&(H=f(d()),B[k]=H),H}function f(R){const G=[],z=[],k=[];for(let X=0;X<i;X++)G[X]=0,z[X]=0,k[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:z,attributeDivisors:k,object:R,attributes:{},index:null}}function v(R,G,z,k){const X=c.attributes,B=G.attributes;let H=0;const K=z.getAttributes();for(const Y in K)if(K[Y].location>=0){const de=X[Y];let ge=B[Y];if(ge===void 0&&(Y==="instanceMatrix"&&R.instanceMatrix&&(ge=R.instanceMatrix),Y==="instanceColor"&&R.instanceColor&&(ge=R.instanceColor)),de===void 0||de.attribute!==ge||ge&&de.data!==ge.data)return!0;H++}return c.attributesNum!==H||c.index!==k}function w(R,G,z,k){const X={},B=G.attributes;let H=0;const K=z.getAttributes();for(const Y in K)if(K[Y].location>=0){let de=B[Y];de===void 0&&(Y==="instanceMatrix"&&R.instanceMatrix&&(de=R.instanceMatrix),Y==="instanceColor"&&R.instanceColor&&(de=R.instanceColor));const ge={};ge.attribute=de,de&&de.data&&(ge.data=de.data),X[Y]=ge,H++}c.attributes=X,c.attributesNum=H,c.index=k}function E(){const R=c.newAttributes;for(let G=0,z=R.length;G<z;G++)R[G]=0}function b(R){T(R,0)}function T(R,G){const z=c.newAttributes,k=c.enabledAttributes,X=c.attributeDivisors;z[R]=1,k[R]===0&&(s.enableVertexAttribArray(R),k[R]=1),X[R]!==G&&((n.isWebGL2?s:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](R,G),X[R]=G)}function L(){const R=c.newAttributes,G=c.enabledAttributes;for(let z=0,k=G.length;z<k;z++)G[z]!==R[z]&&(s.disableVertexAttribArray(z),G[z]=0)}function I(R,G,z,k,X,B){n.isWebGL2===!0&&(z===5124||z===5125)?s.vertexAttribIPointer(R,G,z,X,B):s.vertexAttribPointer(R,G,z,k,X,B)}function y(R,G,z,k){if(n.isWebGL2===!1&&(R.isInstancedMesh||k.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;E();const X=k.attributes,B=z.getAttributes(),H=G.defaultAttributeValues;for(const K in B){const Y=B[K];if(Y.location>=0){let se=X[K];if(se===void 0&&(K==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),K==="instanceColor"&&R.instanceColor&&(se=R.instanceColor)),se!==void 0){const de=se.normalized,ge=se.itemSize,W=t.get(se);if(W===void 0)continue;const Ge=W.buffer,we=W.type,Fe=W.bytesPerElement;if(se.isInterleavedBufferAttribute){const ie=se.data,ze=ie.stride,J=se.offset;if(ie.isInstancedInterleavedBuffer){for(let j=0;j<Y.locationSize;j++)T(Y.location+j,ie.meshPerAttribute);R.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let j=0;j<Y.locationSize;j++)b(Y.location+j);s.bindBuffer(34962,Ge);for(let j=0;j<Y.locationSize;j++)I(Y.location+j,ge/Y.locationSize,we,de,ze*Fe,(J+ge/Y.locationSize*j)*Fe)}else{if(se.isInstancedBufferAttribute){for(let ie=0;ie<Y.locationSize;ie++)T(Y.location+ie,se.meshPerAttribute);R.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let ie=0;ie<Y.locationSize;ie++)b(Y.location+ie);s.bindBuffer(34962,Ge);for(let ie=0;ie<Y.locationSize;ie++)I(Y.location+ie,ge/Y.locationSize,we,de,ge*Fe,ge/Y.locationSize*ie*Fe)}}else if(H!==void 0){const de=H[K];if(de!==void 0)switch(de.length){case 2:s.vertexAttrib2fv(Y.location,de);break;case 3:s.vertexAttrib3fv(Y.location,de);break;case 4:s.vertexAttrib4fv(Y.location,de);break;default:s.vertexAttrib1fv(Y.location,de)}}}}L()}function C(){ee();for(const R in a){const G=a[R];for(const z in G){const k=G[z];for(const X in k)g(k[X].object),delete k[X];delete G[z]}delete a[R]}}function N(R){if(a[R.id]===void 0)return;const G=a[R.id];for(const z in G){const k=G[z];for(const X in k)g(k[X].object),delete k[X];delete G[z]}delete a[R.id]}function P(R){for(const G in a){const z=a[G];if(z[R.id]===void 0)continue;const k=z[R.id];for(const X in k)g(k[X].object),delete k[X];delete z[R.id]}}function ee(){ne(),h=!0,c!==l&&(c=l,p(c.object))}function ne(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:u,reset:ee,resetDefaultState:ne,dispose:C,releaseStatesOfGeometry:N,releaseStatesOfProgram:P,initAttributes:E,enableAttribute:b,disableUnusedAttributes:L}}function Pp(s,e,t,n){const i=n.isWebGL2;let r;function o(c){r=c}function a(c,h){s.drawArrays(r,c,h),t.update(h,r,1)}function l(c,h,u){if(u===0)return;let d,p;if(i)d=s,p="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),p="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[p](r,c,h,u),t.update(h,r,u)}this.setMode=o,this.render=a,this.renderInstances=l}function Dp(s,e,t){let n;function i(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const I=e.get("EXT_texture_filter_anisotropic");n=s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(I){if(I==="highp"){if(s.getShaderPrecisionFormat(35633,36338).precision>0&&s.getShaderPrecisionFormat(35632,36338).precision>0)return"highp";I="mediump"}return I==="mediump"&&s.getShaderPrecisionFormat(35633,36337).precision>0&&s.getShaderPrecisionFormat(35632,36337).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&s instanceof WebGL2RenderingContext||typeof WebGL2ComputeRenderingContext<"u"&&s instanceof WebGL2ComputeRenderingContext;let a=t.precision!==void 0?t.precision:"highp";const l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,u=s.getParameter(34930),d=s.getParameter(35660),p=s.getParameter(3379),g=s.getParameter(34076),m=s.getParameter(34921),f=s.getParameter(36347),v=s.getParameter(36348),w=s.getParameter(36349),E=d>0,b=o||e.has("OES_texture_float"),T=E&&b,L=o?s.getParameter(36183):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:i,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:p,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:f,maxVaryings:v,maxFragmentUniforms:w,vertexTextures:E,floatFragmentTextures:b,floatVertexTextures:T,maxSamples:L}}function Ip(s){const e=this;let t=null,n=0,i=!1,r=!1;const o=new Rn,a=new Tt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d,p){const g=u.length!==0||d||n!==0||i;return i=d,t=h(u,p,0),n=u.length,g},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1,c()},this.setState=function(u,d,p){const g=u.clippingPlanes,m=u.clipIntersection,f=u.clipShadows,v=s.get(u);if(!i||g===null||g.length===0||r&&!f)r?h(null):c();else{const w=r?0:n,E=w*4;let b=v.clippingState||null;l.value=b,b=h(g,d,E,p);for(let T=0;T!==E;++T)b[T]=t[T];v.clippingState=b,this.numIntersection=m?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,g){const m=u!==null?u.length:0;let f=null;if(m!==0){if(f=l.value,g!==!0||f===null){const v=p+m*4,w=d.matrixWorldInverse;a.getNormalMatrix(w),(f===null||f.length<v)&&(f=new Float32Array(v));for(let E=0,b=p;E!==m;++E,b+=4)o.copy(u[E]).applyMatrix4(w,a),o.normal.toArray(f,b),f[b+3]=o.constant}l.value=f,l.needsUpdate=!0}return e.numPlanes=m,e.numIntersection=0,f}}function Np(s){let e=new WeakMap;function t(o,a){return a===Bo?o.mapping=Hi:a===Uo&&(o.mapping=Vi),o}function n(o){if(o&&o.isTexture&&o.isRenderTargetTexture===!1){const a=o.mapping;if(a===Bo||a===Uo)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Mc(l.height/2);return c.fromEquirectangularTexture(s,o),e.set(o,c),o.addEventListener("dispose",i),t(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class na extends ea{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}na.prototype.isOrthographicCamera=!0;const Fi=4,ml=[.125,.215,.35,.446,.526,.582],ii=20,Mo=new na,gl=new xe;let wo=null;const ni=(1+Math.sqrt(5))/2,Ai=1/ni,vl=[new S(1,1,1),new S(-1,1,1),new S(1,1,-1),new S(-1,1,-1),new S(0,ni,Ai),new S(0,ni,-Ai),new S(Ai,0,ni),new S(-Ai,0,ni),new S(ni,Ai,0),new S(-ni,Ai,0)];class xl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){wo=this._renderer.getRenderTarget(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,i,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=bl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=yl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(wo),e.scissorTest=!1,ss(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Hi||e.mapping===Vi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),wo=this._renderer.getRenderTarget();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Gt,minFilter:Gt,generateMipmaps:!1,type:yr,format:an,encoding:qn,depthBuffer:!1},i=_l(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=_l(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Fp(r)),this._blurMaterial=zp(r,e,t)}return i}_compileMaterial(e){const t=new At(this._lodPlanes[0],e);this._renderer.compile(t,Mo)}_sceneToCubeUV(e,t,n,i){const a=new Ft(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(gl),h.toneMapping=Pn,h.autoClear=!1;const p=new Is({name:"PMREM.Background",side:ln,depthWrite:!1,depthTest:!1}),g=new At(new Ar,p);let m=!1;const f=e.background;f?f.isColor&&(p.color.copy(f),e.background=null,m=!0):(p.color.copy(gl),m=!0);for(let v=0;v<6;v++){const w=v%3;w===0?(a.up.set(0,l[v],0),a.lookAt(c[v],0,0)):w===1?(a.up.set(0,0,l[v]),a.lookAt(0,c[v],0)):(a.up.set(0,l[v],0),a.lookAt(0,0,c[v]));const E=this._cubeSize;ss(i,w*E,v>2?E:0,E,E),h.setRenderTarget(i),m&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=f}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Hi||e.mapping===Vi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=bl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=yl());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new At(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;ss(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Mo)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){const r=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),o=vl[(i-1)%vl.length];this._blur(e,i-1,i,r,o)}t.autoClear=n}_blur(e,t,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new At(this._lodPlanes[i],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ii-1),m=r/g,f=isFinite(r)?1+Math.floor(h*m):ii;f>ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${ii}`);const v=[];let w=0;for(let I=0;I<ii;++I){const y=I/m,C=Math.exp(-y*y/2);v.push(C),I===0?w+=C:I<f&&(w+=2*C)}for(let I=0;I<v.length;I++)v[I]=v[I]/w;d.envMap.value=e.texture,d.samples.value=f,d.weights.value=v,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:E}=this;d.dTheta.value=g,d.mipInt.value=E-n;const b=this._sizeLods[i],T=3*b*(i>E-Fi?i-E+Fi:0),L=4*(this._cubeSize-b);ss(t,T,L,3*b,2*b),l.setRenderTarget(t),l.render(u,Mo)}}function Fp(s){const e=[],t=[],n=[];let i=s;const r=s-Fi+1+ml.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);t.push(a);let l=1/a;o>s-Fi?l=ml[o-s+Fi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,m=3,f=2,v=1,w=new Float32Array(m*g*p),E=new Float32Array(f*g*p),b=new Float32Array(v*g*p);for(let L=0;L<p;L++){const I=L%3*2/3-1,y=L>2?0:-1,C=[I,y,0,I+2/3,y,0,I+2/3,y+1,0,I,y,0,I+2/3,y+1,0,I,y+1,0];w.set(C,m*g*L),E.set(d,f*g*L);const N=[L,L,L,L,L,L];b.set(N,v*g*L)}const T=new st;T.setAttribute("position",new vt(w,m)),T.setAttribute("uv",new vt(E,f)),T.setAttribute("faceIndex",new vt(b,v)),e.push(T),i>Fi&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function _l(s,e,t){const n=new Yt(s,e,t);return n.texture.mapping=Rs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ss(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function zp(s,e,t){const n=new Float32Array(ii),i=new S(0,1,0);return new Wt({name:"SphericalGaussianBlur",defines:{n:ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ia(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function yl(){return new Wt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ia(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function bl(){return new Wt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ia(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function ia(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Bp(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Bo||l===Uo,h=l===Hi||l===Vi;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let u=e.get(a);return t===null&&(t=new xl(s)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),e.set(a,u),u.texture}else{if(e.has(a))return e.get(a).texture;{const u=a.image;if(c&&u&&u.height>0||h&&u&&i(u)){t===null&&(t=new xl(s));const d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",r),d.texture}else return null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Up(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?t("EXT_color_buffer_float"):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Op(s,e,t,n){const i={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete i[d.id];const p=r.get(d);p&&(e.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const g in d)e.update(d[g],34962);const p=u.morphAttributes;for(const g in p){const m=p[g];for(let f=0,v=m.length;f<v;f++)e.update(m[f],34962)}}function c(u){const d=[],p=u.index,g=u.attributes.position;let m=0;if(p!==null){const w=p.array;m=p.version;for(let E=0,b=w.length;E<b;E+=3){const T=w[E+0],L=w[E+1],I=w[E+2];d.push(T,L,L,I,I,T)}}else{const w=g.array;m=g.version;for(let E=0,b=w.length/3-1;E<b;E+=3){const T=E+0,L=E+1,I=E+2;d.push(T,L,L,I,I,T)}}const f=new(gc(d)?yc:_c)(d,1);f.version=m;const v=r.get(u);v&&e.remove(v),r.set(u,f)}function h(u){const d=r.get(u);if(d){const p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Hp(s,e,t,n){const i=n.isWebGL2;let r;function o(d){r=d}let a,l;function c(d){a=d.type,l=d.bytesPerElement}function h(d,p){s.drawElements(r,p,a,d*l),t.update(p,r,1)}function u(d,p,g){if(g===0)return;let m,f;if(i)m=s,f="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[f](r,p,a,d*l,g),t.update(p,r,g)}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=u}function Vp(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case 4:t.triangles+=a*(r/3);break;case 1:t.lines+=a*(r/2);break;case 3:t.lines+=a*(r-1);break;case 2:t.lines+=a*r;break;case 0:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.frame++,t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Gp(s,e){return s[0]-e[0]}function kp(s,e){return Math.abs(e[1])-Math.abs(s[1])}function So(s,e){let t=1;const n=e.isInterleavedBufferAttribute?e.data.array:e.array;n instanceof Int8Array?t=127:n instanceof Int16Array?t=32767:n instanceof Int32Array?t=2147483647:console.error("THREE.WebGLMorphtargets: Unsupported morph attribute data type: ",n),s.divideScalar(t)}function Wp(s,e,t){const n={},i=new Float32Array(8),r=new WeakMap,o=new nt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,u,d){const p=c.morphTargetInfluences;if(e.isWebGL2===!0){const g=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,m=g!==void 0?g.length:0;let f=r.get(h);if(f===void 0||f.count!==m){let G=function(){ne.dispose(),r.delete(h),h.removeEventListener("dispose",G)};f!==void 0&&f.texture.dispose();const E=h.morphAttributes.position!==void 0,b=h.morphAttributes.normal!==void 0,T=h.morphAttributes.color!==void 0,L=h.morphAttributes.position||[],I=h.morphAttributes.normal||[],y=h.morphAttributes.color||[];let C=0;E===!0&&(C=1),b===!0&&(C=2),T===!0&&(C=3);let N=h.attributes.position.count*C,P=1;N>e.maxTextureSize&&(P=Math.ceil(N/e.maxTextureSize),N=e.maxTextureSize);const ee=new Float32Array(N*P*4*m),ne=new Ds(ee,N,P,m);ne.type=ri,ne.needsUpdate=!0;const R=C*4;for(let z=0;z<m;z++){const k=L[z],X=I[z],B=y[z],H=N*P*4*z;for(let K=0;K<k.count;K++){const Y=K*R;E===!0&&(o.fromBufferAttribute(k,K),k.normalized===!0&&So(o,k),ee[H+Y+0]=o.x,ee[H+Y+1]=o.y,ee[H+Y+2]=o.z,ee[H+Y+3]=0),b===!0&&(o.fromBufferAttribute(X,K),X.normalized===!0&&So(o,X),ee[H+Y+4]=o.x,ee[H+Y+5]=o.y,ee[H+Y+6]=o.z,ee[H+Y+7]=0),T===!0&&(o.fromBufferAttribute(B,K),B.normalized===!0&&So(o,B),ee[H+Y+8]=o.x,ee[H+Y+9]=o.y,ee[H+Y+10]=o.z,ee[H+Y+11]=B.itemSize===4?o.w:1)}}f={count:m,texture:ne,size:new Q(N,P)},r.set(h,f),h.addEventListener("dispose",G)}let v=0;for(let E=0;E<p.length;E++)v+=p[E];const w=h.morphTargetsRelative?1:1-v;d.getUniforms().setValue(s,"morphTargetBaseInfluence",w),d.getUniforms().setValue(s,"morphTargetInfluences",p),d.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),d.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}else{const g=p===void 0?0:p.length;let m=n[h.id];if(m===void 0||m.length!==g){m=[];for(let b=0;b<g;b++)m[b]=[b,0];n[h.id]=m}for(let b=0;b<g;b++){const T=m[b];T[0]=b,T[1]=p[b]}m.sort(kp);for(let b=0;b<8;b++)b<g&&m[b][1]?(a[b][0]=m[b][0],a[b][1]=m[b][1]):(a[b][0]=Number.MAX_SAFE_INTEGER,a[b][1]=0);a.sort(Gp);const f=h.morphAttributes.position,v=h.morphAttributes.normal;let w=0;for(let b=0;b<8;b++){const T=a[b],L=T[0],I=T[1];L!==Number.MAX_SAFE_INTEGER&&I?(f&&h.getAttribute("morphTarget"+b)!==f[L]&&h.setAttribute("morphTarget"+b,f[L]),v&&h.getAttribute("morphNormal"+b)!==v[L]&&h.setAttribute("morphNormal"+b,v[L]),i[b]=I,w+=I):(f&&h.hasAttribute("morphTarget"+b)===!0&&h.deleteAttribute("morphTarget"+b),v&&h.hasAttribute("morphNormal"+b)===!0&&h.deleteAttribute("morphNormal"+b),i[b]=0)}const E=h.morphTargetsRelative?1:1-w;d.getUniforms().setValue(s,"morphTargetBaseInfluence",E),d.getUniforms().setValue(s,"morphTargetInfluences",i)}}return{update:l}}function qp(s,e,t,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);return i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),t.update(l.instanceMatrix,34962),l.instanceColor!==null&&t.update(l.instanceColor,34962)),u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const Sc=new Mt,Ec=new Ds,Tc=new Qo,Ac=new Ns,Ml=[],wl=[],Sl=new Float32Array(16),El=new Float32Array(9),Tl=new Float32Array(4);function Ji(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Ml[i];if(r===void 0&&(r=new Float32Array(i),Ml[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function zt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Bt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function Bs(s,e){let t=wl[e];t===void 0&&(t=new Int32Array(e),wl[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function Xp(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function jp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;s.uniform2fv(this.addr,e),Bt(t,e)}}function Jp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(zt(t,e))return;s.uniform3fv(this.addr,e),Bt(t,e)}}function Yp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;s.uniform4fv(this.addr,e),Bt(t,e)}}function Zp(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Bt(t,e)}else{if(zt(t,n))return;Tl.set(n),s.uniformMatrix2fv(this.addr,!1,Tl),Bt(t,n)}}function $p(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Bt(t,e)}else{if(zt(t,n))return;El.set(n),s.uniformMatrix3fv(this.addr,!1,El),Bt(t,n)}}function Kp(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Bt(t,e)}else{if(zt(t,n))return;Sl.set(n),s.uniformMatrix4fv(this.addr,!1,Sl),Bt(t,n)}}function Qp(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function em(s,e){const t=this.cache;zt(t,e)||(s.uniform2iv(this.addr,e),Bt(t,e))}function tm(s,e){const t=this.cache;zt(t,e)||(s.uniform3iv(this.addr,e),Bt(t,e))}function nm(s,e){const t=this.cache;zt(t,e)||(s.uniform4iv(this.addr,e),Bt(t,e))}function im(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function rm(s,e){const t=this.cache;zt(t,e)||(s.uniform2uiv(this.addr,e),Bt(t,e))}function sm(s,e){const t=this.cache;zt(t,e)||(s.uniform3uiv(this.addr,e),Bt(t,e))}function om(s,e){const t=this.cache;zt(t,e)||(s.uniform4uiv(this.addr,e),Bt(t,e))}function am(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2D(e||Sc,i)}function lm(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Tc,i)}function cm(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Ac,i)}function hm(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Ec,i)}function um(s){switch(s){case 5126:return Xp;case 35664:return jp;case 35665:return Jp;case 35666:return Yp;case 35674:return Zp;case 35675:return $p;case 35676:return Kp;case 5124:case 35670:return Qp;case 35667:case 35671:return em;case 35668:case 35672:return tm;case 35669:case 35673:return nm;case 5125:return im;case 36294:return rm;case 36295:return sm;case 36296:return om;case 35678:case 36198:case 36298:case 36306:case 35682:return am;case 35679:case 36299:case 36307:return lm;case 35680:case 36300:case 36308:case 36293:return cm;case 36289:case 36303:case 36311:case 36292:return hm}}function dm(s,e){s.uniform1fv(this.addr,e)}function fm(s,e){const t=Ji(e,this.size,2);s.uniform2fv(this.addr,t)}function pm(s,e){const t=Ji(e,this.size,3);s.uniform3fv(this.addr,t)}function mm(s,e){const t=Ji(e,this.size,4);s.uniform4fv(this.addr,t)}function gm(s,e){const t=Ji(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function vm(s,e){const t=Ji(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function xm(s,e){const t=Ji(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function _m(s,e){s.uniform1iv(this.addr,e)}function ym(s,e){s.uniform2iv(this.addr,e)}function bm(s,e){s.uniform3iv(this.addr,e)}function Mm(s,e){s.uniform4iv(this.addr,e)}function wm(s,e){s.uniform1uiv(this.addr,e)}function Sm(s,e){s.uniform2uiv(this.addr,e)}function Em(s,e){s.uniform3uiv(this.addr,e)}function Tm(s,e){s.uniform4uiv(this.addr,e)}function Am(s,e,t){const n=e.length,i=Bs(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.setTexture2D(e[r]||Sc,i[r])}function Cm(s,e,t){const n=e.length,i=Bs(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.setTexture3D(e[r]||Tc,i[r])}function Lm(s,e,t){const n=e.length,i=Bs(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.setTextureCube(e[r]||Ac,i[r])}function Rm(s,e,t){const n=e.length,i=Bs(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.setTexture2DArray(e[r]||Ec,i[r])}function Pm(s){switch(s){case 5126:return dm;case 35664:return fm;case 35665:return pm;case 35666:return mm;case 35674:return gm;case 35675:return vm;case 35676:return xm;case 5124:case 35670:return _m;case 35667:case 35671:return ym;case 35668:case 35672:return bm;case 35669:case 35673:return Mm;case 5125:return wm;case 36294:return Sm;case 36295:return Em;case 36296:return Tm;case 35678:case 36198:case 36298:case 36306:case 35682:return Am;case 35679:case 36299:case 36307:return Cm;case 35680:case 36300:case 36308:case 36293:return Lm;case 36289:case 36303:case 36311:case 36292:return Rm}}function Dm(s,e,t){this.id=s,this.addr=t,this.cache=[],this.setValue=um(e.type)}function Im(s,e,t){this.id=s,this.addr=t,this.cache=[],this.size=e.size,this.setValue=Pm(e.type)}function Cc(s){this.id=s,this.seq=[],this.map={}}Cc.prototype.setValue=function(s,e,t){const n=this.seq;for(let i=0,r=n.length;i!==r;++i){const o=n[i];o.setValue(s,e[o.id],t)}};const Eo=/(\w+)(\])?(\[|\.)?/g;function Al(s,e){s.seq.push(e),s.map[e.id]=e}function Nm(s,e,t){const n=s.name,i=n.length;for(Eo.lastIndex=0;;){const r=Eo.exec(n),o=Eo.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Al(t,c===void 0?new Dm(a,s,e):new Im(a,s,e));break}else{let u=t.map[a];u===void 0&&(u=new Cc(a),Al(t,u)),t=u}}}function kn(s,e){this.seq=[],this.map={};const t=s.getProgramParameter(e,35718);for(let n=0;n<t;++n){const i=s.getActiveUniform(e,n),r=s.getUniformLocation(e,i.name);Nm(i,r,this)}}kn.prototype.setValue=function(s,e,t,n){const i=this.map[e];i!==void 0&&i.setValue(s,t,n)};kn.prototype.setOptional=function(s,e,t){const n=e[t];n!==void 0&&this.setValue(s,t,n)};kn.upload=function(s,e,t,n){for(let i=0,r=e.length;i!==r;++i){const o=e[i],a=t[o.id];a.needsUpdate!==!1&&o.setValue(s,a.value,n)}};kn.seqWithValue=function(s,e){const t=[];for(let n=0,i=s.length;n!==i;++n){const r=s[n];r.id in e&&t.push(r)}return t};function Cl(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}let Fm=0;function zm(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++)n.push(o+1+": "+t[o]);return n.join(`
`)}function Bm(s){switch(s){case qn:return["Linear","( value )"];case ot:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported encoding:",s),["Linear","( value )"]}}function Ll(s,e,t){const n=s.getShaderParameter(e,35713),i=s.getShaderInfoLog(e).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[0]);return t.toUpperCase()+`

`+i+`

`+zm(s.getShaderSource(e),o)}else return i}function Um(s,e){const t=Bm(e);return"vec4 "+s+"( vec4 value ) { return LinearTo"+t[0]+t[1]+"; }"}function Om(s,e){let t;switch(e){case su:t="Linear";break;case ou:t="Reinhard";break;case au:t="OptimizedCineon";break;case lu:t="ACESFilmic";break;case cu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Hm(s){return[s.extensionDerivatives||s.envMapCubeUVHeight||s.bumpMap||s.tangentSpaceNormalMap||s.clearcoatNormalMap||s.flatShading||s.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(s.extensionFragDepth||s.logarithmicDepthBuffer)&&s.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",s.extensionDrawBuffers&&s.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(s.extensionShaderTextureLOD||s.envMap||s.transmission)&&s.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(pr).join(`
`)}function Vm(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Gm(s,e){const t={},n=s.getProgramParameter(e,35721);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),o=r.name;let a=1;r.type===35674&&(a=2),r.type===35675&&(a=3),r.type===35676&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function pr(s){return s!==""}function Rl(s,e){return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Pl(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const km=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wo(s){return s.replace(km,Wm)}function Wm(s,e){const t=Ve[e];if(t===void 0)throw new Error("Can not resolve #include <"+e+">");return Wo(t)}const qm=/#pragma unroll_loop[\s]+?for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g,Xm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Dl(s){return s.replace(Xm,Lc).replace(qm,jm)}function jm(s,e,t,n){return console.warn("WebGLProgram: #pragma unroll_loop shader syntax is deprecated. Please use #pragma unroll_loop_start syntax instead."),Lc(s,e,t,n)}function Lc(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Il(s){let e="precision "+s.precision+` float;
precision `+s.precision+" int;";return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Jm(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===hc?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Bh?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===fr&&(e="SHADOWMAP_TYPE_VSM"),e}function Ym(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Hi:case Vi:e="ENVMAP_TYPE_CUBE";break;case Rs:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Zm(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Vi:e="ENVMAP_MODE_REFRACTION";break}return e}function $m(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Ls:e="ENVMAP_BLENDING_MULTIPLY";break;case iu:e="ENVMAP_BLENDING_MIX";break;case ru:e="ENVMAP_BLENDING_ADD";break}return e}function Km(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Qm(s,e,t,n){const i=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Jm(t),c=Ym(t),h=Zm(t),u=$m(t),d=Km(t),p=t.isWebGL2?"":Hm(t),g=Vm(r),m=i.createProgram();let f,v,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=[g].filter(pr).join(`
`),f.length>0&&(f+=`
`),v=[p,g].filter(pr).join(`
`),v.length>0&&(v+=`
`)):(f=[Il(t),"#define SHADER_NAME "+t.shaderName,g,t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.supportsVertexTextures?"#define VERTEX_TEXTURES":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMap&&t.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",t.normalMap&&t.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.displacementMap&&t.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",t.specularColorMap?"#define USE_SPECULARCOLORMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEENCOLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUvs?"#define USE_UV":"",t.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pr).join(`
`),v=[p,Il(t),"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMap&&t.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",t.normalMap&&t.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",t.specularColorMap?"#define USE_SPECULARCOLORMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEENCOLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUvs?"#define USE_UV":"",t.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.physicallyCorrectLights?"#define PHYSICALLY_CORRECT_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Pn?"#define TONE_MAPPING":"",t.toneMapping!==Pn?Ve.tonemapping_pars_fragment:"",t.toneMapping!==Pn?Om("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ve.encodings_pars_fragment,Um("linearToOutputTexel",t.outputEncoding),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(pr).join(`
`)),o=Wo(o),o=Rl(o,t),o=Pl(o,t),a=Wo(a),a=Rl(a,t),a=Pl(a,t),o=Dl(o),a=Dl(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,f=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,v=["#define varying in",t.glslVersion===nl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===nl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const E=w+f+o,b=w+v+a,T=Cl(i,35633,E),L=Cl(i,35632,b);if(i.attachShader(m,T),i.attachShader(m,L),t.index0AttributeName!==void 0?i.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(m,0,"position"),i.linkProgram(m),s.debug.checkShaderErrors){const C=i.getProgramInfoLog(m).trim(),N=i.getShaderInfoLog(T).trim(),P=i.getShaderInfoLog(L).trim();let ee=!0,ne=!0;if(i.getProgramParameter(m,35714)===!1){ee=!1;const R=Ll(i,T,"vertex"),G=Ll(i,L,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(m,35715)+`

Program Info Log: `+C+`
`+R+`
`+G)}else C!==""?console.warn("THREE.WebGLProgram: Program Info Log:",C):(N===""||P==="")&&(ne=!1);ne&&(this.diagnostics={runnable:ee,programLog:C,vertexShader:{log:N,prefix:f},fragmentShader:{log:P,prefix:v}})}i.deleteShader(T),i.deleteShader(L);let I;this.getUniforms=function(){return I===void 0&&(I=new kn(i,m)),I};let y;return this.getAttributes=function(){return y===void 0&&(y=Gm(i,m)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.name=t.shaderName,this.id=Fm++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=T,this.fragmentShader=L,this}let eg=0;class tg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;return t.has(e)===!1&&t.set(e,new Set),t.get(e)}_getShaderStage(e){const t=this.shaderCache;if(t.has(e)===!1){const n=new ng(e);t.set(e,n)}return t.get(e)}}class ng{constructor(e){this.id=eg++,this.code=e,this.usedTimes=0}}function ig(s,e,t,n,i,r,o){const a=new xc,l=new tg,c=[],h=i.isWebGL2,u=i.logarithmicDepthBuffer,d=i.vertexTextures;let p=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y,C,N,P,ee){const ne=P.fog,R=ee.geometry,G=y.isMeshStandardMaterial?P.environment:null,z=(y.isMeshStandardMaterial?t:e).get(y.envMap||G),k=z&&z.mapping===Rs?z.image.height:null,X=g[y.type];y.precision!==null&&(p=i.getMaxPrecision(y.precision),p!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",p,"instead."));const B=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,H=B!==void 0?B.length:0;let K=0;R.morphAttributes.position!==void 0&&(K=1),R.morphAttributes.normal!==void 0&&(K=2),R.morphAttributes.color!==void 0&&(K=3);let Y,se,de,ge;if(X){const ie=mn[X];Y=ie.vertexShader,se=ie.fragmentShader}else Y=y.vertexShader,se=y.fragmentShader,l.update(y),de=l.getVertexShaderID(y),ge=l.getFragmentShaderID(y);const W=s.getRenderTarget(),Ge=y.alphaTest>0,we=y.clearcoat>0;return{isWebGL2:h,shaderID:X,shaderName:y.type,vertexShader:Y,fragmentShader:se,defines:y.defines,customVertexShaderID:de,customFragmentShaderID:ge,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:p,instancing:ee.isInstancedMesh===!0,instancingColor:ee.isInstancedMesh===!0&&ee.instanceColor!==null,supportsVertexTextures:d,outputEncoding:W===null?s.outputEncoding:W.isXRRenderTarget===!0?W.texture.encoding:qn,map:!!y.map,matcap:!!y.matcap,envMap:!!z,envMapMode:z&&z.mapping,envMapCubeUVHeight:k,lightMap:!!y.lightMap,aoMap:!!y.aoMap,emissiveMap:!!y.emissiveMap,bumpMap:!!y.bumpMap,normalMap:!!y.normalMap,objectSpaceNormalMap:y.normalMapType===Du,tangentSpaceNormalMap:y.normalMapType===qi,decodeVideoTexture:!!y.map&&y.map.isVideoTexture===!0&&y.map.encoding===ot,clearcoat:we,clearcoatMap:we&&!!y.clearcoatMap,clearcoatRoughnessMap:we&&!!y.clearcoatRoughnessMap,clearcoatNormalMap:we&&!!y.clearcoatNormalMap,displacementMap:!!y.displacementMap,roughnessMap:!!y.roughnessMap,metalnessMap:!!y.metalnessMap,specularMap:!!y.specularMap,specularIntensityMap:!!y.specularIntensityMap,specularColorMap:!!y.specularColorMap,opaque:y.transparent===!1&&y.blending===Bi,alphaMap:!!y.alphaMap,alphaTest:Ge,gradientMap:!!y.gradientMap,sheen:y.sheen>0,sheenColorMap:!!y.sheenColorMap,sheenRoughnessMap:!!y.sheenRoughnessMap,transmission:y.transmission>0,transmissionMap:!!y.transmissionMap,thicknessMap:!!y.thicknessMap,combine:y.combine,vertexTangents:!!y.normalMap&&!!R.attributes.tangent,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,vertexUvs:!!y.map||!!y.bumpMap||!!y.normalMap||!!y.specularMap||!!y.alphaMap||!!y.emissiveMap||!!y.roughnessMap||!!y.metalnessMap||!!y.clearcoatMap||!!y.clearcoatRoughnessMap||!!y.clearcoatNormalMap||!!y.displacementMap||!!y.transmissionMap||!!y.thicknessMap||!!y.specularIntensityMap||!!y.specularColorMap||!!y.sheenColorMap||!!y.sheenRoughnessMap,uvsVertexOnly:!(y.map||y.bumpMap||y.normalMap||y.specularMap||y.alphaMap||y.emissiveMap||y.roughnessMap||y.metalnessMap||y.clearcoatNormalMap||y.transmission>0||y.transmissionMap||y.thicknessMap||y.specularIntensityMap||y.specularColorMap||y.sheen>0||y.sheenColorMap||y.sheenRoughnessMap)&&!!y.displacementMap,fog:!!ne,useFog:y.fog===!0,fogExp2:ne&&ne.isFogExp2,flatShading:!!y.flatShading,sizeAttenuation:y.sizeAttenuation,logarithmicDepthBuffer:u,skinning:ee.isSkinnedMesh===!0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:H,morphTextureStride:K,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&N.length>0,shadowMapType:s.shadowMap.type,toneMapping:y.toneMapped?s.toneMapping:Pn,physicallyCorrectLights:s.physicallyCorrectLights,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Oi,flipSided:y.side===ln,useDepthPacking:!!y.depthPacking,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionDerivatives:y.extensions&&y.extensions.derivatives,extensionFragDepth:y.extensions&&y.extensions.fragDepth,extensionDrawBuffers:y.extensions&&y.extensions.drawBuffers,extensionShaderTextureLOD:y.extensions&&y.extensions.shaderTextureLOD,rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),customProgramCacheKey:y.customProgramCacheKey()}}function f(y){const C=[];if(y.shaderID?C.push(y.shaderID):(C.push(y.customVertexShaderID),C.push(y.customFragmentShaderID)),y.defines!==void 0)for(const N in y.defines)C.push(N),C.push(y.defines[N]);return y.isRawShaderMaterial===!1&&(v(C,y),w(C,y),C.push(s.outputEncoding)),C.push(y.customProgramCacheKey),C.join()}function v(y,C){y.push(C.precision),y.push(C.outputEncoding),y.push(C.envMapMode),y.push(C.envMapCubeUVHeight),y.push(C.combine),y.push(C.vertexUvs),y.push(C.fogExp2),y.push(C.sizeAttenuation),y.push(C.morphTargetsCount),y.push(C.morphAttributeCount),y.push(C.numDirLights),y.push(C.numPointLights),y.push(C.numSpotLights),y.push(C.numHemiLights),y.push(C.numRectAreaLights),y.push(C.numDirLightShadows),y.push(C.numPointLightShadows),y.push(C.numSpotLightShadows),y.push(C.shadowMapType),y.push(C.toneMapping),y.push(C.numClippingPlanes),y.push(C.numClipIntersection),y.push(C.depthPacking)}function w(y,C){a.disableAll(),C.isWebGL2&&a.enable(0),C.supportsVertexTextures&&a.enable(1),C.instancing&&a.enable(2),C.instancingColor&&a.enable(3),C.map&&a.enable(4),C.matcap&&a.enable(5),C.envMap&&a.enable(6),C.lightMap&&a.enable(7),C.aoMap&&a.enable(8),C.emissiveMap&&a.enable(9),C.bumpMap&&a.enable(10),C.normalMap&&a.enable(11),C.objectSpaceNormalMap&&a.enable(12),C.tangentSpaceNormalMap&&a.enable(13),C.clearcoat&&a.enable(14),C.clearcoatMap&&a.enable(15),C.clearcoatRoughnessMap&&a.enable(16),C.clearcoatNormalMap&&a.enable(17),C.displacementMap&&a.enable(18),C.specularMap&&a.enable(19),C.roughnessMap&&a.enable(20),C.metalnessMap&&a.enable(21),C.gradientMap&&a.enable(22),C.alphaMap&&a.enable(23),C.alphaTest&&a.enable(24),C.vertexColors&&a.enable(25),C.vertexAlphas&&a.enable(26),C.vertexUvs&&a.enable(27),C.vertexTangents&&a.enable(28),C.uvsVertexOnly&&a.enable(29),C.fog&&a.enable(30),y.push(a.mask),a.disableAll(),C.useFog&&a.enable(0),C.flatShading&&a.enable(1),C.logarithmicDepthBuffer&&a.enable(2),C.skinning&&a.enable(3),C.morphTargets&&a.enable(4),C.morphNormals&&a.enable(5),C.morphColors&&a.enable(6),C.premultipliedAlpha&&a.enable(7),C.shadowMapEnabled&&a.enable(8),C.physicallyCorrectLights&&a.enable(9),C.doubleSided&&a.enable(10),C.flipSided&&a.enable(11),C.useDepthPacking&&a.enable(12),C.dithering&&a.enable(13),C.specularIntensityMap&&a.enable(14),C.specularColorMap&&a.enable(15),C.transmission&&a.enable(16),C.transmissionMap&&a.enable(17),C.thicknessMap&&a.enable(18),C.sheen&&a.enable(19),C.sheenColorMap&&a.enable(20),C.sheenRoughnessMap&&a.enable(21),C.decodeVideoTexture&&a.enable(22),C.opaque&&a.enable(23),y.push(a.mask)}function E(y){const C=g[y.type];let N;if(C){const P=mn[C];N=bc.clone(P.uniforms)}else N=y.uniforms;return N}function b(y,C){let N;for(let P=0,ee=c.length;P<ee;P++){const ne=c[P];if(ne.cacheKey===C){N=ne,++N.usedTimes;break}}return N===void 0&&(N=new Qm(s,C,y,r),c.push(N)),N}function T(y){if(--y.usedTimes===0){const C=c.indexOf(y);c[C]=c[c.length-1],c.pop(),y.destroy()}}function L(y){l.remove(y)}function I(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:E,acquireProgram:b,releaseProgram:T,releaseShaderCache:L,programs:c,dispose:I}}function rg(){let s=new WeakMap;function e(r){let o=s.get(r);return o===void 0&&(o={},s.set(r,o)),o}function t(r){s.delete(r)}function n(r,o,a){s.get(r)[o]=a}function i(){s=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function sg(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Nl(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Fl(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(u,d,p,g,m,f){let v=s[e];return v===void 0?(v={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:m,group:f},s[e]=v):(v.id=u.id,v.object=u,v.geometry=d,v.material=p,v.groupOrder=g,v.renderOrder=u.renderOrder,v.z=m,v.group=f),e++,v}function a(u,d,p,g,m,f){const v=o(u,d,p,g,m,f);p.transmission>0?n.push(v):p.transparent===!0?i.push(v):t.push(v)}function l(u,d,p,g,m,f){const v=o(u,d,p,g,m,f);p.transmission>0?n.unshift(v):p.transparent===!0?i.unshift(v):t.unshift(v)}function c(u,d){t.length>1&&t.sort(u||sg),n.length>1&&n.sort(d||Nl),i.length>1&&i.sort(d||Nl)}function h(){for(let u=e,d=s.length;u<d;u++){const p=s[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function og(){let s=new WeakMap;function e(n,i){let r;return s.has(n)===!1?(r=new Fl,s.set(n,[r])):i>=s.get(n).length?(r=new Fl,s.get(n).push(r)):r=s.get(n)[i],r}function t(){s=new WeakMap}return{get:e,dispose:t}}function ag(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new S,color:new xe};break;case"SpotLight":t={position:new S,direction:new S,color:new xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new S,color:new xe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new S,skyColor:new xe,groundColor:new xe};break;case"RectAreaLight":t={color:new xe,position:new S,halfWidth:new S,halfHeight:new S};break}return s[e.id]=t,t}}}function lg(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let cg=0;function hg(s,e){return(e.castShadow?1:0)-(s.castShadow?1:0)}function ug(s,e){const t=new ag,n=lg(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotShadow:[],spotShadowMap:[],spotShadowMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[]};for(let h=0;h<9;h++)i.probe.push(new S);const r=new S,o=new Ce,a=new Ce;function l(h,u){let d=0,p=0,g=0;for(let C=0;C<9;C++)i.probe[C].set(0,0,0);let m=0,f=0,v=0,w=0,E=0,b=0,T=0,L=0;h.sort(hg);const I=u!==!0?Math.PI:1;for(let C=0,N=h.length;C<N;C++){const P=h[C],ee=P.color,ne=P.intensity,R=P.distance,G=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)d+=ee.r*ne*I,p+=ee.g*ne*I,g+=ee.b*ne*I;else if(P.isLightProbe)for(let z=0;z<9;z++)i.probe[z].addScaledVector(P.sh.coefficients[z],ne);else if(P.isDirectionalLight){const z=t.get(P);if(z.color.copy(P.color).multiplyScalar(P.intensity*I),P.castShadow){const k=P.shadow,X=n.get(P);X.shadowBias=k.bias,X.shadowNormalBias=k.normalBias,X.shadowRadius=k.radius,X.shadowMapSize=k.mapSize,i.directionalShadow[m]=X,i.directionalShadowMap[m]=G,i.directionalShadowMatrix[m]=P.shadow.matrix,b++}i.directional[m]=z,m++}else if(P.isSpotLight){const z=t.get(P);if(z.position.setFromMatrixPosition(P.matrixWorld),z.color.copy(ee).multiplyScalar(ne*I),z.distance=R,z.coneCos=Math.cos(P.angle),z.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),z.decay=P.decay,P.castShadow){const k=P.shadow,X=n.get(P);X.shadowBias=k.bias,X.shadowNormalBias=k.normalBias,X.shadowRadius=k.radius,X.shadowMapSize=k.mapSize,i.spotShadow[v]=X,i.spotShadowMap[v]=G,i.spotShadowMatrix[v]=P.shadow.matrix,L++}i.spot[v]=z,v++}else if(P.isRectAreaLight){const z=t.get(P);z.color.copy(ee).multiplyScalar(ne),z.halfWidth.set(P.width*.5,0,0),z.halfHeight.set(0,P.height*.5,0),i.rectArea[w]=z,w++}else if(P.isPointLight){const z=t.get(P);if(z.color.copy(P.color).multiplyScalar(P.intensity*I),z.distance=P.distance,z.decay=P.decay,P.castShadow){const k=P.shadow,X=n.get(P);X.shadowBias=k.bias,X.shadowNormalBias=k.normalBias,X.shadowRadius=k.radius,X.shadowMapSize=k.mapSize,X.shadowCameraNear=k.camera.near,X.shadowCameraFar=k.camera.far,i.pointShadow[f]=X,i.pointShadowMap[f]=G,i.pointShadowMatrix[f]=P.shadow.matrix,T++}i.point[f]=z,f++}else if(P.isHemisphereLight){const z=t.get(P);z.skyColor.copy(P.color).multiplyScalar(ne*I),z.groundColor.copy(P.groundColor).multiplyScalar(ne*I),i.hemi[E]=z,E++}}w>0&&(e.isWebGL2||s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=le.LTC_FLOAT_1,i.rectAreaLTC2=le.LTC_FLOAT_2):s.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=le.LTC_HALF_1,i.rectAreaLTC2=le.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=d,i.ambient[1]=p,i.ambient[2]=g;const y=i.hash;(y.directionalLength!==m||y.pointLength!==f||y.spotLength!==v||y.rectAreaLength!==w||y.hemiLength!==E||y.numDirectionalShadows!==b||y.numPointShadows!==T||y.numSpotShadows!==L)&&(i.directional.length=m,i.spot.length=v,i.rectArea.length=w,i.point.length=f,i.hemi.length=E,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=L,i.spotShadowMap.length=L,i.directionalShadowMatrix.length=b,i.pointShadowMatrix.length=T,i.spotShadowMatrix.length=L,y.directionalLength=m,y.pointLength=f,y.spotLength=v,y.rectAreaLength=w,y.hemiLength=E,y.numDirectionalShadows=b,y.numPointShadows=T,y.numSpotShadows=L,i.version=cg++)}function c(h,u){let d=0,p=0,g=0,m=0,f=0;const v=u.matrixWorldInverse;for(let w=0,E=h.length;w<E;w++){const b=h[w];if(b.isDirectionalLight){const T=i.directional[d];T.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(v),d++}else if(b.isSpotLight){const T=i.spot[g];T.position.setFromMatrixPosition(b.matrixWorld),T.position.applyMatrix4(v),T.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(v),g++}else if(b.isRectAreaLight){const T=i.rectArea[m];T.position.setFromMatrixPosition(b.matrixWorld),T.position.applyMatrix4(v),a.identity(),o.copy(b.matrixWorld),o.premultiply(v),a.extractRotation(o),T.halfWidth.set(b.width*.5,0,0),T.halfHeight.set(0,b.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),m++}else if(b.isPointLight){const T=i.point[p];T.position.setFromMatrixPosition(b.matrixWorld),T.position.applyMatrix4(v),p++}else if(b.isHemisphereLight){const T=i.hemi[f];T.direction.setFromMatrixPosition(b.matrixWorld),T.direction.transformDirection(v),f++}}}return{setup:l,setupView:c,state:i}}function zl(s,e){const t=new ug(s,e),n=[],i=[];function r(){n.length=0,i.length=0}function o(u){n.push(u)}function a(u){i.push(u)}function l(u){t.setup(n,u)}function c(u){t.setupView(n,u)}return{init:r,state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function dg(s,e){let t=new WeakMap;function n(r,o=0){let a;return t.has(r)===!1?(a=new zl(s,e),t.set(r,[a])):o>=t.get(r).length?(a=new zl(s,e),t.get(r).push(a)):a=t.get(r)[o],a}function i(){t=new WeakMap}return{get:n,dispose:i}}class ra extends xt{constructor(e){super(),this.type="MeshDepthMaterial",this.depthPacking=Ru,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}ra.prototype.isMeshDepthMaterial=!0;class sa extends xt{constructor(e){super(),this.type="MeshDistanceMaterial",this.referencePosition=new S,this.nearDistance=1,this.farDistance=1e3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.referencePosition.copy(e.referencePosition),this.nearDistance=e.nearDistance,this.farDistance=e.farDistance,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}sa.prototype.isMeshDistanceMaterial=!0;const fg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,pg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Rc(s,e,t){let n=new Fs;const i=new Q,r=new Q,o=new nt,a=new ra({depthPacking:Pu}),l=new sa,c={},h=t.maxTextureSize,u={0:ln,1:xr,2:Oi},d=new Wt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:fg,fragmentShader:pg}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new st;g.setAttribute("position",new vt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const m=new At(g,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=hc,this.render=function(b,T,L){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||b.length===0)return;const I=s.getRenderTarget(),y=s.getActiveCubeFace(),C=s.getActiveMipmapLevel(),N=s.state;N.setBlending(Gn),N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);for(let P=0,ee=b.length;P<ee;P++){const ne=b[P],R=ne.shadow;if(R===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(R.autoUpdate===!1&&R.needsUpdate===!1)continue;i.copy(R.mapSize);const G=R.getFrameExtents();if(i.multiply(G),r.copy(R.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/G.x),i.x=r.x*G.x,R.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/G.y),i.y=r.y*G.y,R.mapSize.y=r.y)),R.map===null&&!R.isPointLightShadow&&this.type===fr&&(R.map=new Yt(i.x,i.y),R.map.texture.name=ne.name+".shadowMap",R.mapPass=new Yt(i.x,i.y),R.camera.updateProjectionMatrix()),R.map===null){const k={minFilter:bt,magFilter:bt,format:an};R.map=new Yt(i.x,i.y,k),R.map.texture.name=ne.name+".shadowMap",R.camera.updateProjectionMatrix()}s.setRenderTarget(R.map),s.clear();const z=R.getViewportCount();for(let k=0;k<z;k++){const X=R.getViewport(k);o.set(r.x*X.x,r.y*X.y,r.x*X.z,r.y*X.w),N.viewport(o),R.updateMatrices(ne,k),n=R.getFrustum(),E(T,L,R.camera,ne,this.type)}!R.isPointLightShadow&&this.type===fr&&v(R,L),R.needsUpdate=!1}f.needsUpdate=!1,s.setRenderTarget(I,y,C)};function v(b,T){const L=e.update(m);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,p.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),d.uniforms.shadow_pass.value=b.map.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,s.setRenderTarget(b.mapPass),s.clear(),s.renderBufferDirect(T,null,L,d,m,null),p.uniforms.shadow_pass.value=b.mapPass.texture,p.uniforms.resolution.value=b.mapSize,p.uniforms.radius.value=b.radius,s.setRenderTarget(b.map),s.clear(),s.renderBufferDirect(T,null,L,p,m,null)}function w(b,T,L,I,y,C){let N=null;const P=L.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(P!==void 0?N=P:N=L.isPointLight===!0?l:a,s.localClippingEnabled&&T.clipShadows===!0&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0){const ee=N.uuid,ne=T.uuid;let R=c[ee];R===void 0&&(R={},c[ee]=R);let G=R[ne];G===void 0&&(G=N.clone(),R[ne]=G),N=G}return N.visible=T.visible,N.wireframe=T.wireframe,C===fr?N.side=T.shadowSide!==null?T.shadowSide:T.side:N.side=T.shadowSide!==null?T.shadowSide:u[T.side],N.alphaMap=T.alphaMap,N.alphaTest=T.alphaTest,N.clipShadows=T.clipShadows,N.clippingPlanes=T.clippingPlanes,N.clipIntersection=T.clipIntersection,N.displacementMap=T.displacementMap,N.displacementScale=T.displacementScale,N.displacementBias=T.displacementBias,N.wireframeLinewidth=T.wireframeLinewidth,N.linewidth=T.linewidth,L.isPointLight===!0&&N.isMeshDistanceMaterial===!0&&(N.referencePosition.setFromMatrixPosition(L.matrixWorld),N.nearDistance=I,N.farDistance=y),N}function E(b,T,L,I,y){if(b.visible===!1)return;if(b.layers.test(T.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&y===fr)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,b.matrixWorld);const P=e.update(b),ee=b.material;if(Array.isArray(ee)){const ne=P.groups;for(let R=0,G=ne.length;R<G;R++){const z=ne[R],k=ee[z.materialIndex];if(k&&k.visible){const X=w(b,k,I,L.near,L.far,y);s.renderBufferDirect(L,null,P,X,b,z)}}}else if(ee.visible){const ne=w(b,ee,I,L.near,L.far,y);s.renderBufferDirect(L,null,P,ne,b,null)}}const N=b.children;for(let P=0,ee=N.length;P<ee;P++)E(N[P],T,L,I,y)}}function mg(s,e,t){const n=t.isWebGL2;function i(){let A=!1;const ae=new nt;let oe=null;const Ee=new nt(0,0,0,0);return{setMask:function(pe){oe!==pe&&!A&&(s.colorMask(pe,pe,pe,pe),oe=pe)},setLocked:function(pe){A=pe},setClear:function(pe,Te,$,Me,Je){Je===!0&&(pe*=Me,Te*=Me,$*=Me),ae.set(pe,Te,$,Me),Ee.equals(ae)===!1&&(s.clearColor(pe,Te,$,Me),Ee.copy(ae))},reset:function(){A=!1,oe=null,Ee.set(-1,0,0,0)}}}function r(){let A=!1,ae=null,oe=null,Ee=null;return{setTest:function(pe){pe?ge(2929):W(2929)},setMask:function(pe){ae!==pe&&!A&&(s.depthMask(pe),ae=pe)},setFunc:function(pe){if(oe!==pe){if(pe)switch(pe){case Zh:s.depthFunc(512);break;case $h:s.depthFunc(519);break;case Kh:s.depthFunc(513);break;case zo:s.depthFunc(515);break;case Qh:s.depthFunc(514);break;case eu:s.depthFunc(518);break;case tu:s.depthFunc(516);break;case nu:s.depthFunc(517);break;default:s.depthFunc(515)}else s.depthFunc(515);oe=pe}},setLocked:function(pe){A=pe},setClear:function(pe){Ee!==pe&&(s.clearDepth(pe),Ee=pe)},reset:function(){A=!1,ae=null,oe=null,Ee=null}}}function o(){let A=!1,ae=null,oe=null,Ee=null,pe=null,Te=null,$=null,Me=null,Je=null;return{setTest:function(Ue){A||(Ue?ge(2960):W(2960))},setMask:function(Ue){ae!==Ue&&!A&&(s.stencilMask(Ue),ae=Ue)},setFunc:function(Ue,Ct,Pt){(oe!==Ue||Ee!==Ct||pe!==Pt)&&(s.stencilFunc(Ue,Ct,Pt),oe=Ue,Ee=Ct,pe=Pt)},setOp:function(Ue,Ct,Pt){(Te!==Ue||$!==Ct||Me!==Pt)&&(s.stencilOp(Ue,Ct,Pt),Te=Ue,$=Ct,Me=Pt)},setLocked:function(Ue){A=Ue},setClear:function(Ue){Je!==Ue&&(s.clearStencil(Ue),Je=Ue)},reset:function(){A=!1,ae=null,oe=null,Ee=null,pe=null,Te=null,$=null,Me=null,Je=null}}}const a=new i,l=new r,c=new o;let h={},u={},d=new WeakMap,p=[],g=null,m=!1,f=null,v=null,w=null,E=null,b=null,T=null,L=null,I=!1,y=null,C=null,N=null,P=null,ee=null;const ne=s.getParameter(35661);let R=!1,G=0;const z=s.getParameter(7938);z.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(z)[1]),R=G>=1):z.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),R=G>=2);let k=null,X={};const B=s.getParameter(3088),H=s.getParameter(2978),K=new nt().fromArray(B),Y=new nt().fromArray(H);function se(A,ae,oe){const Ee=new Uint8Array(4),pe=s.createTexture();s.bindTexture(A,pe),s.texParameteri(A,10241,9728),s.texParameteri(A,10240,9728);for(let Te=0;Te<oe;Te++)s.texImage2D(ae+Te,0,6408,1,1,0,6408,5121,Ee);return pe}const de={};de[3553]=se(3553,3553,1),de[34067]=se(34067,34069,6),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),ge(2929),l.setFunc(zo),re(!1),me(Aa),ge(2884),J(Gn);function ge(A){h[A]!==!0&&(s.enable(A),h[A]=!0)}function W(A){h[A]!==!1&&(s.disable(A),h[A]=!1)}function Ge(A,ae){return u[A]!==ae?(s.bindFramebuffer(A,ae),u[A]=ae,n&&(A===36009&&(u[36160]=ae),A===36160&&(u[36009]=ae)),!0):!1}function we(A,ae){let oe=p,Ee=!1;if(A)if(oe=d.get(ae),oe===void 0&&(oe=[],d.set(ae,oe)),A.isWebGLMultipleRenderTargets){const pe=A.texture;if(oe.length!==pe.length||oe[0]!==36064){for(let Te=0,$=pe.length;Te<$;Te++)oe[Te]=36064+Te;oe.length=pe.length,Ee=!0}}else oe[0]!==36064&&(oe[0]=36064,Ee=!0);else oe[0]!==1029&&(oe[0]=1029,Ee=!0);Ee&&(t.isWebGL2?s.drawBuffers(oe):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(oe))}function Fe(A){return g!==A?(s.useProgram(A),g=A,!0):!1}const ie={[Di]:32774,[Oh]:32778,[Hh]:32779};if(n)ie[Pa]=32775,ie[Da]=32776;else{const A=e.get("EXT_blend_minmax");A!==null&&(ie[Pa]=A.MIN_EXT,ie[Da]=A.MAX_EXT)}const ze={[Vh]:0,[Gh]:1,[kh]:768,[dc]:770,[Yh]:776,[jh]:774,[qh]:772,[Wh]:769,[fc]:771,[Jh]:775,[Xh]:773};function J(A,ae,oe,Ee,pe,Te,$,Me){if(A===Gn){m===!0&&(W(3042),m=!1);return}if(m===!1&&(ge(3042),m=!0),A!==Uh){if(A!==f||Me!==I){if((v!==Di||b!==Di)&&(s.blendEquation(32774),v=Di,b=Di),Me)switch(A){case Bi:s.blendFuncSeparate(1,771,1,771);break;case Ca:s.blendFunc(1,1);break;case La:s.blendFuncSeparate(0,769,0,1);break;case Ra:s.blendFuncSeparate(0,768,0,770);break;default:console.error("THREE.WebGLState: Invalid blending: ",A);break}else switch(A){case Bi:s.blendFuncSeparate(770,771,1,771);break;case Ca:s.blendFunc(770,1);break;case La:s.blendFuncSeparate(0,769,0,1);break;case Ra:s.blendFunc(0,768);break;default:console.error("THREE.WebGLState: Invalid blending: ",A);break}w=null,E=null,T=null,L=null,f=A,I=Me}return}pe=pe||ae,Te=Te||oe,$=$||Ee,(ae!==v||pe!==b)&&(s.blendEquationSeparate(ie[ae],ie[pe]),v=ae,b=pe),(oe!==w||Ee!==E||Te!==T||$!==L)&&(s.blendFuncSeparate(ze[oe],ze[Ee],ze[Te],ze[$]),w=oe,E=Ee,T=Te,L=$),f=A,I=null}function j(A,ae){A.side===Oi?W(2884):ge(2884);let oe=A.side===ln;ae&&(oe=!oe),re(oe),A.blending===Bi&&A.transparent===!1?J(Gn):J(A.blending,A.blendEquation,A.blendSrc,A.blendDst,A.blendEquationAlpha,A.blendSrcAlpha,A.blendDstAlpha,A.premultipliedAlpha),l.setFunc(A.depthFunc),l.setTest(A.depthTest),l.setMask(A.depthWrite),a.setMask(A.colorWrite);const Ee=A.stencilWrite;c.setTest(Ee),Ee&&(c.setMask(A.stencilWriteMask),c.setFunc(A.stencilFunc,A.stencilRef,A.stencilFuncMask),c.setOp(A.stencilFail,A.stencilZFail,A.stencilZPass)),Se(A.polygonOffset,A.polygonOffsetFactor,A.polygonOffsetUnits),A.alphaToCoverage===!0?ge(32926):W(32926)}function re(A){y!==A&&(A?s.frontFace(2304):s.frontFace(2305),y=A)}function me(A){A!==Fh?(ge(2884),A!==C&&(A===Aa?s.cullFace(1029):A===zh?s.cullFace(1028):s.cullFace(1032))):W(2884),C=A}function ce(A){A!==N&&(R&&s.lineWidth(A),N=A)}function Se(A,ae,oe){A?(ge(32823),(P!==ae||ee!==oe)&&(s.polygonOffset(ae,oe),P=ae,ee=oe)):W(32823)}function ve(A){A?ge(3089):W(3089)}function be(A){A===void 0&&(A=33984+ne-1),k!==A&&(s.activeTexture(A),k=A)}function Ze(A,ae){k===null&&be();let oe=X[k];oe===void 0&&(oe={type:void 0,texture:void 0},X[k]=oe),(oe.type!==A||oe.texture!==ae)&&(s.bindTexture(A,ae||de[A]),oe.type=A,oe.texture=ae)}function Xe(){const A=X[k];A!==void 0&&A.type!==void 0&&(s.bindTexture(A.type,null),A.type=void 0,A.texture=void 0)}function M(){try{s.compressedTexImage2D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function x(){try{s.texSubImage2D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function U(){try{s.texSubImage3D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function Z(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function he(){try{s.texStorage2D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function ue(){try{s.texStorage3D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function _e(){try{s.texImage2D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function V(){try{s.texImage3D.apply(s,arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function De(A){K.equals(A)===!1&&(s.scissor(A.x,A.y,A.z,A.w),K.copy(A))}function Le(A){Y.equals(A)===!1&&(s.viewport(A.x,A.y,A.z,A.w),Y.copy(A))}function fe(){s.disable(3042),s.disable(2884),s.disable(2929),s.disable(32823),s.disable(3089),s.disable(2960),s.disable(32926),s.blendEquation(32774),s.blendFunc(1,0),s.blendFuncSeparate(1,0,1,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(513),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(519,0,4294967295),s.stencilOp(7680,7680,7680),s.clearStencil(0),s.cullFace(1029),s.frontFace(2305),s.polygonOffset(0,0),s.activeTexture(33984),s.bindFramebuffer(36160,null),n===!0&&(s.bindFramebuffer(36009,null),s.bindFramebuffer(36008,null)),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},k=null,X={},u={},d=new WeakMap,p=[],g=null,m=!1,f=null,v=null,w=null,E=null,b=null,T=null,L=null,I=!1,y=null,C=null,N=null,P=null,ee=null,K.set(0,0,s.canvas.width,s.canvas.height),Y.set(0,0,s.canvas.width,s.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:ge,disable:W,bindFramebuffer:Ge,drawBuffers:we,useProgram:Fe,setBlending:J,setMaterial:j,setFlipSided:re,setCullFace:me,setLineWidth:ce,setPolygonOffset:Se,setScissorTest:ve,activeTexture:be,bindTexture:Ze,unbindTexture:Xe,compressedTexImage2D:M,texImage2D:_e,texImage3D:V,texStorage2D:he,texStorage3D:ue,texSubImage2D:x,texSubImage3D:U,compressedTexSubImage2D:Z,scissor:De,viewport:Le,reset:fe}}function gg(s,e,t,n,i,r,o){const a=i.isWebGL2,l=i.maxTextures,c=i.maxCubemapSize,h=i.maxTextureSize,u=i.maxSamples,d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=/OculusBrowser/g.test(navigator.userAgent),g=new WeakMap;let m;const f=new WeakMap;let v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function w(M,x){return v?new OffscreenCanvas(M,x):Mr("canvas")}function E(M,x,U,Z){let he=1;if((M.width>Z||M.height>Z)&&(he=Z/Math.max(M.width,M.height)),he<1||x===!0)if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&M instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&M instanceof ImageBitmap){const ue=x?ko:Math.floor,_e=ue(he*M.width),V=ue(he*M.height);m===void 0&&(m=w(_e,V));const De=U?w(_e,V):m;return De.width=_e,De.height=V,De.getContext("2d").drawImage(M,0,0,_e,V),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+M.width+"x"+M.height+") to ("+_e+"x"+V+")."),De}else return"data"in M&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+M.width+"x"+M.height+")."),M;return M}function b(M){return il(M.width)&&il(M.height)}function T(M){return a?!1:M.wrapS!==on||M.wrapT!==on||M.minFilter!==bt&&M.minFilter!==Gt}function L(M,x){return M.generateMipmaps&&x&&M.minFilter!==bt&&M.minFilter!==Gt}function I(M){s.generateMipmap(M)}function y(M,x,U,Z,he=!1){if(a===!1)return x;if(M!==null){if(s[M]!==void 0)return s[M];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+M+"'")}let ue=x;return x===6403&&(U===5126&&(ue=33326),U===5131&&(ue=33325),U===5121&&(ue=33321)),x===33319&&(U===5126&&(ue=33328),U===5131&&(ue=33327),U===5121&&(ue=33323)),x===6408&&(U===5126&&(ue=34836),U===5131&&(ue=34842),U===5121&&(ue=Z===ot&&he===!1?35907:32856),U===32819&&(ue=32854),U===32820&&(ue=32855)),(ue===33325||ue===33326||ue===33327||ue===33328||ue===34842||ue===34836)&&e.get("EXT_color_buffer_float"),ue}function C(M,x,U){return L(M,U)===!0||M.isFramebufferTexture&&M.minFilter!==bt&&M.minFilter!==Gt?Math.log2(Math.max(x.width,x.height))+1:M.mipmaps!==void 0&&M.mipmaps.length>0?M.mipmaps.length:M.isCompressedTexture&&Array.isArray(M.image)?x.mipmaps.length:1}function N(M){return M===bt||M===Ia||M===Na?9728:9729}function P(M){const x=M.target;x.removeEventListener("dispose",P),ne(x),x.isVideoTexture&&g.delete(x)}function ee(M){const x=M.target;x.removeEventListener("dispose",ee),G(x)}function ne(M){const x=n.get(M);if(x.__webglInit===void 0)return;const U=M.source,Z=f.get(U);if(Z){const he=Z[x.__cacheKey];he.usedTimes--,he.usedTimes===0&&R(M),Object.keys(Z).length===0&&f.delete(U)}n.remove(M)}function R(M){const x=n.get(M);s.deleteTexture(x.__webglTexture);const U=M.source,Z=f.get(U);delete Z[x.__cacheKey],o.memory.textures--}function G(M){const x=M.texture,U=n.get(M),Z=n.get(x);if(Z.__webglTexture!==void 0&&(s.deleteTexture(Z.__webglTexture),o.memory.textures--),M.depthTexture&&M.depthTexture.dispose(),M.isWebGLCubeRenderTarget)for(let he=0;he<6;he++)s.deleteFramebuffer(U.__webglFramebuffer[he]),U.__webglDepthbuffer&&s.deleteRenderbuffer(U.__webglDepthbuffer[he]);else s.deleteFramebuffer(U.__webglFramebuffer),U.__webglDepthbuffer&&s.deleteRenderbuffer(U.__webglDepthbuffer),U.__webglMultisampledFramebuffer&&s.deleteFramebuffer(U.__webglMultisampledFramebuffer),U.__webglColorRenderbuffer&&s.deleteRenderbuffer(U.__webglColorRenderbuffer),U.__webglDepthRenderbuffer&&s.deleteRenderbuffer(U.__webglDepthRenderbuffer);if(M.isWebGLMultipleRenderTargets)for(let he=0,ue=x.length;he<ue;he++){const _e=n.get(x[he]);_e.__webglTexture&&(s.deleteTexture(_e.__webglTexture),o.memory.textures--),n.remove(x[he])}n.remove(x),n.remove(M)}let z=0;function k(){z=0}function X(){const M=z;return M>=l&&console.warn("THREE.WebGLTextures: Trying to use "+M+" texture units while this GPU supports only "+l),z+=1,M}function B(M){const x=[];return x.push(M.wrapS),x.push(M.wrapT),x.push(M.magFilter),x.push(M.minFilter),x.push(M.anisotropy),x.push(M.internalFormat),x.push(M.format),x.push(M.type),x.push(M.generateMipmaps),x.push(M.premultiplyAlpha),x.push(M.flipY),x.push(M.unpackAlignment),x.push(M.encoding),x.join()}function H(M,x){const U=n.get(M);if(M.isVideoTexture&&Ze(M),M.isRenderTargetTexture===!1&&M.version>0&&U.__version!==M.version){const Z=M.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{we(U,M,x);return}}t.activeTexture(33984+x),t.bindTexture(3553,U.__webglTexture)}function K(M,x){const U=n.get(M);if(M.version>0&&U.__version!==M.version){we(U,M,x);return}t.activeTexture(33984+x),t.bindTexture(35866,U.__webglTexture)}function Y(M,x){const U=n.get(M);if(M.version>0&&U.__version!==M.version){we(U,M,x);return}t.activeTexture(33984+x),t.bindTexture(32879,U.__webglTexture)}function se(M,x){const U=n.get(M);if(M.version>0&&U.__version!==M.version){Fe(U,M,x);return}t.activeTexture(33984+x),t.bindTexture(34067,U.__webglTexture)}const de={[Oo]:10497,[on]:33071,[Ho]:33648},ge={[bt]:9728,[Ia]:9984,[Na]:9986,[Gt]:9729,[hu]:9985,[Ps]:9987};function W(M,x,U){if(U?(s.texParameteri(M,10242,de[x.wrapS]),s.texParameteri(M,10243,de[x.wrapT]),(M===32879||M===35866)&&s.texParameteri(M,32882,de[x.wrapR]),s.texParameteri(M,10240,ge[x.magFilter]),s.texParameteri(M,10241,ge[x.minFilter])):(s.texParameteri(M,10242,33071),s.texParameteri(M,10243,33071),(M===32879||M===35866)&&s.texParameteri(M,32882,33071),(x.wrapS!==on||x.wrapT!==on)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),s.texParameteri(M,10240,N(x.magFilter)),s.texParameteri(M,10241,N(x.minFilter)),x.minFilter!==bt&&x.minFilter!==Gt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),e.has("EXT_texture_filter_anisotropic")===!0){const Z=e.get("EXT_texture_filter_anisotropic");if(x.type===ri&&e.has("OES_texture_float_linear")===!1||a===!1&&x.type===yr&&e.has("OES_texture_half_float_linear")===!1)return;(x.anisotropy>1||n.get(x).__currentAnisotropy)&&(s.texParameterf(M,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,i.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy)}}function Ge(M,x){let U=!1;M.__webglInit===void 0&&(M.__webglInit=!0,x.addEventListener("dispose",P));const Z=x.source;let he=f.get(Z);he===void 0&&(he={},f.set(Z,he));const ue=B(x);if(ue!==M.__cacheKey){he[ue]===void 0&&(he[ue]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,U=!0),he[ue].usedTimes++;const _e=he[M.__cacheKey];_e!==void 0&&(he[M.__cacheKey].usedTimes--,_e.usedTimes===0&&R(x)),M.__cacheKey=ue,M.__webglTexture=he[ue].texture}return U}function we(M,x,U){let Z=3553;x.isDataArrayTexture&&(Z=35866),x.isData3DTexture&&(Z=32879);const he=Ge(M,x),ue=x.source;if(t.activeTexture(33984+U),t.bindTexture(Z,M.__webglTexture),ue.version!==ue.__currentVersion||he===!0){s.pixelStorei(37440,x.flipY),s.pixelStorei(37441,x.premultiplyAlpha),s.pixelStorei(3317,x.unpackAlignment),s.pixelStorei(37443,0);const _e=T(x)&&b(x.image)===!1;let V=E(x.image,_e,!1,h);V=Xe(x,V);const De=b(V)||a,Le=r.convert(x.format,x.encoding);let fe=r.convert(x.type),A=y(x.internalFormat,Le,fe,x.encoding,x.isVideoTexture);W(Z,x,De);let ae;const oe=x.mipmaps,Ee=a&&x.isVideoTexture!==!0,pe=M.__version===void 0||he===!0,Te=C(x,V,De);if(x.isDepthTexture)A=6402,a?x.type===ri?A=36012:x.type===_s?A=33190:x.type===Ui?A=35056:A=33189:x.type===ri&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),x.format===oi&&A===6402&&x.type!==_r&&x.type!==_s&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),x.type=_r,fe=r.convert(x.type)),x.format===Gi&&A===6402&&(A=34041,x.type!==Ui&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),x.type=Ui,fe=r.convert(x.type))),pe&&(Ee?t.texStorage2D(3553,1,A,V.width,V.height):t.texImage2D(3553,0,A,V.width,V.height,0,Le,fe,null));else if(x.isDataTexture)if(oe.length>0&&De){Ee&&pe&&t.texStorage2D(3553,Te,A,oe[0].width,oe[0].height);for(let $=0,Me=oe.length;$<Me;$++)ae=oe[$],Ee?t.texSubImage2D(3553,$,0,0,ae.width,ae.height,Le,fe,ae.data):t.texImage2D(3553,$,A,ae.width,ae.height,0,Le,fe,ae.data);x.generateMipmaps=!1}else Ee?(pe&&t.texStorage2D(3553,Te,A,V.width,V.height),t.texSubImage2D(3553,0,0,0,V.width,V.height,Le,fe,V.data)):t.texImage2D(3553,0,A,V.width,V.height,0,Le,fe,V.data);else if(x.isCompressedTexture){Ee&&pe&&t.texStorage2D(3553,Te,A,oe[0].width,oe[0].height);for(let $=0,Me=oe.length;$<Me;$++)ae=oe[$],x.format!==an?Le!==null?Ee?t.compressedTexSubImage2D(3553,$,0,0,ae.width,ae.height,Le,ae.data):t.compressedTexImage2D(3553,$,A,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ee?t.texSubImage2D(3553,$,0,0,ae.width,ae.height,Le,fe,ae.data):t.texImage2D(3553,$,A,ae.width,ae.height,0,Le,fe,ae.data)}else if(x.isDataArrayTexture)Ee?(pe&&t.texStorage3D(35866,Te,A,V.width,V.height,V.depth),t.texSubImage3D(35866,0,0,0,0,V.width,V.height,V.depth,Le,fe,V.data)):t.texImage3D(35866,0,A,V.width,V.height,V.depth,0,Le,fe,V.data);else if(x.isData3DTexture)Ee?(pe&&t.texStorage3D(32879,Te,A,V.width,V.height,V.depth),t.texSubImage3D(32879,0,0,0,0,V.width,V.height,V.depth,Le,fe,V.data)):t.texImage3D(32879,0,A,V.width,V.height,V.depth,0,Le,fe,V.data);else if(x.isFramebufferTexture){if(pe)if(Ee)t.texStorage2D(3553,Te,A,V.width,V.height);else{let $=V.width,Me=V.height;for(let Je=0;Je<Te;Je++)t.texImage2D(3553,Je,A,$,Me,0,Le,fe,null),$>>=1,Me>>=1}}else if(oe.length>0&&De){Ee&&pe&&t.texStorage2D(3553,Te,A,oe[0].width,oe[0].height);for(let $=0,Me=oe.length;$<Me;$++)ae=oe[$],Ee?t.texSubImage2D(3553,$,0,0,Le,fe,ae):t.texImage2D(3553,$,A,Le,fe,ae);x.generateMipmaps=!1}else Ee?(pe&&t.texStorage2D(3553,Te,A,V.width,V.height),t.texSubImage2D(3553,0,0,0,Le,fe,V)):t.texImage2D(3553,0,A,Le,fe,V);L(x,De)&&I(Z),ue.__currentVersion=ue.version,x.onUpdate&&x.onUpdate(x)}M.__version=x.version}function Fe(M,x,U){if(x.image.length!==6)return;const Z=Ge(M,x),he=x.source;if(t.activeTexture(33984+U),t.bindTexture(34067,M.__webglTexture),he.version!==he.__currentVersion||Z===!0){s.pixelStorei(37440,x.flipY),s.pixelStorei(37441,x.premultiplyAlpha),s.pixelStorei(3317,x.unpackAlignment),s.pixelStorei(37443,0);const ue=x.isCompressedTexture||x.image[0].isCompressedTexture,_e=x.image[0]&&x.image[0].isDataTexture,V=[];for(let $=0;$<6;$++)!ue&&!_e?V[$]=E(x.image[$],!1,!0,c):V[$]=_e?x.image[$].image:x.image[$],V[$]=Xe(x,V[$]);const De=V[0],Le=b(De)||a,fe=r.convert(x.format,x.encoding),A=r.convert(x.type),ae=y(x.internalFormat,fe,A,x.encoding),oe=a&&x.isVideoTexture!==!0,Ee=M.__version===void 0;let pe=C(x,De,Le);W(34067,x,Le);let Te;if(ue){oe&&Ee&&t.texStorage2D(34067,pe,ae,De.width,De.height);for(let $=0;$<6;$++){Te=V[$].mipmaps;for(let Me=0;Me<Te.length;Me++){const Je=Te[Me];x.format!==an?fe!==null?oe?t.compressedTexSubImage2D(34069+$,Me,0,0,Je.width,Je.height,fe,Je.data):t.compressedTexImage2D(34069+$,Me,ae,Je.width,Je.height,0,Je.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):oe?t.texSubImage2D(34069+$,Me,0,0,Je.width,Je.height,fe,A,Je.data):t.texImage2D(34069+$,Me,ae,Je.width,Je.height,0,fe,A,Je.data)}}}else{Te=x.mipmaps,oe&&Ee&&(Te.length>0&&pe++,t.texStorage2D(34067,pe,ae,V[0].width,V[0].height));for(let $=0;$<6;$++)if(_e){oe?t.texSubImage2D(34069+$,0,0,0,V[$].width,V[$].height,fe,A,V[$].data):t.texImage2D(34069+$,0,ae,V[$].width,V[$].height,0,fe,A,V[$].data);for(let Me=0;Me<Te.length;Me++){const Ue=Te[Me].image[$].image;oe?t.texSubImage2D(34069+$,Me+1,0,0,Ue.width,Ue.height,fe,A,Ue.data):t.texImage2D(34069+$,Me+1,ae,Ue.width,Ue.height,0,fe,A,Ue.data)}}else{oe?t.texSubImage2D(34069+$,0,0,0,fe,A,V[$]):t.texImage2D(34069+$,0,ae,fe,A,V[$]);for(let Me=0;Me<Te.length;Me++){const Je=Te[Me];oe?t.texSubImage2D(34069+$,Me+1,0,0,fe,A,Je.image[$]):t.texImage2D(34069+$,Me+1,ae,fe,A,Je.image[$])}}}L(x,Le)&&I(34067),he.__currentVersion=he.version,x.onUpdate&&x.onUpdate(x)}M.__version=x.version}function ie(M,x,U,Z,he){const ue=r.convert(U.format,U.encoding),_e=r.convert(U.type),V=y(U.internalFormat,ue,_e,U.encoding);n.get(x).__hasExternalTextures||(he===32879||he===35866?t.texImage3D(he,0,V,x.width,x.height,x.depth,0,ue,_e,null):t.texImage2D(he,0,V,x.width,x.height,0,ue,_e,null)),t.bindFramebuffer(36160,M),be(x)?d.framebufferTexture2DMultisampleEXT(36160,Z,he,n.get(U).__webglTexture,0,ve(x)):s.framebufferTexture2D(36160,Z,he,n.get(U).__webglTexture,0),t.bindFramebuffer(36160,null)}function ze(M,x,U){if(s.bindRenderbuffer(36161,M),x.depthBuffer&&!x.stencilBuffer){let Z=33189;if(U||be(x)){const he=x.depthTexture;he&&he.isDepthTexture&&(he.type===ri?Z=36012:he.type===_s&&(Z=33190));const ue=ve(x);be(x)?d.renderbufferStorageMultisampleEXT(36161,ue,Z,x.width,x.height):s.renderbufferStorageMultisample(36161,ue,Z,x.width,x.height)}else s.renderbufferStorage(36161,Z,x.width,x.height);s.framebufferRenderbuffer(36160,36096,36161,M)}else if(x.depthBuffer&&x.stencilBuffer){const Z=ve(x);U&&be(x)===!1?s.renderbufferStorageMultisample(36161,Z,35056,x.width,x.height):be(x)?d.renderbufferStorageMultisampleEXT(36161,Z,35056,x.width,x.height):s.renderbufferStorage(36161,34041,x.width,x.height),s.framebufferRenderbuffer(36160,33306,36161,M)}else{const Z=x.isWebGLMultipleRenderTargets===!0?x.texture[0]:x.texture,he=r.convert(Z.format,Z.encoding),ue=r.convert(Z.type),_e=y(Z.internalFormat,he,ue,Z.encoding),V=ve(x);U&&be(x)===!1?s.renderbufferStorageMultisample(36161,V,_e,x.width,x.height):be(x)?d.renderbufferStorageMultisampleEXT(36161,V,_e,x.width,x.height):s.renderbufferStorage(36161,_e,x.width,x.height)}s.bindRenderbuffer(36161,null)}function J(M,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(36160,M),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(x.depthTexture).__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),H(x.depthTexture,0);const Z=n.get(x.depthTexture).__webglTexture,he=ve(x);if(x.depthTexture.format===oi)be(x)?d.framebufferTexture2DMultisampleEXT(36160,36096,3553,Z,0,he):s.framebufferTexture2D(36160,36096,3553,Z,0);else if(x.depthTexture.format===Gi)be(x)?d.framebufferTexture2DMultisampleEXT(36160,33306,3553,Z,0,he):s.framebufferTexture2D(36160,33306,3553,Z,0);else throw new Error("Unknown depthTexture format")}function j(M){const x=n.get(M),U=M.isWebGLCubeRenderTarget===!0;if(M.depthTexture&&!x.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");J(x.__webglFramebuffer,M)}else if(U){x.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)t.bindFramebuffer(36160,x.__webglFramebuffer[Z]),x.__webglDepthbuffer[Z]=s.createRenderbuffer(),ze(x.__webglDepthbuffer[Z],M,!1)}else t.bindFramebuffer(36160,x.__webglFramebuffer),x.__webglDepthbuffer=s.createRenderbuffer(),ze(x.__webglDepthbuffer,M,!1);t.bindFramebuffer(36160,null)}function re(M,x,U){const Z=n.get(M);x!==void 0&&ie(Z.__webglFramebuffer,M,M.texture,36064,3553),U!==void 0&&j(M)}function me(M){const x=M.texture,U=n.get(M),Z=n.get(x);M.addEventListener("dispose",ee),M.isWebGLMultipleRenderTargets!==!0&&(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=x.version,o.memory.textures++);const he=M.isWebGLCubeRenderTarget===!0,ue=M.isWebGLMultipleRenderTargets===!0,_e=b(M)||a;if(he){U.__webglFramebuffer=[];for(let V=0;V<6;V++)U.__webglFramebuffer[V]=s.createFramebuffer()}else if(U.__webglFramebuffer=s.createFramebuffer(),ue)if(i.drawBuffers){const V=M.texture;for(let De=0,Le=V.length;De<Le;De++){const fe=n.get(V[De]);fe.__webglTexture===void 0&&(fe.__webglTexture=s.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");else if(a&&M.samples>0&&be(M)===!1){U.__webglMultisampledFramebuffer=s.createFramebuffer(),U.__webglColorRenderbuffer=s.createRenderbuffer(),s.bindRenderbuffer(36161,U.__webglColorRenderbuffer);const V=r.convert(x.format,x.encoding),De=r.convert(x.type),Le=y(x.internalFormat,V,De,x.encoding),fe=ve(M);s.renderbufferStorageMultisample(36161,fe,Le,M.width,M.height),t.bindFramebuffer(36160,U.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(36160,36064,36161,U.__webglColorRenderbuffer),s.bindRenderbuffer(36161,null),M.depthBuffer&&(U.__webglDepthRenderbuffer=s.createRenderbuffer(),ze(U.__webglDepthRenderbuffer,M,!0)),t.bindFramebuffer(36160,null)}if(he){t.bindTexture(34067,Z.__webglTexture),W(34067,x,_e);for(let V=0;V<6;V++)ie(U.__webglFramebuffer[V],M,x,36064,34069+V);L(x,_e)&&I(34067),t.unbindTexture()}else if(ue){const V=M.texture;for(let De=0,Le=V.length;De<Le;De++){const fe=V[De],A=n.get(fe);t.bindTexture(3553,A.__webglTexture),W(3553,fe,_e),ie(U.__webglFramebuffer,M,fe,36064+De,3553),L(fe,_e)&&I(3553)}t.unbindTexture()}else{let V=3553;(M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)&&(a?V=M.isWebGL3DRenderTarget?32879:35866:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(V,Z.__webglTexture),W(V,x,_e),ie(U.__webglFramebuffer,M,x,36064,V),L(x,_e)&&I(V),t.unbindTexture()}M.depthBuffer&&j(M)}function ce(M){const x=b(M)||a,U=M.isWebGLMultipleRenderTargets===!0?M.texture:[M.texture];for(let Z=0,he=U.length;Z<he;Z++){const ue=U[Z];if(L(ue,x)){const _e=M.isWebGLCubeRenderTarget?34067:3553,V=n.get(ue).__webglTexture;t.bindTexture(_e,V),I(_e),t.unbindTexture()}}}function Se(M){if(a&&M.samples>0&&be(M)===!1){const x=M.width,U=M.height;let Z=16384;const he=[36064],ue=M.stencilBuffer?33306:36096;M.depthBuffer&&he.push(ue);const _e=n.get(M),V=_e.__ignoreDepthValues!==void 0?_e.__ignoreDepthValues:!1;V===!1&&(M.depthBuffer&&(Z|=256),M.stencilBuffer&&(Z|=1024)),t.bindFramebuffer(36008,_e.__webglMultisampledFramebuffer),t.bindFramebuffer(36009,_e.__webglFramebuffer),V===!0&&(s.invalidateFramebuffer(36008,[ue]),s.invalidateFramebuffer(36009,[ue])),s.blitFramebuffer(0,0,x,U,0,0,x,U,Z,9728),p&&s.invalidateFramebuffer(36008,he),t.bindFramebuffer(36008,null),t.bindFramebuffer(36009,_e.__webglMultisampledFramebuffer)}}function ve(M){return Math.min(u,M.samples)}function be(M){const x=n.get(M);return a&&M.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Ze(M){const x=o.render.frame;g.get(M)!==x&&(g.set(M,x),M.update())}function Xe(M,x){const U=M.encoding,Z=M.format,he=M.type;return M.isCompressedTexture===!0||M.isVideoTexture===!0||M.format===Vo||U!==qn&&(U===ot?a===!1?e.has("EXT_sRGB")===!0&&Z===an?(M.format=Vo,M.minFilter=Gt,M.generateMipmaps=!1):x=hi.sRGBToLinear(x):(Z!==an||he!==li)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture encoding:",U)),x}this.allocateTextureUnit=X,this.resetTextureUnits=k,this.setTexture2D=H,this.setTexture2DArray=K,this.setTexture3D=Y,this.setTextureCube=se,this.rebindTextures=re,this.setupRenderTarget=me,this.updateRenderTargetMipmap=ce,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=j,this.setupFrameBufferTexture=ie,this.useMultisampledRTT=be}function vg(s,e,t){const n=t.isWebGL2;function i(r,o=null){let a;if(r===li)return 5121;if(r===pu)return 32819;if(r===mu)return 32820;if(r===uu)return 5120;if(r===du)return 5122;if(r===_r)return 5123;if(r===fu)return 5124;if(r===_s)return 5125;if(r===ri)return 5126;if(r===yr)return n?5131:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===gu)return 6406;if(r===an)return 6408;if(r===xu)return 6409;if(r===_u)return 6410;if(r===oi)return 6402;if(r===Gi)return 34041;if(r===yu)return 6403;if(r===vu)return console.warn("THREE.WebGLRenderer: THREE.RGBFormat has been removed. Use THREE.RGBAFormat instead. https://github.com/mrdoob/three.js/pull/23228"),6408;if(r===Vo)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===bu)return 36244;if(r===Mu)return 33319;if(r===wu)return 33320;if(r===Su)return 36249;if(r===Xs||r===js||r===Js||r===Ys)if(o===ot)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===Xs)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===js)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Js)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Ys)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===Xs)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===js)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Js)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Ys)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Fa||r===za||r===Ba||r===Ua)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===Fa)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===za)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===Ba)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Ua)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Eu)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===Oa||r===Ha)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(r===Oa)return o===ot?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===Ha)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Va||r===Ga||r===ka||r===Wa||r===qa||r===Xa||r===ja||r===Ja||r===Ya||r===Za||r===$a||r===Ka||r===Qa||r===el)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(r===Va)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Ga)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===ka)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Wa)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===qa)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Xa)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===ja)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Ja)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Ya)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Za)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===$a)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Ka)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Qa)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===el)return o===ot?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===tl)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(r===tl)return o===ot?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT}else return null;return r===Ui?n?34042:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):s[r]!==void 0?s[r]:null}return{convert:i}}class Pc extends Ft{constructor(e=[]){super(),this.cameras=e}}Pc.prototype.isArrayCamera=!0;class mr extends et{constructor(){super(),this.type="Group"}}mr.prototype.isGroup=!0;const xg={type:"move"};class To{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new mr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new mr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new S,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new S),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new mr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new S,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new S),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred")if(a!==null&&(i=t.getPose(e.targetRaySpace,n),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(xg))),c&&e.hand){o=!0;for(const m of e.hand.values()){const f=t.getJointPose(m,n);if(c.joints[m.jointName]===void 0){const w=new mr;w.matrixAutoUpdate=!1,w.visible=!1,c.joints[m.jointName]=w,c.add(w)}const v=c.joints[m.jointName];f!==null&&(v.matrix.fromArray(f.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.jointRadius=f.radius),v.visible=f!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}}class Dc extends Mt{constructor(e,t,n,i,r,o,a,l,c,h){if(h=h!==void 0?h:oi,h!==oi&&h!==Gi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===oi&&(n=_r),n===void 0&&h===Gi&&(n=Ui),super(null,i,r,o,a,l,h,n,c),this.image={width:e,height:t},this.magFilter=a!==void 0?a:bt,this.minFilter=l!==void 0?l:bt,this.flipY=!1,this.generateMipmaps=!1}}Dc.prototype.isDepthTexture=!0;class _g extends ci{constructor(e,t){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=null,c=null,h=null,u=null,d=null,p=null;const g=t.getContextAttributes();let m=null,f=null;const v=[],w=new Map,E=new Ft;E.layers.enable(1),E.viewport=new nt;const b=new Ft;b.layers.enable(2),b.viewport=new nt;const T=[E,b],L=new Pc;L.layers.enable(1),L.layers.enable(2);let I=null,y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(B){let H=v[B];return H===void 0&&(H=new To,v[B]=H),H.getTargetRaySpace()},this.getControllerGrip=function(B){let H=v[B];return H===void 0&&(H=new To,v[B]=H),H.getGripSpace()},this.getHand=function(B){let H=v[B];return H===void 0&&(H=new To,v[B]=H),H.getHandSpace()};function C(B){const H=w.get(B.inputSource);H&&H.dispatchEvent({type:B.type,data:B.inputSource})}function N(){w.forEach(function(B,H){B.disconnect(H)}),w.clear(),I=null,y=null,e.setRenderTarget(m),d=null,u=null,h=null,i=null,f=null,X.stop(),n.isPresenting=!1,n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(B){r=B,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(B){a=B,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(B){l=B},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return h},this.getFrame=function(){return p},this.getSession=function(){return i},this.setSession=async function(B){if(i=B,i!==null){if(m=e.getRenderTarget(),i.addEventListener("select",C),i.addEventListener("selectstart",C),i.addEventListener("selectend",C),i.addEventListener("squeeze",C),i.addEventListener("squeezestart",C),i.addEventListener("squeezeend",C),i.addEventListener("end",N),i.addEventListener("inputsourceschange",P),g.xrCompatible!==!0&&await t.makeXRCompatible(),i.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const H={antialias:i.renderState.layers===void 0?g.antialias:!0,alpha:g.alpha,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,H),i.updateRenderState({baseLayer:d}),f=new Yt(d.framebufferWidth,d.framebufferHeight,{format:an,type:li,encoding:e.outputEncoding})}else{let H=null,K=null,Y=null;g.depth&&(Y=g.stencil?35056:33190,H=g.stencil?Gi:oi,K=g.stencil?Ui:_r);const se={colorFormat:e.outputEncoding===ot?35907:32856,depthFormat:Y,scaleFactor:r};h=new XRWebGLBinding(i,t),u=h.createProjectionLayer(se),i.updateRenderState({layers:[u]}),f=new Yt(u.textureWidth,u.textureHeight,{format:an,type:li,depthTexture:new Dc(u.textureWidth,u.textureHeight,K,void 0,void 0,void 0,void 0,void 0,void 0,H),stencilBuffer:g.stencil,encoding:e.outputEncoding,samples:g.antialias?4:0});const de=e.properties.get(f);de.__ignoreDepthValues=u.ignoreDepthValues}f.isXRRenderTarget=!0,this.setFoveation(1),o=await i.requestReferenceSpace(a),X.setContext(i),X.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}};function P(B){const H=i.inputSources;for(let K=0;K<H.length;K++){const Y=H[K].handedness==="right"?1:0;w.set(H[K],v[Y])}for(let K=0;K<B.removed.length;K++){const Y=B.removed[K],se=w.get(Y);se&&(se.dispatchEvent({type:"disconnected",data:Y}),w.delete(Y))}for(let K=0;K<B.added.length;K++){const Y=B.added[K],se=w.get(Y);se&&se.dispatchEvent({type:"connected",data:Y})}}const ee=new S,ne=new S;function R(B,H,K){ee.setFromMatrixPosition(H.matrixWorld),ne.setFromMatrixPosition(K.matrixWorld);const Y=ee.distanceTo(ne),se=H.projectionMatrix.elements,de=K.projectionMatrix.elements,ge=se[14]/(se[10]-1),W=se[14]/(se[10]+1),Ge=(se[9]+1)/se[5],we=(se[9]-1)/se[5],Fe=(se[8]-1)/se[0],ie=(de[8]+1)/de[0],ze=ge*Fe,J=ge*ie,j=Y/(-Fe+ie),re=j*-Fe;H.matrixWorld.decompose(B.position,B.quaternion,B.scale),B.translateX(re),B.translateZ(j),B.matrixWorld.compose(B.position,B.quaternion,B.scale),B.matrixWorldInverse.copy(B.matrixWorld).invert();const me=ge+j,ce=W+j,Se=ze-re,ve=J+(Y-re),be=Ge*W/ce*me,Ze=we*W/ce*me;B.projectionMatrix.makePerspective(Se,ve,be,Ze,me,ce)}function G(B,H){H===null?B.matrixWorld.copy(B.matrix):B.matrixWorld.multiplyMatrices(H.matrixWorld,B.matrix),B.matrixWorldInverse.copy(B.matrixWorld).invert()}this.updateCamera=function(B){if(i===null)return;L.near=b.near=E.near=B.near,L.far=b.far=E.far=B.far,(I!==L.near||y!==L.far)&&(i.updateRenderState({depthNear:L.near,depthFar:L.far}),I=L.near,y=L.far);const H=B.parent,K=L.cameras;G(L,H);for(let se=0;se<K.length;se++)G(K[se],H);L.matrixWorld.decompose(L.position,L.quaternion,L.scale),B.position.copy(L.position),B.quaternion.copy(L.quaternion),B.scale.copy(L.scale),B.matrix.copy(L.matrix),B.matrixWorld.copy(L.matrixWorld);const Y=B.children;for(let se=0,de=Y.length;se<de;se++)Y[se].updateMatrixWorld(!0);K.length===2?R(L,E,b):L.projectionMatrix.copy(E.projectionMatrix)},this.getCamera=function(){return L},this.getFoveation=function(){if(u!==null)return u.fixedFoveation;if(d!==null)return d.fixedFoveation},this.setFoveation=function(B){u!==null&&(u.fixedFoveation=B),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=B)};let z=null;function k(B,H){if(c=H.getViewerPose(l||o),p=H,c!==null){const Y=c.views;d!==null&&(e.setRenderTargetFramebuffer(f,d.framebuffer),e.setRenderTarget(f));let se=!1;Y.length!==L.cameras.length&&(L.cameras.length=0,se=!0);for(let de=0;de<Y.length;de++){const ge=Y[de];let W=null;if(d!==null)W=d.getViewport(ge);else{const we=h.getViewSubImage(u,ge);W=we.viewport,de===0&&(e.setRenderTargetTextures(f,we.colorTexture,u.ignoreDepthValues?void 0:we.depthStencilTexture),e.setRenderTarget(f))}const Ge=T[de];Ge.matrix.fromArray(ge.transform.matrix),Ge.projectionMatrix.fromArray(ge.projectionMatrix),Ge.viewport.set(W.x,W.y,W.width,W.height),de===0&&L.matrix.copy(Ge.matrix),se===!0&&L.cameras.push(Ge)}}const K=i.inputSources;for(let Y=0;Y<v.length;Y++){const se=K[Y],de=w.get(se);de!==void 0&&de.update(se,H,l||o)}z&&z(B,H),p=null}const X=new wc;X.setAnimationLoop(k),this.setAnimationLoop=function(B){z=B},this.dispose=function(){}}}function yg(s,e){function t(m,f){m.fogColor.value.copy(f.color),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function n(m,f,v,w,E){f.isMeshBasicMaterial||f.isMeshLambertMaterial?i(m,f):f.isMeshToonMaterial?(i(m,f),h(m,f)):f.isMeshPhongMaterial?(i(m,f),c(m,f)):f.isMeshStandardMaterial?(i(m,f),u(m,f),f.isMeshPhysicalMaterial&&d(m,f,E)):f.isMeshMatcapMaterial?(i(m,f),p(m,f)):f.isMeshDepthMaterial?i(m,f):f.isMeshDistanceMaterial?(i(m,f),g(m,f)):f.isMeshNormalMaterial?i(m,f):f.isLineBasicMaterial?(r(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?a(m,f,v,w):f.isSpriteMaterial?l(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function i(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map),f.alphaMap&&(m.alphaMap.value=f.alphaMap),f.bumpMap&&(m.bumpMap.value=f.bumpMap,m.bumpScale.value=f.bumpScale,f.side===ln&&(m.bumpScale.value*=-1)),f.displacementMap&&(m.displacementMap.value=f.displacementMap,m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap),f.normalMap&&(m.normalMap.value=f.normalMap,m.normalScale.value.copy(f.normalScale),f.side===ln&&m.normalScale.value.negate()),f.specularMap&&(m.specularMap.value=f.specularMap),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const v=e.get(f).envMap;if(v&&(m.envMap.value=v,m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap){m.lightMap.value=f.lightMap;const b=s.physicallyCorrectLights!==!0?Math.PI:1;m.lightMapIntensity.value=f.lightMapIntensity*b}f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity);let w;f.map?w=f.map:f.specularMap?w=f.specularMap:f.displacementMap?w=f.displacementMap:f.normalMap?w=f.normalMap:f.bumpMap?w=f.bumpMap:f.roughnessMap?w=f.roughnessMap:f.metalnessMap?w=f.metalnessMap:f.alphaMap?w=f.alphaMap:f.emissiveMap?w=f.emissiveMap:f.clearcoatMap?w=f.clearcoatMap:f.clearcoatNormalMap?w=f.clearcoatNormalMap:f.clearcoatRoughnessMap?w=f.clearcoatRoughnessMap:f.specularIntensityMap?w=f.specularIntensityMap:f.specularColorMap?w=f.specularColorMap:f.transmissionMap?w=f.transmissionMap:f.thicknessMap?w=f.thicknessMap:f.sheenColorMap?w=f.sheenColorMap:f.sheenRoughnessMap&&(w=f.sheenRoughnessMap),w!==void 0&&(w.isWebGLRenderTarget&&(w=w.texture),w.matrixAutoUpdate===!0&&w.updateMatrix(),m.uvTransform.value.copy(w.matrix));let E;f.aoMap?E=f.aoMap:f.lightMap&&(E=f.lightMap),E!==void 0&&(E.isWebGLRenderTarget&&(E=E.texture),E.matrixAutoUpdate===!0&&E.updateMatrix(),m.uv2Transform.value.copy(E.matrix))}function r(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function a(m,f,v,w){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*v,m.scale.value=w*.5,f.map&&(m.map.value=f.map),f.alphaMap&&(m.alphaMap.value=f.alphaMap),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let E;f.map?E=f.map:f.alphaMap&&(E=f.alphaMap),E!==void 0&&(E.matrixAutoUpdate===!0&&E.updateMatrix(),m.uvTransform.value.copy(E.matrix))}function l(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map),f.alphaMap&&(m.alphaMap.value=f.alphaMap),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let v;f.map?v=f.map:f.alphaMap&&(v=f.alphaMap),v!==void 0&&(v.matrixAutoUpdate===!0&&v.updateMatrix(),m.uvTransform.value.copy(v.matrix))}function c(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function h(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function u(m,f){m.roughness.value=f.roughness,m.metalness.value=f.metalness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap),f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap),e.get(f).envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function d(m,f,v){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap)),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap),f.clearcoatNormalMap&&(m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),m.clearcoatNormalMap.value=f.clearcoatNormalMap,f.side===ln&&m.clearcoatNormalScale.value.negate())),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap)}function p(m,f){f.matcap&&(m.matcap.value=f.matcap)}function g(m,f){m.referencePosition.value.copy(f.referencePosition),m.nearDistance.value=f.nearDistance,m.farDistance.value=f.farDistance}return{refreshFogUniforms:t,refreshMaterialUniforms:n}}function bg(){const s=Mr("canvas");return s.style.display="block",s}function tt(s={}){const e=s.canvas!==void 0?s.canvas:bg(),t=s.context!==void 0?s.context:null,n=s.depth!==void 0?s.depth:!0,i=s.stencil!==void 0?s.stencil:!0,r=s.antialias!==void 0?s.antialias:!1,o=s.premultipliedAlpha!==void 0?s.premultipliedAlpha:!0,a=s.preserveDrawingBuffer!==void 0?s.preserveDrawingBuffer:!1,l=s.powerPreference!==void 0?s.powerPreference:"default",c=s.failIfMajorPerformanceCaveat!==void 0?s.failIfMajorPerformanceCaveat:!1;let h;t!==null?h=t.getContextAttributes().alpha:h=s.alpha!==void 0?s.alpha:!1;let u=null,d=null;const p=[],g=[];this.domElement=e,this.debug={checkShaderErrors:!0},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.outputEncoding=qn,this.physicallyCorrectLights=!1,this.toneMapping=Pn,this.toneMappingExposure=1;const m=this;let f=!1,v=0,w=0,E=null,b=-1,T=null;const L=new nt,I=new nt;let y=null,C=e.width,N=e.height,P=1,ee=null,ne=null;const R=new nt(0,0,C,N),G=new nt(0,0,C,N);let z=!1;const k=new Fs;let X=!1,B=!1,H=null;const K=new Ce,Y=new Q,se=new S,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ge(){return E===null?P:1}let W=t;function Ge(_,D){for(let O=0;O<_.length;O++){const F=_[O],q=e.getContext(F,D);if(q!==null)return q}return null}try{const _={alpha:!0,depth:n,stencil:i,antialias:r,premultipliedAlpha:o,preserveDrawingBuffer:a,powerPreference:l,failIfMajorPerformanceCaveat:c};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Zo}`),e.addEventListener("webglcontextlost",A,!1),e.addEventListener("webglcontextrestored",ae,!1),W===null){const D=["webgl2","webgl","experimental-webgl"];if(m.isWebGL1Renderer===!0&&D.shift(),W=Ge(D,_),W===null)throw Ge(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}W.getShaderPrecisionFormat===void 0&&(W.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(_){throw console.error("THREE.WebGLRenderer: "+_.message),_}let we,Fe,ie,ze,J,j,re,me,ce,Se,ve,be,Ze,Xe,M,x,U,Z,he,ue,_e,V,De;function Le(){we=new Up(W),Fe=new Dp(W,we,s),we.init(Fe),V=new vg(W,we,Fe),ie=new mg(W,we,Fe),ze=new Vp,J=new rg,j=new gg(W,we,ie,J,Fe,V,ze),re=new Np(m),me=new Bp(m),ce=new ed(W,Fe),De=new Rp(W,we,ce,Fe),Se=new Op(W,ce,ze,De),ve=new qp(W,Se,ce,ze),he=new Wp(W,Fe,j),x=new Ip(J),be=new ig(m,re,me,we,Fe,De,x),Ze=new yg(m,J),Xe=new og,M=new dg(we,Fe),Z=new Lp(m,re,ie,ve,h,o),U=new Rc(m,ve,Fe),ue=new Pp(W,we,ze,Fe),_e=new Hp(W,we,ze,Fe),ze.programs=be.programs,m.capabilities=Fe,m.extensions=we,m.properties=J,m.renderLists=Xe,m.shadowMap=U,m.state=ie,m.info=ze}Le();const fe=new _g(m,W);this.xr=fe,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){const _=we.get("WEBGL_lose_context");_&&_.loseContext()},this.forceContextRestore=function(){const _=we.get("WEBGL_lose_context");_&&_.restoreContext()},this.getPixelRatio=function(){return P},this.setPixelRatio=function(_){_!==void 0&&(P=_,this.setSize(C,N,!1))},this.getSize=function(_){return _.set(C,N)},this.setSize=function(_,D,O){if(fe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}C=_,N=D,e.width=Math.floor(_*P),e.height=Math.floor(D*P),O!==!1&&(e.style.width=_+"px",e.style.height=D+"px"),this.setViewport(0,0,_,D)},this.getDrawingBufferSize=function(_){return _.set(C*P,N*P).floor()},this.setDrawingBufferSize=function(_,D,O){C=_,N=D,P=O,e.width=Math.floor(_*O),e.height=Math.floor(D*O),this.setViewport(0,0,_,D)},this.getCurrentViewport=function(_){return _.copy(L)},this.getViewport=function(_){return _.copy(R)},this.setViewport=function(_,D,O,F){_.isVector4?R.set(_.x,_.y,_.z,_.w):R.set(_,D,O,F),ie.viewport(L.copy(R).multiplyScalar(P).floor())},this.getScissor=function(_){return _.copy(G)},this.setScissor=function(_,D,O,F){_.isVector4?G.set(_.x,_.y,_.z,_.w):G.set(_,D,O,F),ie.scissor(I.copy(G).multiplyScalar(P).floor())},this.getScissorTest=function(){return z},this.setScissorTest=function(_){ie.setScissorTest(z=_)},this.setOpaqueSort=function(_){ee=_},this.setTransparentSort=function(_){ne=_},this.getClearColor=function(_){return _.copy(Z.getClearColor())},this.setClearColor=function(){Z.setClearColor.apply(Z,arguments)},this.getClearAlpha=function(){return Z.getClearAlpha()},this.setClearAlpha=function(){Z.setClearAlpha.apply(Z,arguments)},this.clear=function(_=!0,D=!0,O=!0){let F=0;_&&(F|=16384),D&&(F|=256),O&&(F|=1024),W.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",A,!1),e.removeEventListener("webglcontextrestored",ae,!1),Xe.dispose(),M.dispose(),J.dispose(),re.dispose(),me.dispose(),ve.dispose(),De.dispose(),be.dispose(),fe.dispose(),fe.removeEventListener("sessionstart",Me),fe.removeEventListener("sessionend",Je),H&&(H.dispose(),H=null),Ue.stop()};function A(_){_.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),f=!0}function ae(){console.log("THREE.WebGLRenderer: Context Restored."),f=!1;const _=ze.autoReset,D=U.enabled,O=U.autoUpdate,F=U.needsUpdate,q=U.type;Le(),ze.autoReset=_,U.enabled=D,U.autoUpdate=O,U.needsUpdate=F,U.type=q}function oe(_){const D=_.target;D.removeEventListener("dispose",oe),Ee(D)}function Ee(_){pe(_),J.remove(_)}function pe(_){const D=J.get(_).programs;D!==void 0&&(D.forEach(function(O){be.releaseProgram(O)}),_.isShaderMaterial&&be.releaseShaderCache(_))}this.renderBufferDirect=function(_,D,O,F,q,Ae){D===null&&(D=de);const Pe=q.isMesh&&q.matrixWorld.determinant()<0,Ie=di(_,D,O,F,q);ie.setMaterial(F,Pe);let Ne=O.index;const je=O.attributes.position;if(Ne===null){if(je===void 0||je.count===0)return}else if(Ne.count===0)return;let Oe=1;F.wireframe===!0&&(Ne=Se.getWireframeAttribute(O),Oe=2),De.setup(q,F,Ie,O,Ne);let Re,Ye=ue;Ne!==null&&(Re=ce.get(Ne),Ye=_e,Ye.setIndex(Re));const hn=Ne!==null?Ne.count:je.count,un=O.drawRange.start*Oe,$t=O.drawRange.count*Oe,Dt=Ae!==null?Ae.start*Oe:0,qe=Ae!==null?Ae.count*Oe:1/0,Ut=Math.max(un,Dt),lt=Math.min(hn,un+$t,Dt+qe)-1,Ot=Math.max(0,lt-Ut+1);if(Ot!==0){if(q.isMesh)F.wireframe===!0?(ie.setLineWidth(F.wireframeLinewidth*ge()),Ye.setMode(1)):Ye.setMode(4);else if(q.isLine){let Ht=F.linewidth;Ht===void 0&&(Ht=1),ie.setLineWidth(Ht*ge()),q.isLineSegments?Ye.setMode(1):q.isLineLoop?Ye.setMode(2):Ye.setMode(3)}else q.isPoints?Ye.setMode(0):q.isSprite&&Ye.setMode(4);if(q.isInstancedMesh)Ye.renderInstances(Ut,Ot,q.count);else if(O.isInstancedBufferGeometry){const Ht=Math.min(O.instanceCount,O._maxInstanceCount);Ye.renderInstances(Ut,Ot,Ht)}else Ye.render(Ut,Ot)}},this.compile=function(_,D){d=M.get(_),d.init(),g.push(d),_.traverseVisible(function(O){O.isLight&&O.layers.test(D.layers)&&(d.pushLight(O),O.castShadow&&d.pushShadow(O))}),d.setupLights(m.physicallyCorrectLights),_.traverse(function(O){const F=O.material;if(F)if(Array.isArray(F))for(let q=0;q<F.length;q++){const Ae=F[q];Yn(Ae,_,O)}else Yn(F,_,O)}),g.pop(),d=null};let Te=null;function $(_){Te&&Te(_)}function Me(){Ue.stop()}function Je(){Ue.start()}const Ue=new wc;Ue.setAnimationLoop($),typeof self<"u"&&Ue.setContext(self),this.setAnimationLoop=function(_){Te=_,fe.setAnimationLoop(_),_===null?Ue.stop():Ue.start()},fe.addEventListener("sessionstart",Me),fe.addEventListener("sessionend",Je),this.render=function(_,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(f===!0)return;_.autoUpdate===!0&&_.updateMatrixWorld(),D.parent===null&&D.updateMatrixWorld(),fe.enabled===!0&&fe.isPresenting===!0&&(fe.cameraAutoUpdate===!0&&fe.updateCamera(D),D=fe.getCamera()),_.isScene===!0&&_.onBeforeRender(m,_,D,E),d=M.get(_,g.length),d.init(),g.push(d),K.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),k.setFromProjectionMatrix(K),B=this.localClippingEnabled,X=x.init(this.clippingPlanes,B,D),u=Xe.get(_,p.length),u.init(),p.push(u),Ct(_,D,0,m.sortObjects),u.finish(),m.sortObjects===!0&&u.sort(ee,ne),X===!0&&x.beginShadows();const O=d.state.shadowsArray;if(U.render(O,_,D),X===!0&&x.endShadows(),this.info.autoReset===!0&&this.info.reset(),Z.render(u,_),d.setupLights(m.physicallyCorrectLights),D.isArrayCamera){const F=D.cameras;for(let q=0,Ae=F.length;q<Ae;q++){const Pe=F[q];Pt(u,_,Pe,Pe.viewport)}}else Pt(u,_,D);E!==null&&(j.updateMultisampleRenderTarget(E),j.updateRenderTargetMipmap(E)),_.isScene===!0&&_.onAfterRender(m,_,D),De.resetDefaultState(),b=-1,T=null,g.pop(),g.length>0?d=g[g.length-1]:d=null,p.pop(),p.length>0?u=p[p.length-1]:u=null};function Ct(_,D,O,F){if(_.visible===!1)return;if(_.layers.test(D.layers)){if(_.isGroup)O=_.renderOrder;else if(_.isLOD)_.autoUpdate===!0&&_.update(D);else if(_.isLight)d.pushLight(_),_.castShadow&&d.pushShadow(_);else if(_.isSprite){if(!_.frustumCulled||k.intersectsSprite(_)){F&&se.setFromMatrixPosition(_.matrixWorld).applyMatrix4(K);const Pe=ve.update(_),Ie=_.material;Ie.visible&&u.push(_,Pe,Ie,O,se.z,null)}}else if((_.isMesh||_.isLine||_.isPoints)&&(_.isSkinnedMesh&&_.skeleton.frame!==ze.render.frame&&(_.skeleton.update(),_.skeleton.frame=ze.render.frame),!_.frustumCulled||k.intersectsObject(_))){F&&se.setFromMatrixPosition(_.matrixWorld).applyMatrix4(K);const Pe=ve.update(_),Ie=_.material;if(Array.isArray(Ie)){const Ne=Pe.groups;for(let je=0,Oe=Ne.length;je<Oe;je++){const Re=Ne[je],Ye=Ie[Re.materialIndex];Ye&&Ye.visible&&u.push(_,Pe,Ye,O,se.z,Re)}}else Ie.visible&&u.push(_,Pe,Ie,O,se.z,null)}}const Ae=_.children;for(let Pe=0,Ie=Ae.length;Pe<Ie;Pe++)Ct(Ae[Pe],D,O,F)}function Pt(_,D,O,F){const q=_.opaque,Ae=_.transmissive,Pe=_.transparent;d.setupLightsView(O),Ae.length>0&&Qi(q,D,O),F&&ie.viewport(L.copy(F)),q.length>0&&Zt(q,D,O),Ae.length>0&&Zt(Ae,D,O),Pe.length>0&&Zt(Pe,D,O),ie.buffers.depth.setTest(!0),ie.buffers.depth.setMask(!0),ie.buffers.color.setMask(!0),ie.setPolygonOffset(!1)}function Qi(_,D,O){const F=Fe.isWebGL2;H===null&&(H=new Yt(1,1,{generateMipmaps:!0,type:we.has("EXT_color_buffer_half_float")?yr:li,minFilter:Ps,samples:F&&r===!0?4:0})),m.getDrawingBufferSize(Y),F?H.setSize(Y.x,Y.y):H.setSize(ko(Y.x),ko(Y.y));const q=m.getRenderTarget();m.setRenderTarget(H),m.clear();const Ae=m.toneMapping;m.toneMapping=Pn,Zt(_,D,O),m.toneMapping=Ae,j.updateMultisampleRenderTarget(H),j.updateRenderTargetMipmap(H),m.setRenderTarget(q)}function Zt(_,D,O){const F=D.isScene===!0?D.overrideMaterial:null;for(let q=0,Ae=_.length;q<Ae;q++){const Pe=_[q],Ie=Pe.object,Ne=Pe.geometry,je=F===null?Pe.material:F,Oe=Pe.group;Ie.layers.test(O.layers)&&Dr(Ie,D,O,Ne,je,Oe)}}function Dr(_,D,O,F,q,Ae){_.onBeforeRender(m,D,O,F,q,Ae),_.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,_.matrixWorld),_.normalMatrix.getNormalMatrix(_.modelViewMatrix),q.onBeforeRender(m,D,O,F,_,Ae),q.transparent===!0&&q.side===Oi?(q.side=ln,q.needsUpdate=!0,m.renderBufferDirect(O,D,F,q,_,Ae),q.side=xr,q.needsUpdate=!0,m.renderBufferDirect(O,D,F,q,_,Ae),q.side=Oi):m.renderBufferDirect(O,D,F,q,_,Ae),_.onAfterRender(m,D,O,F,q,Ae)}function Yn(_,D,O){D.isScene!==!0&&(D=de);const F=J.get(_),q=d.state.lights,Ae=d.state.shadowsArray,Pe=q.state.version,Ie=be.getParameters(_,q.state,Ae,D,O),Ne=be.getProgramCacheKey(Ie);let je=F.programs;F.environment=_.isMeshStandardMaterial?D.environment:null,F.fog=D.fog,F.envMap=(_.isMeshStandardMaterial?me:re).get(_.envMap||F.environment),je===void 0&&(_.addEventListener("dispose",oe),je=new Map,F.programs=je);let Oe=je.get(Ne);if(Oe!==void 0){if(F.currentProgram===Oe&&F.lightsStateVersion===Pe)return Dn(_,Ie),Oe}else Ie.uniforms=be.getUniforms(_),_.onBuild(O,Ie,m),_.onBeforeCompile(Ie,m),Oe=be.acquireProgram(Ie,Ne),je.set(Ne,Oe),F.uniforms=Ie.uniforms;const Re=F.uniforms;(!_.isShaderMaterial&&!_.isRawShaderMaterial||_.clipping===!0)&&(Re.clippingPlanes=x.uniform),Dn(_,Ie),F.needsLights=tr(_),F.lightsStateVersion=Pe,F.needsLights&&(Re.ambientLightColor.value=q.state.ambient,Re.lightProbe.value=q.state.probe,Re.directionalLights.value=q.state.directional,Re.directionalLightShadows.value=q.state.directionalShadow,Re.spotLights.value=q.state.spot,Re.spotLightShadows.value=q.state.spotShadow,Re.rectAreaLights.value=q.state.rectArea,Re.ltc_1.value=q.state.rectAreaLTC1,Re.ltc_2.value=q.state.rectAreaLTC2,Re.pointLights.value=q.state.point,Re.pointLightShadows.value=q.state.pointShadow,Re.hemisphereLights.value=q.state.hemi,Re.directionalShadowMap.value=q.state.directionalShadowMap,Re.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Re.spotShadowMap.value=q.state.spotShadowMap,Re.spotShadowMatrix.value=q.state.spotShadowMatrix,Re.pointShadowMap.value=q.state.pointShadowMap,Re.pointShadowMatrix.value=q.state.pointShadowMatrix);const Ye=Oe.getUniforms(),hn=kn.seqWithValue(Ye.seq,Re);return F.currentProgram=Oe,F.uniformsList=hn,Oe}function Dn(_,D){const O=J.get(_);O.outputEncoding=D.outputEncoding,O.instancing=D.instancing,O.skinning=D.skinning,O.morphTargets=D.morphTargets,O.morphNormals=D.morphNormals,O.morphColors=D.morphColors,O.morphTargetsCount=D.morphTargetsCount,O.numClippingPlanes=D.numClippingPlanes,O.numIntersection=D.numClipIntersection,O.vertexAlphas=D.vertexAlphas,O.vertexTangents=D.vertexTangents,O.toneMapping=D.toneMapping}function di(_,D,O,F,q){D.isScene!==!0&&(D=de),j.resetTextureUnits();const Ae=D.fog,Pe=F.isMeshStandardMaterial?D.environment:null,Ie=E===null?m.outputEncoding:E.isXRRenderTarget===!0?E.texture.encoding:qn,Ne=(F.isMeshStandardMaterial?me:re).get(F.envMap||Pe),je=F.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Oe=!!F.normalMap&&!!O.attributes.tangent,Re=!!O.morphAttributes.position,Ye=!!O.morphAttributes.normal,hn=!!O.morphAttributes.color,un=F.toneMapped?m.toneMapping:Pn,$t=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Dt=$t!==void 0?$t.length:0,qe=J.get(F),Ut=d.state.lights;if(X===!0&&(B===!0||_!==T)){const qt=_===T&&F.id===b;x.setState(F,_,qt)}let lt=!1;F.version===qe.__version?(qe.needsLights&&qe.lightsStateVersion!==Ut.state.version||qe.outputEncoding!==Ie||q.isInstancedMesh&&qe.instancing===!1||!q.isInstancedMesh&&qe.instancing===!0||q.isSkinnedMesh&&qe.skinning===!1||!q.isSkinnedMesh&&qe.skinning===!0||qe.envMap!==Ne||F.fog===!0&&qe.fog!==Ae||qe.numClippingPlanes!==void 0&&(qe.numClippingPlanes!==x.numPlanes||qe.numIntersection!==x.numIntersection)||qe.vertexAlphas!==je||qe.vertexTangents!==Oe||qe.morphTargets!==Re||qe.morphNormals!==Ye||qe.morphColors!==hn||qe.toneMapping!==un||Fe.isWebGL2===!0&&qe.morphTargetsCount!==Dt)&&(lt=!0):(lt=!0,qe.__version=F.version);let Ot=qe.currentProgram;lt===!0&&(Ot=Yn(F,D,q));let Ht=!1,dn=!1,Zn=!1;const pt=Ot.getUniforms(),It=qe.uniforms;if(ie.useProgram(Ot.program)&&(Ht=!0,dn=!0,Zn=!0),F.id!==b&&(b=F.id,dn=!0),Ht||T!==_){if(pt.setValue(W,"projectionMatrix",_.projectionMatrix),Fe.logarithmicDepthBuffer&&pt.setValue(W,"logDepthBufFC",2/(Math.log(_.far+1)/Math.LN2)),T!==_&&(T=_,dn=!0,Zn=!0),F.isShaderMaterial||F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshStandardMaterial||F.envMap){const qt=pt.map.cameraPosition;qt!==void 0&&qt.setValue(W,se.setFromMatrixPosition(_.matrixWorld))}(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)&&pt.setValue(W,"isOrthographic",_.isOrthographicCamera===!0),(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial||F.isShadowMaterial||q.isSkinnedMesh)&&pt.setValue(W,"viewMatrix",_.matrixWorldInverse)}if(q.isSkinnedMesh){pt.setOptional(W,q,"bindMatrix"),pt.setOptional(W,q,"bindMatrixInverse");const qt=q.skeleton;qt&&(Fe.floatVertexTextures?(qt.boneTexture===null&&qt.computeBoneTexture(),pt.setValue(W,"boneTexture",qt.boneTexture,j),pt.setValue(W,"boneTextureSize",qt.boneTextureSize)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}const en=O.morphAttributes;return(en.position!==void 0||en.normal!==void 0||en.color!==void 0&&Fe.isWebGL2===!0)&&he.update(q,O,F,Ot),(dn||qe.receiveShadow!==q.receiveShadow)&&(qe.receiveShadow=q.receiveShadow,pt.setValue(W,"receiveShadow",q.receiveShadow)),dn&&(pt.setValue(W,"toneMappingExposure",m.toneMappingExposure),qe.needsLights&&er(It,Zn),Ae&&F.fog===!0&&Ze.refreshFogUniforms(It,Ae),Ze.refreshMaterialUniforms(It,F,P,N,H),kn.upload(W,qe.uniformsList,It,j)),F.isShaderMaterial&&F.uniformsNeedUpdate===!0&&(kn.upload(W,qe.uniformsList,It,j),F.uniformsNeedUpdate=!1),F.isSpriteMaterial&&pt.setValue(W,"center",q.center),pt.setValue(W,"modelViewMatrix",q.modelViewMatrix),pt.setValue(W,"normalMatrix",q.normalMatrix),pt.setValue(W,"modelMatrix",q.matrixWorld),Ot}function er(_,D){_.ambientLightColor.needsUpdate=D,_.lightProbe.needsUpdate=D,_.directionalLights.needsUpdate=D,_.directionalLightShadows.needsUpdate=D,_.pointLights.needsUpdate=D,_.pointLightShadows.needsUpdate=D,_.spotLights.needsUpdate=D,_.spotLightShadows.needsUpdate=D,_.rectAreaLights.needsUpdate=D,_.hemisphereLights.needsUpdate=D}function tr(_){return _.isMeshLambertMaterial||_.isMeshToonMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isShadowMaterial||_.isShaderMaterial&&_.lights===!0}this.getActiveCubeFace=function(){return v},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(_,D,O){J.get(_.texture).__webglTexture=D,J.get(_.depthTexture).__webglTexture=O;const F=J.get(_);F.__hasExternalTextures=!0,F.__hasExternalTextures&&(F.__autoAllocateDepthBuffer=O===void 0,F.__autoAllocateDepthBuffer||we.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),F.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(_,D){const O=J.get(_);O.__webglFramebuffer=D,O.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(_,D=0,O=0){E=_,v=D,w=O;let F=!0;if(_){const Ne=J.get(_);Ne.__useDefaultFramebuffer!==void 0?(ie.bindFramebuffer(36160,null),F=!1):Ne.__webglFramebuffer===void 0?j.setupRenderTarget(_):Ne.__hasExternalTextures&&j.rebindTextures(_,J.get(_.texture).__webglTexture,J.get(_.depthTexture).__webglTexture)}let q=null,Ae=!1,Pe=!1;if(_){const Ne=_.texture;(Ne.isData3DTexture||Ne.isDataArrayTexture)&&(Pe=!0);const je=J.get(_).__webglFramebuffer;_.isWebGLCubeRenderTarget?(q=je[D],Ae=!0):Fe.isWebGL2&&_.samples>0&&j.useMultisampledRTT(_)===!1?q=J.get(_).__webglMultisampledFramebuffer:q=je,L.copy(_.viewport),I.copy(_.scissor),y=_.scissorTest}else L.copy(R).multiplyScalar(P).floor(),I.copy(G).multiplyScalar(P).floor(),y=z;if(ie.bindFramebuffer(36160,q)&&Fe.drawBuffers&&F&&ie.drawBuffers(_,q),ie.viewport(L),ie.scissor(I),ie.setScissorTest(y),Ae){const Ne=J.get(_.texture);W.framebufferTexture2D(36160,36064,34069+D,Ne.__webglTexture,O)}else if(Pe){const Ne=J.get(_.texture),je=D||0;W.framebufferTextureLayer(36160,36064,Ne.__webglTexture,O||0,je)}b=-1},this.readRenderTargetPixels=function(_,D,O,F,q,Ae,Pe){if(!(_&&_.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ie=J.get(_).__webglFramebuffer;if(_.isWebGLCubeRenderTarget&&Pe!==void 0&&(Ie=Ie[Pe]),Ie){ie.bindFramebuffer(36160,Ie);try{const Ne=_.texture,je=Ne.format,Oe=Ne.type;if(je!==an&&V.convert(je)!==W.getParameter(35739)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Re=Oe===yr&&(we.has("EXT_color_buffer_half_float")||Fe.isWebGL2&&we.has("EXT_color_buffer_float"));if(Oe!==li&&V.convert(Oe)!==W.getParameter(35738)&&!(Oe===ri&&(Fe.isWebGL2||we.has("OES_texture_float")||we.has("WEBGL_color_buffer_float")))&&!Re){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=_.width-F&&O>=0&&O<=_.height-q&&W.readPixels(D,O,F,q,V.convert(je),V.convert(Oe),Ae)}finally{const Ne=E!==null?J.get(E).__webglFramebuffer:null;ie.bindFramebuffer(36160,Ne)}}},this.copyFramebufferToTexture=function(_,D,O=0){if(D.isFramebufferTexture!==!0){console.error("THREE.WebGLRenderer: copyFramebufferToTexture() can only be used with FramebufferTexture.");return}const F=Math.pow(2,-O),q=Math.floor(D.image.width*F),Ae=Math.floor(D.image.height*F);j.setTexture2D(D,0),W.copyTexSubImage2D(3553,O,0,0,_.x,_.y,q,Ae),ie.unbindTexture()},this.copyTextureToTexture=function(_,D,O,F=0){const q=D.image.width,Ae=D.image.height,Pe=V.convert(O.format),Ie=V.convert(O.type);j.setTexture2D(O,0),W.pixelStorei(37440,O.flipY),W.pixelStorei(37441,O.premultiplyAlpha),W.pixelStorei(3317,O.unpackAlignment),D.isDataTexture?W.texSubImage2D(3553,F,_.x,_.y,q,Ae,Pe,Ie,D.image.data):D.isCompressedTexture?W.compressedTexSubImage2D(3553,F,_.x,_.y,D.mipmaps[0].width,D.mipmaps[0].height,Pe,D.mipmaps[0].data):W.texSubImage2D(3553,F,_.x,_.y,Pe,Ie,D.image),F===0&&O.generateMipmaps&&W.generateMipmap(3553),ie.unbindTexture()},this.copyTextureToTexture3D=function(_,D,O,F,q=0){if(m.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const Ae=_.max.x-_.min.x+1,Pe=_.max.y-_.min.y+1,Ie=_.max.z-_.min.z+1,Ne=V.convert(F.format),je=V.convert(F.type);let Oe;if(F.isData3DTexture)j.setTexture3D(F,0),Oe=32879;else if(F.isDataArrayTexture)j.setTexture2DArray(F,0),Oe=35866;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}W.pixelStorei(37440,F.flipY),W.pixelStorei(37441,F.premultiplyAlpha),W.pixelStorei(3317,F.unpackAlignment);const Re=W.getParameter(3314),Ye=W.getParameter(32878),hn=W.getParameter(3316),un=W.getParameter(3315),$t=W.getParameter(32877),Dt=O.isCompressedTexture?O.mipmaps[0]:O.image;W.pixelStorei(3314,Dt.width),W.pixelStorei(32878,Dt.height),W.pixelStorei(3316,_.min.x),W.pixelStorei(3315,_.min.y),W.pixelStorei(32877,_.min.z),O.isDataTexture||O.isData3DTexture?W.texSubImage3D(Oe,q,D.x,D.y,D.z,Ae,Pe,Ie,Ne,je,Dt.data):O.isCompressedTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),W.compressedTexSubImage3D(Oe,q,D.x,D.y,D.z,Ae,Pe,Ie,Ne,Dt.data)):W.texSubImage3D(Oe,q,D.x,D.y,D.z,Ae,Pe,Ie,Ne,je,Dt),W.pixelStorei(3314,Re),W.pixelStorei(32878,Ye),W.pixelStorei(3316,hn),W.pixelStorei(3315,un),W.pixelStorei(32877,$t),q===0&&F.generateMipmaps&&W.generateMipmap(Oe),ie.unbindTexture()},this.initTexture=function(_){j.setTexture2D(_,0),ie.unbindTexture()},this.resetState=function(){v=0,w=0,E=null,ie.reset(),De.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}tt.prototype.isWebGLRenderer=!0;class Mg extends tt{}Mg.prototype.isWebGL1Renderer=!0;class Es extends et{constructor(){super(),this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.overrideMaterial=null,this.autoUpdate=!0,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.autoUpdate=e.autoUpdate,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t}}Es.prototype.isScene=!0;class Cr{constructor(e,t){this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=br,this.updateRange={offset:0,count:-1},this.version=0,this.uuid=gn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.prototype.slice.call(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}Cr.prototype.isInterleavedBuffer=!0;const Nt=new S;class wr{constructor(e,t,n,i=!1){this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i===!0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix4(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyNormalMatrix(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.transformDirection(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}setX(e,t){return this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){return this.data.array[e*this.data.stride+this.offset]}getY(e){return this.data.array[e*this.data.stride+this.offset+1]}getZ(e){return this.data.array[e*this.data.stride+this.offset+2]}getW(e){return this.data.array[e*this.data.stride+this.offset+3]}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new vt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new wr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}wr.prototype.isInterleavedBufferAttribute=!0;class oa extends xt{constructor(e){super(),this.type="SpriteMaterial",this.color=new xe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}oa.prototype.isSpriteMaterial=!0;let Ci;const lr=new S,Li=new S,Ri=new S,Pi=new Q,cr=new Q,Ic=new Ce,os=new S,hr=new S,as=new S,Bl=new Q,Ao=new Q,Ul=new Q;class wg extends et{constructor(e){if(super(),this.type="Sprite",Ci===void 0){Ci=new st;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Cr(t,5);Ci.setIndex([0,1,2,0,2,3]),Ci.setAttribute("position",new wr(n,3,0,!1)),Ci.setAttribute("uv",new wr(n,2,3,!1))}this.geometry=Ci,this.material=e!==void 0?e:new oa,this.center=new Q(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Li.setFromMatrixScale(this.matrixWorld),Ic.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ri.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Li.multiplyScalar(-Ri.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const o=this.center;ls(os.set(-.5,-.5,0),Ri,o,Li,i,r),ls(hr.set(.5,-.5,0),Ri,o,Li,i,r),ls(as.set(.5,.5,0),Ri,o,Li,i,r),Bl.set(0,0),Ao.set(1,0),Ul.set(1,1);let a=e.ray.intersectTriangle(os,hr,as,!1,lr);if(a===null&&(ls(hr.set(-.5,.5,0),Ri,o,Li,i,r),Ao.set(0,1),a=e.ray.intersectTriangle(os,as,hr,!1,lr),a===null))return;const l=e.ray.origin.distanceTo(lr);l<e.near||l>e.far||t.push({distance:l,point:lr.clone(),uv:gt.getUV(lr,os,hr,as,Bl,Ao,Ul,new Q),face:null,object:this})}copy(e){return super.copy(e),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}wg.prototype.isSprite=!0;function ls(s,e,t,n,i,r){Pi.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(cr.x=r*Pi.x-i*Pi.y,cr.y=i*Pi.x+r*Pi.y):cr.copy(Pi),s.copy(e),s.x+=cr.x,s.y+=cr.y,s.applyMatrix4(Ic)}const Ol=new S,Hl=new nt,Vl=new nt,Sg=new S,Gl=new Ce;class Nc extends At{constructor(e,t){super(e,t),this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new Ce,this.bindMatrixInverse=new Ce}copy(e){return super.copy(e),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new nt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode==="attached"?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode==="detached"?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}boneTransform(e,t){const n=this.skeleton,i=this.geometry;Hl.fromBufferAttribute(i.attributes.skinIndex,e),Vl.fromBufferAttribute(i.attributes.skinWeight,e),Ol.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=Vl.getComponent(r);if(o!==0){const a=Hl.getComponent(r);Gl.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Sg.copy(Ol).applyMatrix4(Gl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}Nc.prototype.isSkinnedMesh=!0;class Eg extends et{constructor(){super(),this.type="Bone"}}Eg.prototype.isBone=!0;class Tg extends Mt{constructor(e=null,t=1,n=1,i,r,o,a,l,c=bt,h=bt,u,d){super(null,o,a,l,c,h,i,r,u,d),this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}Tg.prototype.isDataTexture=!0;class qo extends vt{constructor(e,t,n,i=1){typeof n=="number"&&(i=n,n=!1,console.error("THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.")),super(e,t,n),this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}qo.prototype.isInstancedBufferAttribute=!0;const kl=new Ce,Wl=new Ce,cs=[],ur=new At;class Ag extends At{constructor(e,t,n){super(e,t),this.instanceMatrix=new qo(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.frustumCulled=!1}copy(e){return super.copy(e),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){const n=this.matrixWorld,i=this.count;if(ur.geometry=this.geometry,ur.material=this.material,ur.material!==void 0)for(let r=0;r<i;r++){this.getMatrixAt(r,kl),Wl.multiplyMatrices(n,kl),ur.matrixWorld=Wl,ur.raycast(e,cs);for(let o=0,a=cs.length;o<a;o++){const l=cs[o];l.instanceId=r,l.object=this,t.push(l)}cs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new qo(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}Ag.prototype.isInstancedMesh=!0;class Yi extends xt{constructor(e){super(),this.type="LineBasicMaterial",this.color=new xe(16777215),this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}Yi.prototype.isLineBasicMaterial=!0;const ql=new S,Xl=new S,jl=new Ce,Co=new ji,hs=new Xi;class aa extends et{constructor(e=new st,t=new Yi){super(),this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),this.material=e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.isBufferGeometry)if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)ql.fromBufferAttribute(t,i-1),Xl.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=ql.distanceTo(Xl);e.setAttribute("lineDistance",new dt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");else e.isGeometry&&console.error("THREE.Line.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hs.copy(n.boundingSphere),hs.applyMatrix4(i),hs.radius+=r,e.ray.intersectsSphere(hs)===!1)return;jl.copy(i).invert(),Co.copy(e.ray).applyMatrix4(jl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new S,h=new S,u=new S,d=new S,p=this.isLineSegments?2:1;if(n.isBufferGeometry){const g=n.index,f=n.attributes.position;if(g!==null){const v=Math.max(0,o.start),w=Math.min(g.count,o.start+o.count);for(let E=v,b=w-1;E<b;E+=p){const T=g.getX(E),L=g.getX(E+1);if(c.fromBufferAttribute(f,T),h.fromBufferAttribute(f,L),Co.distanceSqToSegment(c,h,d,u)>l)continue;d.applyMatrix4(this.matrixWorld);const y=e.ray.origin.distanceTo(d);y<e.near||y>e.far||t.push({distance:y,point:u.clone().applyMatrix4(this.matrixWorld),index:E,face:null,faceIndex:null,object:this})}}else{const v=Math.max(0,o.start),w=Math.min(f.count,o.start+o.count);for(let E=v,b=w-1;E<b;E+=p){if(c.fromBufferAttribute(f,E),h.fromBufferAttribute(f,E+1),Co.distanceSqToSegment(c,h,d,u)>l)continue;d.applyMatrix4(this.matrixWorld);const L=e.ray.origin.distanceTo(d);L<e.near||L>e.far||t.push({distance:L,point:u.clone().applyMatrix4(this.matrixWorld),index:E,face:null,faceIndex:null,object:this})}}}else n.isGeometry&&console.error("THREE.Line.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}updateMorphTargets(){const e=this.geometry;if(e.isBufferGeometry){const t=e.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}else{const t=e.morphTargets;t!==void 0&&t.length>0&&console.error("THREE.Line.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.")}}}aa.prototype.isLine=!0;const Jl=new S,Yl=new S;class la extends aa{constructor(e,t){super(e,t),this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.isBufferGeometry)if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Jl.fromBufferAttribute(t,i),Yl.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Jl.distanceTo(Yl);e.setAttribute("lineDistance",new dt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");else e.isGeometry&&console.error("THREE.LineSegments.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.");return this}}la.prototype.isLineSegments=!0;class Cg extends aa{constructor(e,t){super(e,t),this.type="LineLoop"}}Cg.prototype.isLineLoop=!0;class ca extends xt{constructor(e){super(),this.type="PointsMaterial",this.color=new xe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}ca.prototype.isPointsMaterial=!0;const Zl=new Ce,Xo=new ji,us=new Xi,ds=new S;class Lg extends et{constructor(e=new st,t=new ca){super(),this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),this.material=e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),us.copy(n.boundingSphere),us.applyMatrix4(i),us.radius+=r,e.ray.intersectsSphere(us)===!1)return;Zl.copy(i).invert(),Xo.copy(e.ray).applyMatrix4(Zl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a;if(n.isBufferGeometry){const c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let g=d,m=p;g<m;g++){const f=c.getX(g);ds.fromBufferAttribute(u,f),$l(ds,f,l,i,e,t,this)}}else{const d=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let g=d,m=p;g<m;g++)ds.fromBufferAttribute(u,g),$l(ds,g,l,i,e,t,this)}}else console.error("THREE.Points.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}updateMorphTargets(){const e=this.geometry;if(e.isBufferGeometry){const t=e.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}else{const t=e.morphTargets;t!==void 0&&t.length>0&&console.error("THREE.Points.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.")}}}Lg.prototype.isPoints=!0;function $l(s,e,t,n,i,r,o){const a=Xo.distanceSqToPoint(s);if(a<t){const l=new S;Xo.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,object:o})}}class Rg extends Mt{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.minFilter=o!==void 0?o:Gt,this.magFilter=r!==void 0?r:Gt,this.generateMipmaps=!1;const h=this;function u(){h.needsUpdate=!0,e.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}Rg.prototype.isVideoTexture=!0;class Pg extends Mt{constructor(e,t,n){super({width:e,height:t}),this.format=n,this.magFilter=bt,this.minFilter=bt,this.generateMipmaps=!1,this.needsUpdate=!0}}Pg.prototype.isFramebufferTexture=!0;class Dg extends Mt{constructor(e,t,n,i,r,o,a,l,c,h,u,d){super(null,o,a,l,c,h,i,r,u,d),this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}Dg.prototype.isCompressedTexture=!0;class Ig extends Mt{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.needsUpdate=!0}}Ig.prototype.isCanvasTexture=!0;class Qt{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);const h=n[i],d=n[i+1]-h,p=(o-h)/d;return(i+p)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const o=this.getPoint(i),a=this.getPoint(r),l=t||(o.isVector2?new Q:new S);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new S,i=[],r=[],o=[],a=new S,l=new Ce;for(let p=0;p<=e;p++){const g=p/e;i[p]=this.getTangentAt(g,new S)}r[0]=new S,o[0]=new S;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(i[p-1],i[p]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Rt(i[p-1].dot(i[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(i[p],r[p])}if(t===!0){let p=Math.acos(Rt(r[0].dot(r[e]),-1,1));p/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],p*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.5,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Us extends Qt{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){const n=t||new Q,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}Us.prototype.isEllipseCurve=!0;class Fc extends Us{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.type="ArcCurve"}}Fc.prototype.isArcCurve=!0;function ha(){let s=0,e=0,t=0,n=0;function i(r,o,a,l){s=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,p*=h,i(o,a,d,p)},calc:function(r){const o=r*r,a=o*r;return s+e*r+t*o+n*a}}}const fs=new S,Lo=new ha,Ro=new ha,Po=new ha;class zc extends Qt{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new S){const n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=i[(a-1)%r]:(fs.subVectors(i[0],i[1]).add(i[0]),c=fs);const u=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(fs.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=fs),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),p),m=Math.pow(u.distanceToSquared(d),p),f=Math.pow(d.distanceToSquared(h),p);m<1e-4&&(m=1),g<1e-4&&(g=m),f<1e-4&&(f=m),Lo.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,m,f),Ro.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,m,f),Po.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,m,f)}else this.curveType==="catmullrom"&&(Lo.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Ro.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Po.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Lo.calc(l),Ro.calc(l),Po.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new S().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}zc.prototype.isCatmullRomCurve3=!0;function Kl(s,e,t,n,i){const r=(n-e)*.5,o=(i-t)*.5,a=s*s,l=s*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*s+t}function Ng(s,e){const t=1-s;return t*t*e}function Fg(s,e){return 2*(1-s)*s*e}function zg(s,e){return s*s*e}function gr(s,e,t,n){return Ng(s,e)+Fg(s,t)+zg(s,n)}function Bg(s,e){const t=1-s;return t*t*t*e}function Ug(s,e){const t=1-s;return 3*t*t*s*e}function Og(s,e){return 3*(1-s)*s*s*e}function Hg(s,e){return s*s*s*e}function vr(s,e,t,n,i){return Bg(s,e)+Ug(s,t)+Og(s,n)+Hg(s,i)}class ua extends Qt{constructor(e=new Q,t=new Q,n=new Q,i=new Q){super(),this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new Q){const n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(vr(e,i.x,r.x,o.x,a.x),vr(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}ua.prototype.isCubicBezierCurve=!0;class Bc extends Qt{constructor(e=new S,t=new S,n=new S,i=new S){super(),this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new S){const n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(vr(e,i.x,r.x,o.x,a.x),vr(e,i.y,r.y,o.y,a.y),vr(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}Bc.prototype.isCubicBezierCurve3=!0;class Os extends Qt{constructor(e=new Q,t=new Q){super(),this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Q){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t){const n=t||new Q;return n.copy(this.v2).sub(this.v1).normalize(),n}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}Os.prototype.isLineCurve=!0;class Vg extends Qt{constructor(e=new S,t=new S){super(),this.type="LineCurve3",this.isLineCurve3=!0,this.v1=e,this.v2=t}getPoint(e,t=new S){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class da extends Qt{constructor(e=new Q,t=new Q,n=new Q){super(),this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Q){const n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(gr(e,i.x,r.x,o.x),gr(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}da.prototype.isQuadraticBezierCurve=!0;class Uc extends Qt{constructor(e=new S,t=new S,n=new S){super(),this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new S){const n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(gr(e,i.x,r.x,o.x),gr(e,i.y,r.y,o.y),gr(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}Uc.prototype.isQuadraticBezierCurve3=!0;class fa extends Qt{constructor(e=[]){super(),this.type="SplineCurve",this.points=e}getPoint(e,t=new Q){const n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(Kl(a,l.x,c.x,h.x,u.x),Kl(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new Q().fromArray(i))}return this}}fa.prototype.isSplineCurve=!0;var Oc=Object.freeze({__proto__:null,ArcCurve:Fc,CatmullRomCurve3:zc,CubicBezierCurve:ua,CubicBezierCurve3:Bc,EllipseCurve:Us,LineCurve:Os,LineCurve3:Vg,QuadraticBezierCurve:da,QuadraticBezierCurve3:Uc,SplineCurve:fa});class Gg extends Qt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);e.equals(t)||this.curves.push(new Os(t,e))}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const o=r[i],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new Oc[i.type]().fromJSON(i))}return this}}class jo extends Gg{constructor(e){super(),this.type="Path",this.currentPoint=new Q,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Os(this.currentPoint.clone(),new Q(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const r=new da(this.currentPoint.clone(),new Q(e,t),new Q(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){const a=new ua(this.currentPoint.clone(),new Q(e,t),new Q(n,i),new Q(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new fa(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,r,o,a,l),this}absellipse(e,t,n,i,r,o,a,l){const c=new Us(e,t,n,i,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Lr extends jo{constructor(e){super(e),this.uuid=gn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(new jo().fromJSON(i))}return this}}const kg={triangulate:function(s,e,t=2){const n=e&&e.length,i=n?e[0]*t:s.length;let r=Hc(s,0,i,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,d,p;if(n&&(r=Jg(s,e,r,t)),s.length>80*t){a=c=s[0],l=h=s[1];for(let g=t;g<i;g+=t)u=s[g],d=s[g+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);p=Math.max(c-a,h-l),p=p!==0?1/p:0}return Sr(r,o,t,a,l,p),o}};function Hc(s,e,t,n,i){let r,o;if(i===s0(s,e,t,n)>0)for(r=e;r<t;r+=n)o=Ql(r,s[r],s[r+1],o);else for(r=t-n;r>=e;r-=n)o=Ql(r,s[r],s[r+1],o);return o&&Hs(o,o.next)&&(Tr(o),o=o.next),o}function Xn(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(Hs(t,t.next)||ct(t.prev,t,t.next)===0)){if(Tr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Sr(s,e,t,n,i,r,o){if(!s)return;!o&&r&&Qg(s,n,i,r);let a=s,l,c;for(;s.prev!==s.next;){if(l=s.prev,c=s.next,r?qg(s,n,i,r):Wg(s)){e.push(l.i/t),e.push(s.i/t),e.push(c.i/t),Tr(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=Xg(Xn(s),e,t),Sr(s,e,t,n,i,r,2)):o===2&&jg(s,e,t,n,i,r):Sr(Xn(s),e,t,n,i,r,1);break}}}function Wg(s){const e=s.prev,t=s,n=s.next;if(ct(e,t,n)>=0)return!1;let i=s.next.next;for(;i!==s.prev;){if(zi(e.x,e.y,t.x,t.y,n.x,n.y,i.x,i.y)&&ct(i.prev,i,i.next)>=0)return!1;i=i.next}return!0}function qg(s,e,t,n){const i=s.prev,r=s,o=s.next;if(ct(i,r,o)>=0)return!1;const a=i.x<r.x?i.x<o.x?i.x:o.x:r.x<o.x?r.x:o.x,l=i.y<r.y?i.y<o.y?i.y:o.y:r.y<o.y?r.y:o.y,c=i.x>r.x?i.x>o.x?i.x:o.x:r.x>o.x?r.x:o.x,h=i.y>r.y?i.y>o.y?i.y:o.y:r.y>o.y?r.y:o.y,u=Jo(a,l,e,t,n),d=Jo(c,h,e,t,n);let p=s.prevZ,g=s.nextZ;for(;p&&p.z>=u&&g&&g.z<=d;){if(p!==s.prev&&p!==s.next&&zi(i.x,i.y,r.x,r.y,o.x,o.y,p.x,p.y)&&ct(p.prev,p,p.next)>=0||(p=p.prevZ,g!==s.prev&&g!==s.next&&zi(i.x,i.y,r.x,r.y,o.x,o.y,g.x,g.y)&&ct(g.prev,g,g.next)>=0))return!1;g=g.nextZ}for(;p&&p.z>=u;){if(p!==s.prev&&p!==s.next&&zi(i.x,i.y,r.x,r.y,o.x,o.y,p.x,p.y)&&ct(p.prev,p,p.next)>=0)return!1;p=p.prevZ}for(;g&&g.z<=d;){if(g!==s.prev&&g!==s.next&&zi(i.x,i.y,r.x,r.y,o.x,o.y,g.x,g.y)&&ct(g.prev,g,g.next)>=0)return!1;g=g.nextZ}return!0}function Xg(s,e,t){let n=s;do{const i=n.prev,r=n.next.next;!Hs(i,r)&&Vc(i,n,n.next,r)&&Er(i,r)&&Er(r,i)&&(e.push(i.i/t),e.push(n.i/t),e.push(r.i/t),Tr(n),Tr(n.next),n=s=r),n=n.next}while(n!==s);return Xn(n)}function jg(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&n0(o,a)){let l=Gc(o,a);o=Xn(o,o.next),l=Xn(l,l.next),Sr(o,e,t,n,i,r),Sr(l,e,t,n,i,r);return}a=a.next}o=o.next}while(o!==s)}function Jg(s,e,t,n){const i=[];let r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*n,l=r<o-1?e[r+1]*n:s.length,c=Hc(s,a,l,n,!1),c===c.next&&(c.steiner=!0),i.push(t0(c));for(i.sort(Yg),r=0;r<i.length;r++)Zg(i[r],t),t=Xn(t,t.next);return t}function Yg(s,e){return s.x-e.x}function Zg(s,e){if(e=$g(s,e),e){const t=Gc(e,s);Xn(e,e.next),Xn(t,t.next)}}function $g(s,e){let t=e;const n=s.x,i=s.y;let r=-1/0,o;do{if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){const d=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r){if(r=d,d===n){if(i===t.y)return t;if(i===t.next.y)return t.next}o=t.x<t.next.x?t:t.next}}t=t.next}while(t!==e);if(!o)return null;if(n===r)return o;const a=o,l=o.x,c=o.y;let h=1/0,u;t=o;do n>=t.x&&t.x>=l&&n!==t.x&&zi(i<c?n:r,i,l,c,i<c?r:n,i,t.x,t.y)&&(u=Math.abs(i-t.y)/(n-t.x),Er(t,s)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Kg(o,t)))&&(o=t,h=u)),t=t.next;while(t!==a);return o}function Kg(s,e){return ct(s.prev,s,e.prev)<0&&ct(e.next,s,s.next)<0}function Qg(s,e,t,n){let i=s;do i.z===null&&(i.z=Jo(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,e0(i)}function e0(s){let e,t,n,i,r,o,a,l,c=1;do{for(t=s,s=null,r=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(i=t,t=t.nextZ,a--):(i=n,n=n.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;t=n}r.nextZ=null,c*=2}while(o>1);return s}function Jo(s,e,t,n,i){return s=32767*(s-t)*i,e=32767*(e-n)*i,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function t0(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function zi(s,e,t,n,i,r,o,a){return(i-o)*(e-a)-(s-o)*(r-a)>=0&&(s-o)*(n-a)-(t-o)*(e-a)>=0&&(t-o)*(r-a)-(i-o)*(n-a)>=0}function n0(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!i0(s,e)&&(Er(s,e)&&Er(e,s)&&r0(s,e)&&(ct(s.prev,s,e.prev)||ct(s,e.prev,e))||Hs(s,e)&&ct(s.prev,s,s.next)>0&&ct(e.prev,e,e.next)>0)}function ct(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function Hs(s,e){return s.x===e.x&&s.y===e.y}function Vc(s,e,t,n){const i=ms(ct(s,e,t)),r=ms(ct(s,e,n)),o=ms(ct(t,n,s)),a=ms(ct(t,n,e));return!!(i!==r&&o!==a||i===0&&ps(s,t,e)||r===0&&ps(s,n,e)||o===0&&ps(t,s,n)||a===0&&ps(t,e,n))}function ps(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function ms(s){return s>0?1:s<0?-1:0}function i0(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&Vc(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Er(s,e){return ct(s.prev,s,s.next)<0?ct(s,e,s.next)>=0&&ct(s,s.prev,e)>=0:ct(s,e,s.prev)<0||ct(s,s.next,e)<0}function r0(s,e){let t=s,n=!1;const i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function Gc(s,e){const t=new Yo(s.i,s.x,s.y),n=new Yo(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Ql(s,e,t,n){const i=new Yo(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Tr(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Yo(s,e,t){this.i=s,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function s0(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}class Wn{static area(e){const t=e.length;let n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return Wn.area(e)<0}static triangulateShape(e,t){const n=[],i=[],r=[];ec(e),tc(n,e);let o=e.length;t.forEach(ec);for(let l=0;l<t.length;l++)i.push(o),o+=t[l].length,tc(n,t[l]);const a=kg.triangulate(n,i);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function ec(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function tc(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class Zi extends st{constructor(e=new Lr([new Q(.5,.5),new Q(-.5,.5),new Q(-.5,-.5),new Q(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,i=[],r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new dt(i,3)),this.setAttribute("uv",new dt(r,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1;let u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:p-.1,m=t.bevelOffset!==void 0?t.bevelOffset:0,f=t.bevelSegments!==void 0?t.bevelSegments:3;const v=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:o0;t.amount!==void 0&&(console.warn("THREE.ExtrudeBufferGeometry: amount has been renamed to depth."),u=t.amount);let E,b=!1,T,L,I,y;v&&(E=v.getSpacedPoints(h),b=!0,d=!1,T=v.computeFrenetFrames(h,!1),L=new S,I=new S,y=new S),d||(f=0,p=0,g=0,m=0);const C=a.extractPoints(c);let N=C.shape;const P=C.holes;if(!Wn.isClockWise(N)){N=N.reverse();for(let J=0,j=P.length;J<j;J++){const re=P[J];Wn.isClockWise(re)&&(P[J]=re.reverse())}}const ne=Wn.triangulateShape(N,P),R=N;for(let J=0,j=P.length;J<j;J++){const re=P[J];N=N.concat(re)}function G(J,j,re){return j||console.error("THREE.ExtrudeGeometry: vec does not exist"),j.clone().multiplyScalar(re).add(J)}const z=N.length,k=ne.length;function X(J,j,re){let me,ce,Se;const ve=J.x-j.x,be=J.y-j.y,Ze=re.x-J.x,Xe=re.y-J.y,M=ve*ve+be*be,x=ve*Xe-be*Ze;if(Math.abs(x)>Number.EPSILON){const U=Math.sqrt(M),Z=Math.sqrt(Ze*Ze+Xe*Xe),he=j.x-be/U,ue=j.y+ve/U,_e=re.x-Xe/Z,V=re.y+Ze/Z,De=((_e-he)*Xe-(V-ue)*Ze)/(ve*Xe-be*Ze);me=he+ve*De-J.x,ce=ue+be*De-J.y;const Le=me*me+ce*ce;if(Le<=2)return new Q(me,ce);Se=Math.sqrt(Le/2)}else{let U=!1;ve>Number.EPSILON?Ze>Number.EPSILON&&(U=!0):ve<-Number.EPSILON?Ze<-Number.EPSILON&&(U=!0):Math.sign(be)===Math.sign(Xe)&&(U=!0),U?(me=-be,ce=ve,Se=Math.sqrt(M)):(me=ve,ce=be,Se=Math.sqrt(M/2))}return new Q(me/Se,ce/Se)}const B=[];for(let J=0,j=R.length,re=j-1,me=J+1;J<j;J++,re++,me++)re===j&&(re=0),me===j&&(me=0),B[J]=X(R[J],R[re],R[me]);const H=[];let K,Y=B.concat();for(let J=0,j=P.length;J<j;J++){const re=P[J];K=[];for(let me=0,ce=re.length,Se=ce-1,ve=me+1;me<ce;me++,Se++,ve++)Se===ce&&(Se=0),ve===ce&&(ve=0),K[me]=X(re[me],re[Se],re[ve]);H.push(K),Y=Y.concat(K)}for(let J=0;J<f;J++){const j=J/f,re=p*Math.cos(j*Math.PI/2),me=g*Math.sin(j*Math.PI/2)+m;for(let ce=0,Se=R.length;ce<Se;ce++){const ve=G(R[ce],B[ce],me);Ge(ve.x,ve.y,-re)}for(let ce=0,Se=P.length;ce<Se;ce++){const ve=P[ce];K=H[ce];for(let be=0,Ze=ve.length;be<Ze;be++){const Xe=G(ve[be],K[be],me);Ge(Xe.x,Xe.y,-re)}}}const se=g+m;for(let J=0;J<z;J++){const j=d?G(N[J],Y[J],se):N[J];b?(I.copy(T.normals[0]).multiplyScalar(j.x),L.copy(T.binormals[0]).multiplyScalar(j.y),y.copy(E[0]).add(I).add(L),Ge(y.x,y.y,y.z)):Ge(j.x,j.y,0)}for(let J=1;J<=h;J++)for(let j=0;j<z;j++){const re=d?G(N[j],Y[j],se):N[j];b?(I.copy(T.normals[J]).multiplyScalar(re.x),L.copy(T.binormals[J]).multiplyScalar(re.y),y.copy(E[J]).add(I).add(L),Ge(y.x,y.y,y.z)):Ge(re.x,re.y,u/h*J)}for(let J=f-1;J>=0;J--){const j=J/f,re=p*Math.cos(j*Math.PI/2),me=g*Math.sin(j*Math.PI/2)+m;for(let ce=0,Se=R.length;ce<Se;ce++){const ve=G(R[ce],B[ce],me);Ge(ve.x,ve.y,u+re)}for(let ce=0,Se=P.length;ce<Se;ce++){const ve=P[ce];K=H[ce];for(let be=0,Ze=ve.length;be<Ze;be++){const Xe=G(ve[be],K[be],me);b?Ge(Xe.x,Xe.y+E[h-1].y,E[h-1].x+re):Ge(Xe.x,Xe.y,u+re)}}}de(),ge();function de(){const J=i.length/3;if(d){let j=0,re=z*j;for(let me=0;me<k;me++){const ce=ne[me];we(ce[2]+re,ce[1]+re,ce[0]+re)}j=h+f*2,re=z*j;for(let me=0;me<k;me++){const ce=ne[me];we(ce[0]+re,ce[1]+re,ce[2]+re)}}else{for(let j=0;j<k;j++){const re=ne[j];we(re[2],re[1],re[0])}for(let j=0;j<k;j++){const re=ne[j];we(re[0]+z*h,re[1]+z*h,re[2]+z*h)}}n.addGroup(J,i.length/3-J,0)}function ge(){const J=i.length/3;let j=0;W(R,j),j+=R.length;for(let re=0,me=P.length;re<me;re++){const ce=P[re];W(ce,j),j+=ce.length}n.addGroup(J,i.length/3-J,1)}function W(J,j){let re=J.length;for(;--re>=0;){const me=re;let ce=re-1;ce<0&&(ce=J.length-1);for(let Se=0,ve=h+f*2;Se<ve;Se++){const be=z*Se,Ze=z*(Se+1),Xe=j+me+be,M=j+ce+be,x=j+ce+Ze,U=j+me+Ze;Fe(Xe,M,x,U)}}}function Ge(J,j,re){l.push(J),l.push(j),l.push(re)}function we(J,j,re){ie(J),ie(j),ie(re);const me=i.length/3,ce=w.generateTopUV(n,i,me-3,me-2,me-1);ze(ce[0]),ze(ce[1]),ze(ce[2])}function Fe(J,j,re,me){ie(J),ie(j),ie(me),ie(j),ie(re),ie(me);const ce=i.length/3,Se=w.generateSideWallUV(n,i,ce-6,ce-3,ce-2,ce-1);ze(Se[0]),ze(Se[1]),ze(Se[3]),ze(Se[1]),ze(Se[2]),ze(Se[3])}function ie(J){i.push(l[J*3+0]),i.push(l[J*3+1]),i.push(l[J*3+2])}function ze(J){r.push(J.x),r.push(J.y)}}}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return a0(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];n.push(a)}const i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Oc[i.type]().fromJSON(i)),new Zi(n,e.options)}}const o0={generateTopUV:function(s,e,t,n,i){const r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[i*3],h=e[i*3+1];return[new Q(r,o),new Q(a,l),new Q(c,h)]},generateSideWallUV:function(s,e,t,n,i,r){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[i*3],p=e[i*3+1],g=e[i*3+2],m=e[r*3],f=e[r*3+1],v=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new Q(o,1-l),new Q(c,1-u),new Q(d,1-g),new Q(m,1-v)]:[new Q(a,1-l),new Q(h,1-u),new Q(p,1-g),new Q(f,1-v)]}};function a0(s,e,t){if(t.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class pa extends st{constructor(e=new Lr([new Q(0,.5),new Q(-.5,-.5),new Q(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const n=[],i=[],r=[],o=[];let a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new dt(i,3)),this.setAttribute("normal",new dt(r,3)),this.setAttribute("uv",new dt(o,2));function c(h){const u=i.length/3,d=h.extractPoints(t);let p=d.shape;const g=d.holes;Wn.isClockWise(p)===!1&&(p=p.reverse());for(let f=0,v=g.length;f<v;f++){const w=g[f];Wn.isClockWise(w)===!0&&(g[f]=w.reverse())}const m=Wn.triangulateShape(p,g);for(let f=0,v=g.length;f<v;f++){const w=g[f];p=p.concat(w)}for(let f=0,v=p.length;f<v;f++){const w=p[f];i.push(w.x,w.y,0),r.push(0,0,1),o.push(w.x,w.y)}for(let f=0,v=m.length;f<v;f++){const w=m[f],E=w[0]+u,b=w[1]+u,T=w[2]+u;n.push(E,b,T),l+=3}}}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return l0(t,e)}static fromJSON(e,t){const n=[];for(let i=0,r=e.shapes.length;i<r;i++){const o=t[e.shapes[i]];n.push(o)}return new pa(n,e.curveSegments)}}function l0(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,n=s.length;t<n;t++){const i=s[t];e.shapes.push(i.uuid)}else e.shapes.push(s.uuid);return e}class Ts extends st{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new S,d=new S,p=[],g=[],m=[],f=[];for(let v=0;v<=n;v++){const w=[],E=v/n;let b=0;v==0&&o==0?b=.5/t:v==n&&l==Math.PI&&(b=-.5/t);for(let T=0;T<=t;T++){const L=T/t;u.x=-e*Math.cos(i+L*r)*Math.sin(o+E*a),u.y=e*Math.cos(o+E*a),u.z=e*Math.sin(i+L*r)*Math.sin(o+E*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),f.push(L+b,1-E),w.push(c++)}h.push(w)}for(let v=0;v<n;v++)for(let w=0;w<t;w++){const E=h[v][w+1],b=h[v][w],T=h[v+1][w],L=h[v+1][w+1];(v!==0||o>0)&&p.push(E,b,L),(v!==n-1||l<Math.PI)&&p.push(b,T,L)}this.setIndex(p),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(m,3)),this.setAttribute("uv",new dt(f,2))}static fromJSON(e){return new Ts(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class kc extends xt{constructor(e){super(),this.type="ShadowMaterial",this.color=new xe(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}}kc.prototype.isShadowMaterial=!0;class Wc extends Wt{constructor(e){super(e),this.type="RawShaderMaterial"}}Wc.prototype.isRawShaderMaterial=!0;class ma extends xt{constructor(e){super(),this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qi,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}ma.prototype.isMeshStandardMaterial=!0;class qc extends ma{constructor(e){super(),this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Q(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Rt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.sheenColor=new xe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=0,this.attenuationColor=new xe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new xe(1,1,1),this.specularColorMap=null,this._sheen=0,this._clearcoat=0,this._transmission=0,this.setValues(e)}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}qc.prototype.isMeshPhysicalMaterial=!0;class Xc extends xt{constructor(e){super(),this.type="MeshPhongMaterial",this.color=new xe(16777215),this.specular=new xe(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qi,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Ls,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}Xc.prototype.isMeshPhongMaterial=!0;class jc extends xt{constructor(e){super(),this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new xe(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qi,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}jc.prototype.isMeshToonMaterial=!0;class Jc extends xt{constructor(e){super(),this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qi,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}Jc.prototype.isMeshNormalMaterial=!0;class Yc extends xt{constructor(e){super(),this.type="MeshLambertMaterial",this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Ls,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}Yc.prototype.isMeshLambertMaterial=!0;class Zc extends xt{constructor(e){super(),this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new xe(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qi,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={MATCAP:""},this.color.copy(e.color),this.matcap=e.matcap,this.map=e.map,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.flatShading=e.flatShading,this.fog=e.fog,this}}Zc.prototype.isMeshMatcapMaterial=!0;class $c extends Yi{constructor(e){super(),this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}}$c.prototype.isLineDashedMaterial=!0;const c0={ShadowMaterial:kc,SpriteMaterial:oa,RawShaderMaterial:Wc,ShaderMaterial:Wt,PointsMaterial:ca,MeshPhysicalMaterial:qc,MeshStandardMaterial:ma,MeshPhongMaterial:Xc,MeshToonMaterial:jc,MeshNormalMaterial:Jc,MeshLambertMaterial:Yc,MeshDepthMaterial:ra,MeshDistanceMaterial:sa,MeshBasicMaterial:Is,MeshMatcapMaterial:Zc,LineDashedMaterial:$c,LineBasicMaterial:Yi,Material:xt};xt.fromType=function(s){return new c0[s]};const at={arraySlice:function(s,e,t){return at.isTypedArray(s)?new s.constructor(s.subarray(e,t!==void 0?t:s.length)):s.slice(e,t)},convertArray:function(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)},isTypedArray:function(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)},getKeyframeOrder:function(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n},sortedArray:function(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i},flattenJSON:function(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)},subclip:function(s,e,t,n,i=30){const r=s.clone();r.name=e;const o=[];for(let l=0;l<r.tracks.length;++l){const c=r.tracks[l],h=c.getValueSize(),u=[],d=[];for(let p=0;p<c.times.length;++p){const g=c.times[p]*i;if(!(g<t||g>=n)){u.push(c.times[p]);for(let m=0;m<h;++m)d.push(c.values[p*h+m])}}u.length!==0&&(c.times=at.convertArray(u,c.times.constructor),c.values=at.convertArray(d,c.values.constructor),o.push(c))}r.tracks=o;let a=1/0;for(let l=0;l<r.tracks.length;++l)a>r.tracks[l].times[0]&&(a=r.tracks[l].times[0]);for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*a);return r.resetDuration(),r},makeClipAdditive:function(s,e=0,t=s,n=30){n<=0&&(n=30);const i=t.tracks.length,r=e/n;for(let o=0;o<i;++o){const a=t.tracks[o],l=a.ValueTypeName;if(l==="bool"||l==="string")continue;const c=s.tracks.find(function(v){return v.name===a.name&&v.ValueTypeName===l});if(c===void 0)continue;let h=0;const u=a.getValueSize();a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(h=u/3);let d=0;const p=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(d=p/3);const g=a.times.length-1;let m;if(r<=a.times[0]){const v=h,w=u-h;m=at.arraySlice(a.values,v,w)}else if(r>=a.times[g]){const v=g*u+h,w=v+u-h;m=at.arraySlice(a.values,v,w)}else{const v=a.createInterpolant(),w=h,E=u-h;v.evaluate(r),m=at.arraySlice(v.resultBuffer,w,E)}l==="quaternion"&&new kt().fromArray(m).normalize().conjugate().toArray(m);const f=c.times.length;for(let v=0;v<f;++v){const w=v*p+d;if(l==="quaternion")kt.multiplyQuaternionsFlat(c.values,w,m,0,c.values,w);else{const E=p-d*2;for(let b=0;b<E;++b)c.values[w+b]-=m[b]}}}return s.blendMode=mc,s}};class jn{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.afterEnd_(n-1,e,r)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.beforeStart_(0,e,i);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.beforeStart_(0,e,i);if(i===void 0)return n=t.length,this._cachedIndex=n,this.afterEnd_(n-1,r,e)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}jn.prototype.beforeStart_=jn.prototype.copySampleValue_;jn.prototype.afterEnd_=jn.prototype.copySampleValue_;class h0 extends jn{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ii,endingEnd:Ii}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ni:r=e,a=2*t-n;break;case ws:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ni:o=e,l=2*n-t;break;case ws:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(n-t)/(i-t),m=g*g,f=m*g,v=-d*f+2*d*m-d*g,w=(1+d)*f+(-1.5-2*d)*m+(-.5+d)*g+1,E=(-1-p)*f+(1.5+p)*m+.5*g,b=p*f-p*m;for(let T=0;T!==a;++T)r[T]=v*o[h+T]+w*o[c+T]+E*o[l+T]+b*o[u+T];return r}}class Kc extends jn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}}class u0 extends jn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class xn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=at.convertArray(t,this.TimeBufferType),this.values=at.convertArray(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:at.convertArray(e.times,Array),values:at.convertArray(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new u0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Kc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new h0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case bs:t=this.InterpolantFactoryMethodDiscrete;break;case Ms:t=this.InterpolantFactoryMethodLinear;break;case Zs:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return bs;case this.InterpolantFactoryMethodLinear:return Ms;case this.InterpolantFactoryMethodSmooth:return Zs}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=at.arraySlice(n,r,o),this.values=at.arraySlice(this.values,r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&at.isTypedArray(i))for(let a=0,l=i.length;a!==l;++a){const c=i[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=at.arraySlice(this.times),t=at.arraySlice(this.values),n=this.getValueSize(),i=this.getInterpolation()===Zs,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(i)l=!0;else{const u=a*n,d=u-n,p=u+n;for(let g=0;g!==n;++g){const m=t[u+g];if(m!==t[d+g]||m!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*n,d=o*n;for(let p=0;p!==n;++p)t[d+p]=t[u+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=at.arraySlice(e,0,o),this.values=at.arraySlice(t,0,o*n)):(this.times=e,this.values=t),this}clone(){const e=at.arraySlice(this.times,0),t=at.arraySlice(this.values,0),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}xn.prototype.TimeBufferType=Float32Array;xn.prototype.ValueBufferType=Float32Array;xn.prototype.DefaultInterpolation=Ms;class $i extends xn{}$i.prototype.ValueTypeName="bool";$i.prototype.ValueBufferType=Array;$i.prototype.DefaultInterpolation=bs;$i.prototype.InterpolantFactoryMethodLinear=void 0;$i.prototype.InterpolantFactoryMethodSmooth=void 0;class Qc extends xn{}Qc.prototype.ValueTypeName="color";class As extends xn{}As.prototype.ValueTypeName="number";class d0 extends jn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t);let c=e*a;for(let h=c+a;c!==h;c+=4)kt.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Rr extends xn{InterpolantFactoryMethodLinear(e){return new d0(this.times,this.values,this.getValueSize(),e)}}Rr.prototype.ValueTypeName="quaternion";Rr.prototype.DefaultInterpolation=Ms;Rr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ki extends xn{}Ki.prototype.ValueTypeName="string";Ki.prototype.ValueBufferType=Array;Ki.prototype.DefaultInterpolation=bs;Ki.prototype.InterpolantFactoryMethodLinear=void 0;Ki.prototype.InterpolantFactoryMethodSmooth=void 0;class Cs extends xn{}Cs.prototype.ValueTypeName="vector";class nc{constructor(e,t=-1,n,i=$o){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=gn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(p0(n[o]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(xn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=at.getKeyframeOrder(l);l=at.sortedArray(l,1,h),c=at.sortedArray(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new As(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,p,g,m){if(p.length!==0){const f=[],v=[];at.flattenJSON(p,f,v,g),f.length!==0&&m.push(new u(d,f,v))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const p={};let g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let m=0;m<d[g].morphTargets.length;m++)p[d[g].morphTargets[m]]=-1;for(const m in p){const f=[],v=[];for(let w=0;w!==d[g].morphTargets.length;++w){const E=d[g];f.push(E.time),v.push(E.morphTarget===m?1:0)}i.push(new As(".morphTargetInfluence["+m+"]",f,v))}l=p.length*o}else{const p=".bones["+t[u].name+"]";n(Cs,p+".position",d,"pos",i),n(Rr,p+".quaternion",d,"rot",i),n(Cs,p+".scale",d,"scl",i)}}return i.length===0?null:new this(r,l,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function f0(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return As;case"vector":case"vector2":case"vector3":case"vector4":return Cs;case"color":return Qc;case"quaternion":return Rr;case"bool":case"boolean":return $i;case"string":return Ki}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function p0(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=f0(s.type);if(s.times===void 0){const t=[],n=[];at.flattenJSON(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const Wi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class m0{constructor(e,t,n){const i=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null}}}const g0=new m0;class Jn{constructor(e){this.manager=e!==void 0?e:g0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}const Cn={};class v0 extends Jn{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Wi.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Cn[e]!==void 0){Cn[e].push({onLoad:t,onProgress:n,onError:i});return}Cn[e]=[],Cn[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=Cn[e],u=c.body.getReader(),d=c.headers.get("Content-Length"),p=d?parseInt(d):0,g=p!==0;let m=0;const f=new ReadableStream({start(v){w();function w(){u.read().then(({done:E,value:b})=>{if(E)v.close();else{m+=b.byteLength;const T=new ProgressEvent("progress",{lengthComputable:g,loaded:m,total:p});for(let L=0,I=h.length;L<I;L++){const y=h[L];y.onProgress&&y.onProgress(T)}v.enqueue(b),w()}})}}});return new Response(f)}else throw Error(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,p=new TextDecoder(d);return c.arrayBuffer().then(g=>p.decode(g))}}}).then(c=>{Wi.add(e,c);const h=Cn[e];delete Cn[e];for(let u=0,d=h.length;u<d;u++){const p=h[u];p.onLoad&&p.onLoad(c)}}).catch(c=>{const h=Cn[e];if(h===void 0)throw this.manager.itemError(e),c;delete Cn[e];for(let u=0,d=h.length;u<d;u++){const p=h[u];p.onError&&p.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class eh extends Jn{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Wi.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=Mr("img");function l(){h(),Wi.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class x0 extends Jn{constructor(e){super(e)}load(e,t,n,i){const r=new Ns,o=new eh(this.manager);o.setCrossOrigin(this.crossOrigin),o.setPath(this.path);let a=0;function l(c){o.load(e[c],function(h){r.images[c]=h,a++,a===6&&(r.needsUpdate=!0,t&&t(r))},void 0,i)}for(let c=0;c<e.length;++c)l(c);return r}}class _0 extends Jn{constructor(e){super(e)}load(e,t,n,i){const r=new Mt,o=new eh(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class vn extends et{constructor(e,t=1){super(),this.type="Light",this.color=new xe(e),this.intensity=t}dispose(){}copy(e){return super.copy(e),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}vn.prototype.isLight=!0;class th extends vn{constructor(e,t,n){super(e,n),this.type="HemisphereLight",this.position.copy(et.DefaultUp),this.updateMatrix(),this.groundColor=new xe(t)}copy(e){return vn.prototype.copy.call(this,e),this.groundColor.copy(e.groundColor),this}}th.prototype.isHemisphereLight=!0;const ic=new Ce,rc=new S,sc=new S;class ga{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.map=null,this.mapPass=null,this.matrix=new Ce,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fs,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;rc.setFromMatrixPosition(e.matrixWorld),t.position.copy(rc),sc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(sc),t.updateMatrixWorld(),ic.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ic),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(t.projectionMatrix),n.multiply(t.matrixWorldInverse)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class nh extends ga{constructor(){super(new Ft(50,1,.5,500)),this.focus=1}updateMatrices(e){const t=this.camera,n=Go*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}nh.prototype.isSpotLightShadow=!0;class y0 extends vn{constructor(e,t,n=0,i=Math.PI/3,r=0,o=1){super(e,t),this.type="SpotLight",this.position.copy(et.DefaultUp),this.updateMatrix(),this.target=new et,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.shadow=new nh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}y0.prototype.isSpotLight=!0;const oc=new Ce,dr=new S,Do=new S;class ih extends ga{constructor(){super(new Ft(90,1,.5,500)),this._frameExtents=new Q(4,2),this._viewportCount=6,this._viewports=[new nt(2,1,1,1),new nt(0,1,1,1),new nt(3,1,1,1),new nt(1,1,1,1),new nt(3,0,1,1),new nt(1,0,1,1)],this._cubeDirections=[new S(1,0,0),new S(-1,0,0),new S(0,0,1),new S(0,0,-1),new S(0,1,0),new S(0,-1,0)],this._cubeUps=[new S(0,1,0),new S(0,1,0),new S(0,1,0),new S(0,1,0),new S(0,0,1),new S(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),dr.setFromMatrixPosition(e.matrixWorld),n.position.copy(dr),Do.copy(n.position),Do.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Do),n.updateMatrixWorld(),i.makeTranslation(-dr.x,-dr.y,-dr.z),oc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(oc)}}ih.prototype.isPointLightShadow=!0;class b0 extends vn{constructor(e,t,n=0,i=1){super(e,t),this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new ih}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}b0.prototype.isPointLight=!0;class rh extends ga{constructor(){super(new na(-5,5,5,-5,.5,500))}}rh.prototype.isDirectionalLightShadow=!0;class M0 extends vn{constructor(e,t){super(e,t),this.type="DirectionalLight",this.position.copy(et.DefaultUp),this.updateMatrix(),this.target=new et,this.shadow=new rh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}M0.prototype.isDirectionalLight=!0;class w0 extends vn{constructor(e,t){super(e,t),this.type="AmbientLight"}}w0.prototype.isAmbientLight=!0;class S0 extends vn{constructor(e,t,n=10,i=10){super(e,t),this.type="RectAreaLight",this.width=n,this.height=i}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){const t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}}S0.prototype.isRectAreaLight=!0;class sh{constructor(){this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new S)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){const n=e.x,i=e.y,r=e.z,o=this.coefficients;return t.copy(o[0]).multiplyScalar(.282095),t.addScaledVector(o[1],.488603*i),t.addScaledVector(o[2],.488603*r),t.addScaledVector(o[3],.488603*n),t.addScaledVector(o[4],1.092548*(n*i)),t.addScaledVector(o[5],1.092548*(i*r)),t.addScaledVector(o[6],.315392*(3*r*r-1)),t.addScaledVector(o[7],1.092548*(n*r)),t.addScaledVector(o[8],.546274*(n*n-i*i)),t}getIrradianceAt(e,t){const n=e.x,i=e.y,r=e.z,o=this.coefficients;return t.copy(o[0]).multiplyScalar(.886227),t.addScaledVector(o[1],2*.511664*i),t.addScaledVector(o[2],2*.511664*r),t.addScaledVector(o[3],2*.511664*n),t.addScaledVector(o[4],2*.429043*n*i),t.addScaledVector(o[5],2*.429043*i*r),t.addScaledVector(o[6],.743125*r*r-.247708),t.addScaledVector(o[7],2*.429043*n*r),t.addScaledVector(o[8],.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+i*3);return this}toArray(e=[],t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+i*3);return e}static getBasisAt(e,t){const n=e.x,i=e.y,r=e.z;t[0]=.282095,t[1]=.488603*i,t[2]=.488603*r,t[3]=.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*r,t[6]=.315392*(3*r*r-1),t[7]=1.092548*n*r,t[8]=.546274*(n*n-i*i)}}sh.prototype.isSphericalHarmonics3=!0;class va extends vn{constructor(e=new sh,t=1){super(void 0,t),this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){const t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}}va.prototype.isLightProbe=!0;class E0{static decodeText(e){if(typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class T0 extends st{constructor(){super(),this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}clone(){return new this.constructor().copy(this)}toJSON(){const e=super.toJSON(this);return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}T0.prototype.isInstancedBufferGeometry=!0;class A0 extends Jn{constructor(e){super(e),typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Wi.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){Wi.add(e,l),t&&t(l),r.manager.itemEnd(e)}).catch(function(l){i&&i(l),r.manager.itemError(e),r.manager.itemEnd(e)}),r.manager.itemStart(e)}}A0.prototype.isImageBitmapLoader=!0;let gs;const C0={getContext:function(){return gs===void 0&&(gs=new(window.AudioContext||window.webkitAudioContext)),gs},setContext:function(s){gs=s}};class L0 extends Jn{constructor(e){super(e)}load(e,t,n,i){const r=this,o=new v0(this.manager);o.setResponseType("arraybuffer"),o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{const l=a.slice(0);C0.getContext().decodeAudioData(l,function(h){t(h)})}catch(l){i?i(l):console.error(l),r.manager.itemError(e)}},n,i)}}class R0 extends va{constructor(e,t,n=1){super(void 0,n);const i=new xe().set(e),r=new xe().set(t),o=new S(i.r,i.g,i.b),a=new S(r.r,r.g,r.b),l=Math.sqrt(Math.PI),c=l*Math.sqrt(.75);this.sh.coefficients[0].copy(o).add(a).multiplyScalar(l),this.sh.coefficients[1].copy(o).sub(a).multiplyScalar(c)}}R0.prototype.isHemisphereLightProbe=!0;class P0 extends va{constructor(e,t=1){super(void 0,t);const n=new xe().set(e);this.sh.coefficients[0].set(n.r,n.g,n.b).multiplyScalar(2*Math.sqrt(Math.PI))}}P0.prototype.isAmbientLightProbe=!0;class D0 extends et{constructor(e){super(),this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType="buffer",this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){console.warn("THREE.Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;const t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this._progress=0,this.source.stop(),this.source.onended=null,this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){if(this.detune=e,this.source.detune!==void 0)return this.isPlaying===!0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1}getLoop(){return this.hasPlaybackControl===!1?(console.warn("THREE.Audio: this Audio has no playback control."),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}}class I0{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;const a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){a.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){kt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const o=this._workIndex*r;kt.multiplyQuaternionsFlat(e,o,e,t,e,n),kt.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){const o=1-i;for(let a=0;a!==r;++a){const l=t+a;e[l]=e[l]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){const a=t+o;e[a]=e[a]+e[n+o]*i}}}const xa="\\[\\]\\.:\\/",N0=new RegExp("["+xa+"]","g"),_a="[^"+xa+"]",F0="[^"+xa.replace("\\.","")+"]",z0=/((?:WC+[\/:])*)/.source.replace("WC",_a),B0=/(WCOD+)?/.source.replace("WCOD",F0),U0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",_a),O0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",_a),H0=new RegExp("^"+z0+B0+U0+O0+"$"),V0=["material","materials","bones"];class G0{constructor(e,t,n){const i=n||Qe.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Qe{constructor(e,t,n){this.path=t,this.parsedPath=n||Qe.parseTrackName(t),this.node=Qe.findNode(e,this.parsedPath.nodeName)||e,this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Qe.Composite(e,t,n):new Qe(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(N0,"")}static parseTrackName(e){const t=H0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);V0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=Qe.findNode(this.rootNode,t.nodeName)||this.rootNode,this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.error("THREE.PropertyBinding: Trying to update node for track: "+this.path+" but it wasn't found.");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[i];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(e.geometry.isBufferGeometry){if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}else{console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences on THREE.Geometry. Use THREE.BufferGeometry instead.",this);return}}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Qe.Composite=G0;Qe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Qe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Qe.prototype.GetterByBindingType=[Qe.prototype._getValue_direct,Qe.prototype._getValue_array,Qe.prototype._getValue_arrayElement,Qe.prototype._getValue_toArray];Qe.prototype.SetterByBindingTypeAndVersioning=[[Qe.prototype._setValue_direct,Qe.prototype._setValue_direct_setNeedsUpdate,Qe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Qe.prototype._setValue_array,Qe.prototype._setValue_array_setNeedsUpdate,Qe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Qe.prototype._setValue_arrayElement,Qe.prototype._setValue_arrayElement_setNeedsUpdate,Qe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Qe.prototype._setValue_fromArray,Qe.prototype._setValue_fromArray_setNeedsUpdate,Qe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class k0{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,o=r.length,a=new Array(o),l={endingStart:Ii,endingEnd:Ii};for(let c=0;c!==o;++c){const h=r[c].createInterpolant(null);a[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Au,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,o=this.timeScale;let a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);const l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/o,c[1]=t/o,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const l=(e-r)*n;if(l<0||n===0)return;this._startTime=null,t=n*l}t*=this._updateTimeScale(e);const o=this._updateTime(t),a=this._updateWeight(e);if(a>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case mc:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(o),c[h].accumulateAdditive(a);break;case $o:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(o),c[h].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const o=n===Cu;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===Tu){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){const a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);const l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=Ni,i.endingEnd=Ni):(e?i.endingStart=this.zeroSlopeAtStart?Ni:Ii:i.endingStart=ws,t?i.endingEnd=this.zeroSlopeAtEnd?Ni:Ii:i.endingEnd=ws)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);const a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=n,this}}class W0 extends ci{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){const d=i[u],p=d.name;let g=h[p];if(g!==void 0)++g.referenceCount,o[u]=g;else{if(g=o[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,p));continue}const m=t&&t._propertyBindings[u].binding.parsedPath;g=new I0(Qe.create(n,p,m),d.ValueTypeName,d.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,p),o[u]=g}a[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{const a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=a.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Kc(new Float32Array(2),new Float32Array(2),1,this._controlInterpolantsResultBuffer),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let o=typeof e=="string"?nc.findByName(i,e):e;const a=o!==null?o.uuid:e,l=this._actionsByClip[a];let c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=$o),l!==void 0){const u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;const h=new k0(this,o,t,n);return this._bindAction(h,c),this._addInactiveAction(h,a,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?nc.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,o);const a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){const c=o[a];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const o in n){const a=n[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(const o in r){const a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}W0.prototype._controlInterpolantsResultBuffer=new Float32Array(1);class q0 extends Cr{constructor(e,t,n=1){super(e,t),this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){const t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){const t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}}q0.prototype.isInstancedInterleavedBuffer=!0;const Hn=new S,vs=new Ce,Io=new Ce;class X0 extends la{constructor(e){const t=oh(e),n=new st,i=[],r=[],o=new xe(0,0,1),a=new xe(0,1,0);for(let c=0;c<t.length;c++){const h=t[c];h.parent&&h.parent.isBone&&(i.push(0,0,0),i.push(0,0,0),r.push(o.r,o.g,o.b),r.push(a.r,a.g,a.b))}n.setAttribute("position",new dt(i,3)),n.setAttribute("color",new dt(r,3));const l=new Yi({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(n,l),this.type="SkeletonHelper",this.isSkeletonHelper=!0,this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1}updateMatrixWorld(e){const t=this.bones,n=this.geometry,i=n.getAttribute("position");Io.copy(this.root.matrixWorld).invert();for(let r=0,o=0;r<t.length;r++){const a=t[r];a.parent&&a.parent.isBone&&(vs.multiplyMatrices(Io,a.matrixWorld),Hn.setFromMatrixPosition(vs),i.setXYZ(o,Hn.x,Hn.y,Hn.z),vs.multiplyMatrices(Io,a.parent.matrixWorld),Hn.setFromMatrixPosition(vs),i.setXYZ(o+1,Hn.x,Hn.y,Hn.z),o+=2)}n.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(e)}}function oh(s){const e=[];s.isBone===!0&&e.push(s);for(let t=0;t<s.children.length;t++)e.push.apply(e,oh(s.children[t]));return e}class j0 extends la{constructor(e=10,t=10,n=4473924,i=8947848){n=new xe(n),i=new xe(i);const r=t/2,o=e/t,a=e/2,l=[],c=[];for(let d=0,p=0,g=-a;d<=t;d++,g+=o){l.push(-a,0,g,a,0,g),l.push(g,0,-a,g,0,a);const m=d===r?n:i;m.toArray(c,p),p+=3,m.toArray(c,p),p+=3,m.toArray(c,p),p+=3,m.toArray(c,p),p+=3}const h=new st;h.setAttribute("position",new dt(l,3)),h.setAttribute("color",new dt(c,3));const u=new Yi({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}}const fn=new Uint32Array(512),pn=new Uint32Array(512);for(let s=0;s<256;++s){const e=s-127;e<-27?(fn[s]=0,fn[s|256]=32768,pn[s]=24,pn[s|256]=24):e<-14?(fn[s]=1024>>-e-14,fn[s|256]=1024>>-e-14|32768,pn[s]=-e-1,pn[s|256]=-e-1):e<=15?(fn[s]=e+15<<10,fn[s|256]=e+15<<10|32768,pn[s]=13,pn[s|256]=13):e<128?(fn[s]=31744,fn[s|256]=64512,pn[s]=24,pn[s|256]=24):(fn[s]=31744,fn[s|256]=64512,pn[s]=13,pn[s|256]=13)}const ah=new Uint32Array(2048),Pr=new Uint32Array(64),J0=new Uint32Array(64);for(let s=1;s<1024;++s){let e=s<<13,t=0;for(;!(e&8388608);)e<<=1,t-=8388608;e&=-8388609,t+=947912704,ah[s]=e|t}for(let s=1024;s<2048;++s)ah[s]=939524096+(s-1024<<13);for(let s=1;s<31;++s)Pr[s]=s<<23;Pr[31]=1199570944;Pr[32]=2147483648;for(let s=33;s<63;++s)Pr[s]=2147483648+(s-32<<23);Pr[63]=3347054592;for(let s=1;s<64;++s)s!==32&&(J0[s]=1024);Qt.create=function(s,e){return console.log("THREE.Curve.create() has been deprecated"),s.prototype=Object.create(Qt.prototype),s.prototype.constructor=s,s.prototype.getPoint=e,s};jo.prototype.fromPoints=function(s){return console.warn("THREE.Path: .fromPoints() has been renamed to .setFromPoints()."),this.setFromPoints(s)};j0.prototype.setColors=function(){console.error("THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.")};X0.prototype.update=function(){console.error("THREE.SkeletonHelper: update() no longer needs to be called.")};Jn.prototype.extractUrlBase=function(s){return console.warn("THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead."),E0.extractUrlBase(s)};Jn.Handlers={add:function(){console.error("THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead.")},get:function(){console.error("THREE.Loader: Handlers.get() has been removed. Use LoadingManager.getHandler() instead.")}};cn.prototype.center=function(s){return console.warn("THREE.Box3: .center() has been renamed to .getCenter()."),this.getCenter(s)};cn.prototype.empty=function(){return console.warn("THREE.Box3: .empty() has been renamed to .isEmpty()."),this.isEmpty()};cn.prototype.isIntersectionBox=function(s){return console.warn("THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox()."),this.intersectsBox(s)};cn.prototype.isIntersectionSphere=function(s){return console.warn("THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere()."),this.intersectsSphere(s)};cn.prototype.size=function(s){return console.warn("THREE.Box3: .size() has been renamed to .getSize()."),this.getSize(s)};ui.prototype.toVector3=function(){console.error("THREE.Euler: .toVector3() has been removed. Use Vector3.setFromEuler() instead")};Xi.prototype.empty=function(){return console.warn("THREE.Sphere: .empty() has been renamed to .isEmpty()."),this.isEmpty()};Fs.prototype.setFromMatrix=function(s){return console.warn("THREE.Frustum: .setFromMatrix() has been renamed to .setFromProjectionMatrix()."),this.setFromProjectionMatrix(s)};Tt.prototype.flattenToArrayOffset=function(s,e){return console.warn("THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead."),this.toArray(s,e)};Tt.prototype.multiplyVector3=function(s){return console.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."),s.applyMatrix3(this)};Tt.prototype.multiplyVector3Array=function(){console.error("THREE.Matrix3: .multiplyVector3Array() has been removed.")};Tt.prototype.applyToBufferAttribute=function(s){return console.warn("THREE.Matrix3: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix3( matrix ) instead."),s.applyMatrix3(this)};Tt.prototype.applyToVector3Array=function(){console.error("THREE.Matrix3: .applyToVector3Array() has been removed.")};Tt.prototype.getInverse=function(s){return console.warn("THREE.Matrix3: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead."),this.copy(s).invert()};Ce.prototype.extractPosition=function(s){return console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."),this.copyPosition(s)};Ce.prototype.flattenToArrayOffset=function(s,e){return console.warn("THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead."),this.toArray(s,e)};Ce.prototype.getPosition=function(){return console.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead."),new S().setFromMatrixColumn(this,3)};Ce.prototype.setRotationFromQuaternion=function(s){return console.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."),this.makeRotationFromQuaternion(s)};Ce.prototype.multiplyToArray=function(){console.warn("THREE.Matrix4: .multiplyToArray() has been removed.")};Ce.prototype.multiplyVector3=function(s){return console.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)};Ce.prototype.multiplyVector4=function(s){return console.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)};Ce.prototype.multiplyVector3Array=function(){console.error("THREE.Matrix4: .multiplyVector3Array() has been removed.")};Ce.prototype.rotateAxis=function(s){console.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."),s.transformDirection(this)};Ce.prototype.crossVector=function(s){return console.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)};Ce.prototype.translate=function(){console.error("THREE.Matrix4: .translate() has been removed.")};Ce.prototype.rotateX=function(){console.error("THREE.Matrix4: .rotateX() has been removed.")};Ce.prototype.rotateY=function(){console.error("THREE.Matrix4: .rotateY() has been removed.")};Ce.prototype.rotateZ=function(){console.error("THREE.Matrix4: .rotateZ() has been removed.")};Ce.prototype.rotateByAxis=function(){console.error("THREE.Matrix4: .rotateByAxis() has been removed.")};Ce.prototype.applyToBufferAttribute=function(s){return console.warn("THREE.Matrix4: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)};Ce.prototype.applyToVector3Array=function(){console.error("THREE.Matrix4: .applyToVector3Array() has been removed.")};Ce.prototype.makeFrustum=function(s,e,t,n,i,r){return console.warn("THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead."),this.makePerspective(s,e,n,t,i,r)};Ce.prototype.getInverse=function(s){return console.warn("THREE.Matrix4: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead."),this.copy(s).invert()};Rn.prototype.isIntersectionLine=function(s){return console.warn("THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine()."),this.intersectsLine(s)};kt.prototype.multiplyVector3=function(s){return console.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."),s.applyQuaternion(this)};kt.prototype.inverse=function(){return console.warn("THREE.Quaternion: .inverse() has been renamed to invert()."),this.invert()};ji.prototype.isIntersectionBox=function(s){return console.warn("THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox()."),this.intersectsBox(s)};ji.prototype.isIntersectionPlane=function(s){return console.warn("THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane()."),this.intersectsPlane(s)};ji.prototype.isIntersectionSphere=function(s){return console.warn("THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere()."),this.intersectsSphere(s)};gt.prototype.area=function(){return console.warn("THREE.Triangle: .area() has been renamed to .getArea()."),this.getArea()};gt.prototype.barycoordFromPoint=function(s,e){return console.warn("THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord()."),this.getBarycoord(s,e)};gt.prototype.midpoint=function(s){return console.warn("THREE.Triangle: .midpoint() has been renamed to .getMidpoint()."),this.getMidpoint(s)};gt.prototypenormal=function(s){return console.warn("THREE.Triangle: .normal() has been renamed to .getNormal()."),this.getNormal(s)};gt.prototype.plane=function(s){return console.warn("THREE.Triangle: .plane() has been renamed to .getPlane()."),this.getPlane(s)};gt.barycoordFromPoint=function(s,e,t,n,i){return console.warn("THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord()."),gt.getBarycoord(s,e,t,n,i)};gt.normal=function(s,e,t,n){return console.warn("THREE.Triangle: .normal() has been renamed to .getNormal()."),gt.getNormal(s,e,t,n)};Lr.prototype.extractAllPoints=function(s){return console.warn("THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead."),this.extractPoints(s)};Lr.prototype.extrude=function(s){return console.warn("THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead."),new Zi(this,s)};Lr.prototype.makeGeometry=function(s){return console.warn("THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead."),new pa(this,s)};Q.prototype.fromAttribute=function(s,e,t){return console.warn("THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute()."),this.fromBufferAttribute(s,e,t)};Q.prototype.distanceToManhattan=function(s){return console.warn("THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo()."),this.manhattanDistanceTo(s)};Q.prototype.lengthManhattan=function(){return console.warn("THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength()."),this.manhattanLength()};S.prototype.setEulerFromRotationMatrix=function(){console.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.")};S.prototype.setEulerFromQuaternion=function(){console.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.")};S.prototype.getPositionFromMatrix=function(s){return console.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."),this.setFromMatrixPosition(s)};S.prototype.getScaleFromMatrix=function(s){return console.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."),this.setFromMatrixScale(s)};S.prototype.getColumnFromMatrix=function(s,e){return console.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."),this.setFromMatrixColumn(e,s)};S.prototype.applyProjection=function(s){return console.warn("THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead."),this.applyMatrix4(s)};S.prototype.fromAttribute=function(s,e,t){return console.warn("THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute()."),this.fromBufferAttribute(s,e,t)};S.prototype.distanceToManhattan=function(s){return console.warn("THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo()."),this.manhattanDistanceTo(s)};S.prototype.lengthManhattan=function(){return console.warn("THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength()."),this.manhattanLength()};nt.prototype.fromAttribute=function(s,e,t){return console.warn("THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute()."),this.fromBufferAttribute(s,e,t)};nt.prototype.lengthManhattan=function(){return console.warn("THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength()."),this.manhattanLength()};et.prototype.getChildByName=function(s){return console.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."),this.getObjectByName(s)};et.prototype.renderDepth=function(){console.warn("THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.")};et.prototype.translate=function(s,e){return console.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."),this.translateOnAxis(e,s)};et.prototype.getWorldRotation=function(){console.error("THREE.Object3D: .getWorldRotation() has been removed. Use THREE.Object3D.getWorldQuaternion( target ) instead.")};et.prototype.applyMatrix=function(s){return console.warn("THREE.Object3D: .applyMatrix() has been renamed to .applyMatrix4()."),this.applyMatrix4(s)};Object.defineProperties(et.prototype,{eulerOrder:{get:function(){return console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."),this.rotation.order},set:function(s){console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."),this.rotation.order=s}},useQuaternion:{get:function(){console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")},set:function(){console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")}}});At.prototype.setDrawMode=function(){console.error("THREE.Mesh: .setDrawMode() has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.")};Object.defineProperties(At.prototype,{drawMode:{get:function(){return console.error("THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode."),Lu},set:function(){console.error("THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.")}}});Nc.prototype.initBones=function(){console.error("THREE.SkinnedMesh: initBones() has been removed.")};Ft.prototype.setLens=function(s,e){console.warn("THREE.PerspectiveCamera.setLens is deprecated. Use .setFocalLength and .filmGauge for a photographic setup."),e!==void 0&&(this.filmGauge=e),this.setFocalLength(s)};Object.defineProperties(vn.prototype,{onlyShadow:{set:function(){console.warn("THREE.Light: .onlyShadow has been removed.")}},shadowCameraFov:{set:function(s){console.warn("THREE.Light: .shadowCameraFov is now .shadow.camera.fov."),this.shadow.camera.fov=s}},shadowCameraLeft:{set:function(s){console.warn("THREE.Light: .shadowCameraLeft is now .shadow.camera.left."),this.shadow.camera.left=s}},shadowCameraRight:{set:function(s){console.warn("THREE.Light: .shadowCameraRight is now .shadow.camera.right."),this.shadow.camera.right=s}},shadowCameraTop:{set:function(s){console.warn("THREE.Light: .shadowCameraTop is now .shadow.camera.top."),this.shadow.camera.top=s}},shadowCameraBottom:{set:function(s){console.warn("THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom."),this.shadow.camera.bottom=s}},shadowCameraNear:{set:function(s){console.warn("THREE.Light: .shadowCameraNear is now .shadow.camera.near."),this.shadow.camera.near=s}},shadowCameraFar:{set:function(s){console.warn("THREE.Light: .shadowCameraFar is now .shadow.camera.far."),this.shadow.camera.far=s}},shadowCameraVisible:{set:function(){console.warn("THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead.")}},shadowBias:{set:function(s){console.warn("THREE.Light: .shadowBias is now .shadow.bias."),this.shadow.bias=s}},shadowDarkness:{set:function(){console.warn("THREE.Light: .shadowDarkness has been removed.")}},shadowMapWidth:{set:function(s){console.warn("THREE.Light: .shadowMapWidth is now .shadow.mapSize.width."),this.shadow.mapSize.width=s}},shadowMapHeight:{set:function(s){console.warn("THREE.Light: .shadowMapHeight is now .shadow.mapSize.height."),this.shadow.mapSize.height=s}}});Object.defineProperties(vt.prototype,{length:{get:function(){return console.warn("THREE.BufferAttribute: .length has been deprecated. Use .count instead."),this.array.length}},dynamic:{get:function(){return console.warn("THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead."),this.usage===Ss},set:function(){console.warn("THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead."),this.setUsage(Ss)}}});vt.prototype.setDynamic=function(s){return console.warn("THREE.BufferAttribute: .setDynamic() has been deprecated. Use .setUsage() instead."),this.setUsage(s===!0?Ss:br),this};vt.prototype.copyIndicesArray=function(){console.error("THREE.BufferAttribute: .copyIndicesArray() has been removed.")},vt.prototype.setArray=function(){console.error("THREE.BufferAttribute: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers")};st.prototype.addIndex=function(s){console.warn("THREE.BufferGeometry: .addIndex() has been renamed to .setIndex()."),this.setIndex(s)};st.prototype.addAttribute=function(s,e){return console.warn("THREE.BufferGeometry: .addAttribute() has been renamed to .setAttribute()."),!(e&&e.isBufferAttribute)&&!(e&&e.isInterleavedBufferAttribute)?(console.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."),this.setAttribute(s,new vt(arguments[1],arguments[2]))):s==="index"?(console.warn("THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."),this.setIndex(e),this):this.setAttribute(s,e)};st.prototype.addDrawCall=function(s,e,t){t!==void 0&&console.warn("THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset."),console.warn("THREE.BufferGeometry: .addDrawCall() is now .addGroup()."),this.addGroup(s,e)};st.prototype.clearDrawCalls=function(){console.warn("THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups()."),this.clearGroups()};st.prototype.computeOffsets=function(){console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.")};st.prototype.removeAttribute=function(s){return console.warn("THREE.BufferGeometry: .removeAttribute() has been renamed to .deleteAttribute()."),this.deleteAttribute(s)};st.prototype.applyMatrix=function(s){return console.warn("THREE.BufferGeometry: .applyMatrix() has been renamed to .applyMatrix4()."),this.applyMatrix4(s)};Object.defineProperties(st.prototype,{drawcalls:{get:function(){return console.error("THREE.BufferGeometry: .drawcalls has been renamed to .groups."),this.groups}},offsets:{get:function(){return console.warn("THREE.BufferGeometry: .offsets has been renamed to .groups."),this.groups}}});Cr.prototype.setDynamic=function(s){return console.warn("THREE.InterleavedBuffer: .setDynamic() has been deprecated. Use .setUsage() instead."),this.setUsage(s===!0?Ss:br),this};Cr.prototype.setArray=function(){console.error("THREE.InterleavedBuffer: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers")};Zi.prototype.getArrays=function(){console.error("THREE.ExtrudeGeometry: .getArrays() has been removed.")};Zi.prototype.addShapeList=function(){console.error("THREE.ExtrudeGeometry: .addShapeList() has been removed.")};Zi.prototype.addShape=function(){console.error("THREE.ExtrudeGeometry: .addShape() has been removed.")};Es.prototype.dispose=function(){console.error("THREE.Scene: .dispose() has been removed.")};Object.defineProperties(xt.prototype,{wrapAround:{get:function(){console.warn("THREE.Material: .wrapAround has been removed.")},set:function(){console.warn("THREE.Material: .wrapAround has been removed.")}},overdraw:{get:function(){console.warn("THREE.Material: .overdraw has been removed.")},set:function(){console.warn("THREE.Material: .overdraw has been removed.")}},wrapRGB:{get:function(){return console.warn("THREE.Material: .wrapRGB has been removed."),new xe}},shading:{get:function(){console.error("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead.")},set:function(s){console.warn("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead."),this.flatShading=s===uc}},stencilMask:{get:function(){return console.warn("THREE."+this.type+": .stencilMask has been removed. Use .stencilFuncMask instead."),this.stencilFuncMask},set:function(s){console.warn("THREE."+this.type+": .stencilMask has been removed. Use .stencilFuncMask instead."),this.stencilFuncMask=s}},vertexTangents:{get:function(){console.warn("THREE."+this.type+": .vertexTangents has been removed.")},set:function(){console.warn("THREE."+this.type+": .vertexTangents has been removed.")}}});Object.defineProperties(Wt.prototype,{derivatives:{get:function(){return console.warn("THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives."),this.extensions.derivatives},set:function(s){console.warn("THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives."),this.extensions.derivatives=s}}});tt.prototype.clearTarget=function(s,e,t,n){console.warn("THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead."),this.setRenderTarget(s),this.clear(e,t,n)};tt.prototype.animate=function(s){console.warn("THREE.WebGLRenderer: .animate() is now .setAnimationLoop()."),this.setAnimationLoop(s)};tt.prototype.getCurrentRenderTarget=function(){return console.warn("THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget()."),this.getRenderTarget()};tt.prototype.getMaxAnisotropy=function(){return console.warn("THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy()."),this.capabilities.getMaxAnisotropy()};tt.prototype.getPrecision=function(){return console.warn("THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision."),this.capabilities.precision};tt.prototype.resetGLState=function(){return console.warn("THREE.WebGLRenderer: .resetGLState() is now .state.reset()."),this.state.reset()};tt.prototype.supportsFloatTextures=function(){return console.warn("THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' )."),this.extensions.get("OES_texture_float")};tt.prototype.supportsHalfFloatTextures=function(){return console.warn("THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' )."),this.extensions.get("OES_texture_half_float")};tt.prototype.supportsStandardDerivatives=function(){return console.warn("THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' )."),this.extensions.get("OES_standard_derivatives")};tt.prototype.supportsCompressedTextureS3TC=function(){return console.warn("THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' )."),this.extensions.get("WEBGL_compressed_texture_s3tc")};tt.prototype.supportsCompressedTexturePVRTC=function(){return console.warn("THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' )."),this.extensions.get("WEBGL_compressed_texture_pvrtc")};tt.prototype.supportsBlendMinMax=function(){return console.warn("THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' )."),this.extensions.get("EXT_blend_minmax")};tt.prototype.supportsVertexTextures=function(){return console.warn("THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures."),this.capabilities.vertexTextures};tt.prototype.supportsInstancedArrays=function(){return console.warn("THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' )."),this.extensions.get("ANGLE_instanced_arrays")};tt.prototype.enableScissorTest=function(s){console.warn("THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest()."),this.setScissorTest(s)};tt.prototype.initMaterial=function(){console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.")};tt.prototype.addPrePlugin=function(){console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.")};tt.prototype.addPostPlugin=function(){console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.")};tt.prototype.updateShadowMap=function(){console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.")};tt.prototype.setFaceCulling=function(){console.warn("THREE.WebGLRenderer: .setFaceCulling() has been removed.")};tt.prototype.allocTextureUnit=function(){console.warn("THREE.WebGLRenderer: .allocTextureUnit() has been removed.")};tt.prototype.setTexture=function(){console.warn("THREE.WebGLRenderer: .setTexture() has been removed.")};tt.prototype.setTexture2D=function(){console.warn("THREE.WebGLRenderer: .setTexture2D() has been removed.")};tt.prototype.setTextureCube=function(){console.warn("THREE.WebGLRenderer: .setTextureCube() has been removed.")};tt.prototype.getActiveMipMapLevel=function(){return console.warn("THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel()."),this.getActiveMipmapLevel()};Object.defineProperties(tt.prototype,{shadowMapEnabled:{get:function(){return this.shadowMap.enabled},set:function(s){console.warn("THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled."),this.shadowMap.enabled=s}},shadowMapType:{get:function(){return this.shadowMap.type},set:function(s){console.warn("THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type."),this.shadowMap.type=s}},shadowMapCullFace:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.")}},context:{get:function(){return console.warn("THREE.WebGLRenderer: .context has been removed. Use .getContext() instead."),this.getContext()}},vr:{get:function(){return console.warn("THREE.WebGLRenderer: .vr has been renamed to .xr"),this.xr}},gammaInput:{get:function(){return console.warn("THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead."),!1},set:function(){console.warn("THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead.")}},gammaOutput:{get:function(){return console.warn("THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead."),!1},set:function(s){console.warn("THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead."),this.outputEncoding=s===!0?ot:qn}},toneMappingWhitePoint:{get:function(){return console.warn("THREE.WebGLRenderer: .toneMappingWhitePoint has been removed."),1},set:function(){console.warn("THREE.WebGLRenderer: .toneMappingWhitePoint has been removed.")}},gammaFactor:{get:function(){return console.warn("THREE.WebGLRenderer: .gammaFactor has been removed."),2},set:function(){console.warn("THREE.WebGLRenderer: .gammaFactor has been removed.")}}});Object.defineProperties(Rc.prototype,{cullFace:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.")}},renderReverseSided:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.")}},renderSingleSided:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.")}}});Object.defineProperties(Yt.prototype,{wrapS:{get:function(){return console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."),this.texture.wrapS},set:function(s){console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."),this.texture.wrapS=s}},wrapT:{get:function(){return console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."),this.texture.wrapT},set:function(s){console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."),this.texture.wrapT=s}},magFilter:{get:function(){return console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."),this.texture.magFilter},set:function(s){console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."),this.texture.magFilter=s}},minFilter:{get:function(){return console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."),this.texture.minFilter},set:function(s){console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."),this.texture.minFilter=s}},anisotropy:{get:function(){return console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."),this.texture.anisotropy},set:function(s){console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."),this.texture.anisotropy=s}},offset:{get:function(){return console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."),this.texture.offset},set:function(s){console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."),this.texture.offset=s}},repeat:{get:function(){return console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."),this.texture.repeat},set:function(s){console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."),this.texture.repeat=s}},format:{get:function(){return console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."),this.texture.format},set:function(s){console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."),this.texture.format=s}},type:{get:function(){return console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."),this.texture.type},set:function(s){console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."),this.texture.type=s}},generateMipmaps:{get:function(){return console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."),this.texture.generateMipmaps},set:function(s){console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."),this.texture.generateMipmaps=s}}});D0.prototype.load=function(s){console.warn("THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.");const e=this;return new L0().load(s,function(n){e.setBuffer(n)}),this};ta.prototype.updateCubeMap=function(s,e){return console.warn("THREE.CubeCamera: .updateCubeMap() is now .update()."),this.update(s,e)};ta.prototype.clear=function(s,e,t,n){return console.warn("THREE.CubeCamera: .clear() is now .renderTarget.clear()."),this.renderTarget.clear(s,e,t,n)};hi.crossOrigin=void 0;hi.loadTexture=function(s,e,t,n){console.warn("THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.");const i=new _0;i.setCrossOrigin(this.crossOrigin);const r=i.load(s,t,void 0,n);return e&&(r.mapping=e),r};hi.loadTextureCube=function(s,e,t,n){console.warn("THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.");const i=new x0;i.setCrossOrigin(this.crossOrigin);const r=i.load(s,t,void 0,n);return e&&(r.mapping=e),r};hi.loadCompressedTexture=function(){console.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.")};hi.loadCompressedTextureCube=function(){console.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.")};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Zo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Zo);function Y0(){const s=Vn.float(0,100);return`uniform vec2 resolution;
  uniform float time;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 239.0)) * 239.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x, float seed) {
    return mod289(((x*34.0)+1.0) * x * seed);
  }

  float snoise(vec2 v, float seed) {

    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
  // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ), seed)
      + i.x + vec3(0.0, i1.x, 1.0 ), seed);

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 150.0 * dot(m, g);
  }

  float star(vec2 p, float seed) {
    return step(0.49, smoothstep(0.80, 1.0, snoise(p, seed)));
  }

  void main(void) {

    vec2 p = gl_FragCoord.xy ;
      vec2 o = cameraPosition.xy * 2.0;

      // star layers
      float s1 = star(p + floor(o * 1.1), ${s});
      float s2 = star(p + floor(o * 0.75) + vec2(-20.0, 10.0), ${s});
      float s3 = star(p + floor(o * 0.5) + vec2(-75.0, 25.0), ${s});

      // flickering
      vec2 p2 = resolution.xy - p * 0.25;
      vec2 pl = -1.0 + 2.0 * p2;
      float len = length(pl);
      vec2 uv = p2 + (pl / len) * cos(len * 20.0 - time * 1.079)*0.8537;

      float g = smoothstep(0.10, 1.0,snoise(uv, ${s}));
      if (s1 > 0.0) {
          s1 -= g * 0.25;
      }
      if (s2 > 0.0) {
          s2 += g * 0.75;
      }

      if (s3 > 0.0) {
          s3 += g * 0.5;
      }

      // final color
      float val = (s1 * 1.0 + s2 * 0.50 + s3 * 0.25) * 0.85;
      gl_FragColor = vec4(val, val, val, 1);

  }`}const{document:ac}=vh;function lc(s,e,t){const n=s.slice();return n[24]=e[t],n}function cc(s){let e,t=s[24]+"",n;return{c(){e=ke("option"),n=it(t),this.h()},l(i){e=We(i,"OPTION",{});var r=St(e);n=rt(r,t),r.forEach(ut),this.h()},h(){e.__value=s[24],xs(e,e.__value)},m(i,r){Fo(i,e,r),te(e,n)},p:No,d(i){i&&ut(e)}}}function Z0(s){let e,t,n,i="Planet Generator",r,o,a="This lets you generate a planet. It uses WebGL and your graphics card.",l,c,h,u="Random Seed",d,p,g,m,f,v="Planet Type",w,E,b,T="random",L,I,y="Generate From Seed",C,N,P="Random Seed (and Generate)",ee,ne,R=s[2].name+"",G,z,k,X,B,H=s[2].description+"",K,Y,se,de,ge="Planet Type:",W,Ge=s[2].classification.name+"",we,Fe,ie,ze,J="Population:",j,re=s[2].populationFriendly+"",me,ce,Se,ve,be="Government:",Ze,Xe=s[2].government+"",M,x,U,Z,he="Culture:",ue,_e=s[2].culture+"",V,De,Le,fe,A="Distance from Star:",ae,oe=new Intl.NumberFormat().format(s[2].distance_from_sun)+"",Ee,pe,Te,$,Me,Je="Mass:",Ue,Ct=new Intl.NumberFormat().format(s[2].mass)+"",Pt,Qi,Zt,Dr="24",Yn,Dn=new Intl.NumberFormat().format(Math.floor(s[2].mass/5.9722*100))+"",di,er,tr,_,D,O="Diameter:",F,q=new Intl.NumberFormat().format(Math.floor(s[2].diameter))+"",Ae,Pe,Ie=new Intl.NumberFormat().format(Math.floor(s[2].diameter/12756*100))+"",Ne,je,Oe,Re,Ye,hn="Gravity:",un,$t=new Intl.NumberFormat().format(s[2].gravity)+"",Dt,qe,Ut,lt="2",Ot,Ht=new Intl.NumberFormat().format(Math.floor(s[2].gravity/9.81*100))+"",dn,Zn,pt,It,en,qt="Orbital Period:",Vs,nr=new Intl.NumberFormat().format(Math.floor(s[2].orbital_period))+"",Ir,Gs,ks,ya,fi=Sa(s[3]),wt=[];for(let He=0;He<fi.length;He+=1)wt[He]=cc(lc(s,fi,He));return{c(){e=$e(),t=ke("section"),n=ke("h1"),n.textContent=i,r=$e(),o=ke("p"),o.textContent=a,l=$e(),c=ke("div"),h=ke("label"),h.textContent=u,d=$e(),p=ke("input"),g=$e(),m=ke("div"),f=ke("label"),f.textContent=v,w=$e(),E=ke("select"),b=ke("option"),b.textContent=T;for(let He=0;He<wt.length;He+=1)wt[He].c();L=$e(),I=ke("button"),I.textContent=y,C=$e(),N=ke("button"),N.textContent=P,ee=$e(),ne=ke("h2"),G=it(R),z=$e(),k=ke("canvas"),X=$e(),B=ke("p"),K=it(H),Y=$e(),se=ke("p"),de=ke("strong"),de.textContent=ge,W=$e(),we=it(Ge),Fe=$e(),ie=ke("p"),ze=ke("strong"),ze.textContent=J,j=$e(),me=it(re),ce=$e(),Se=ke("p"),ve=ke("strong"),ve.textContent=be,Ze=$e(),M=it(Xe),x=$e(),U=ke("p"),Z=ke("strong"),Z.textContent=he,ue=$e(),V=it(_e),De=$e(),Le=ke("p"),fe=ke("strong"),fe.textContent=A,ae=$e(),Ee=it(oe),pe=it(" AU"),Te=$e(),$=ke("p"),Me=ke("strong"),Me.textContent=Je,Ue=$e(),Pt=it(Ct),Qi=it(" × 10"),Zt=ke("sup"),Zt.textContent=Dr,Yn=it(" kg ("),di=it(Dn),er=it("% Earth's mass)"),tr=$e(),_=ke("p"),D=ke("strong"),D.textContent=O,F=$e(),Ae=it(q),Pe=it(" km ("),Ne=it(Ie),je=it("% Earth's diameter)"),Oe=$e(),Re=ke("p"),Ye=ke("strong"),Ye.textContent=hn,un=$e(),Dt=it($t),qe=it(" m/s"),Ut=ke("sup"),Ut.textContent=lt,Ot=it(`
    (`),dn=it(Ht),Zn=it("% Earth's gravity)"),pt=$e(),It=ke("p"),en=ke("strong"),en.textContent=qt,Vs=$e(),Ir=it(nr),Gs=it(" days"),this.h()},l(He){ph("svelte-1rxcaiu",ac.head).forEach(ut),e=Ke(He),t=We(He,"SECTION",{class:!0});var ye=St(t);n=We(ye,"H1",{class:!0,"data-svelte-h":!0}),_t(n)!=="svelte-32imzj"&&(n.textContent=i),r=Ke(ye),o=We(ye,"P",{class:!0,"data-svelte-h":!0}),_t(o)!=="svelte-ranut0"&&(o.textContent=a),l=Ke(ye),c=We(ye,"DIV",{class:!0});var $n=St(c);h=We($n,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),_t(h)!=="svelte-1akft3f"&&(h.textContent=u),d=Ke($n),p=We($n,"INPUT",{type:!0,name:!0,id:!0,class:!0}),$n.forEach(ut),g=Ke(ye),m=We(ye,"DIV",{class:!0});var Nr=St(m);f=We(Nr,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),_t(f)!=="svelte-c877bm"&&(f.textContent=v),w=Ke(Nr),E=We(Nr,"SELECT",{id:!0,class:!0});var Ws=St(E);b=We(Ws,"OPTION",{"data-svelte-h":!0}),_t(b)!=="svelte-15kmviv"&&(b.textContent=T);for(let qs=0;qs<wt.length;qs+=1)wt[qs].l(Ws);Ws.forEach(ut),Nr.forEach(ut),L=Ke(ye),I=We(ye,"BUTTON",{class:!0,"data-svelte-h":!0}),_t(I)!=="svelte-1u7zbd5"&&(I.textContent=y),C=Ke(ye),N=We(ye,"BUTTON",{class:!0,"data-svelte-h":!0}),_t(N)!=="svelte-192mxrq"&&(N.textContent=P),ee=Ke(ye),ne=We(ye,"H2",{class:!0});var ba=St(ne);G=rt(ba,R),ba.forEach(ut),z=Ke(ye),k=We(ye,"CANVAS",{id:!0,class:!0}),St(k).forEach(ut),X=Ke(ye),B=We(ye,"P",{class:!0});var Ma=St(B);K=rt(Ma,H),Ma.forEach(ut),Y=Ke(ye),se=We(ye,"P",{class:!0});var Fr=St(se);de=We(Fr,"STRONG",{class:!0,"data-svelte-h":!0}),_t(de)!=="svelte-1x3lack"&&(de.textContent=ge),W=Ke(Fr),we=rt(Fr,Ge),Fr.forEach(ut),Fe=Ke(ye),ie=We(ye,"P",{class:!0});var zr=St(ie);ze=We(zr,"STRONG",{class:!0,"data-svelte-h":!0}),_t(ze)!=="svelte-vxfh5n"&&(ze.textContent=J),j=Ke(zr),me=rt(zr,re),zr.forEach(ut),ce=Ke(ye),Se=We(ye,"P",{class:!0});var Br=St(Se);ve=We(Br,"STRONG",{class:!0,"data-svelte-h":!0}),_t(ve)!=="svelte-1per3yf"&&(ve.textContent=be),Ze=Ke(Br),M=rt(Br,Xe),Br.forEach(ut),x=Ke(ye),U=We(ye,"P",{class:!0});var Ur=St(U);Z=We(Ur,"STRONG",{class:!0,"data-svelte-h":!0}),_t(Z)!=="svelte-ywc3a4"&&(Z.textContent=he),ue=Ke(Ur),V=rt(Ur,_e),Ur.forEach(ut),De=Ke(ye),Le=We(ye,"P",{class:!0});var ir=St(Le);fe=We(ir,"STRONG",{class:!0,"data-svelte-h":!0}),_t(fe)!=="svelte-1hjtszb"&&(fe.textContent=A),ae=Ke(ir),Ee=rt(ir,oe),pe=rt(ir," AU"),ir.forEach(ut),Te=Ke(ye),$=We(ye,"P",{class:!0});var _n=St($);Me=We(_n,"STRONG",{class:!0,"data-svelte-h":!0}),_t(Me)!=="svelte-1dyh534"&&(Me.textContent=Je),Ue=Ke(_n),Pt=rt(_n,Ct),Qi=rt(_n," × 10"),Zt=We(_n,"SUP",{class:!0,"data-svelte-h":!0}),_t(Zt)!=="svelte-17ldsqy"&&(Zt.textContent=Dr),Yn=rt(_n," kg ("),di=rt(_n,Dn),er=rt(_n,"% Earth's mass)"),_n.forEach(ut),tr=Ke(ye),_=We(ye,"P",{class:!0});var Kn=St(_);D=We(Kn,"STRONG",{class:!0,"data-svelte-h":!0}),_t(D)!=="svelte-151n5sv"&&(D.textContent=O),F=Ke(Kn),Ae=rt(Kn,q),Pe=rt(Kn," km ("),Ne=rt(Kn,Ie),je=rt(Kn,"% Earth's diameter)"),Kn.forEach(ut),Oe=Ke(ye),Re=We(ye,"P",{class:!0});var yn=St(Re);Ye=We(yn,"STRONG",{class:!0,"data-svelte-h":!0}),_t(Ye)!=="svelte-y44lrs"&&(Ye.textContent=hn),un=Ke(yn),Dt=rt(yn,$t),qe=rt(yn," m/s"),Ut=We(yn,"SUP",{class:!0,"data-svelte-h":!0}),_t(Ut)!=="svelte-1nsjm82"&&(Ut.textContent=lt),Ot=rt(yn,`
    (`),dn=rt(yn,Ht),Zn=rt(yn,"% Earth's gravity)"),yn.forEach(ut),pt=Ke(ye),It=We(ye,"P",{class:!0});var rr=St(It);en=We(rr,"STRONG",{class:!0,"data-svelte-h":!0}),_t(en)!=="svelte-18c8r4q"&&(en.textContent=qt),Vs=Ke(rr),Ir=rt(rr,nr),Gs=rt(rr," days"),rr.forEach(ut),ye.forEach(ut),this.h()},h(){ac.title="Planet Generator | Iron Arachne",Be(n,"class","svelte-1mgpjv4"),Be(o,"class","svelte-1mgpjv4"),Be(h,"for","seed"),Be(h,"class","svelte-1mgpjv4"),Be(p,"type","text"),Be(p,"name","seed"),Be(p,"id","seed"),Be(p,"class","svelte-1mgpjv4"),Be(c,"class","input-group svelte-1mgpjv4"),Be(f,"for","planetType"),Be(f,"class","svelte-1mgpjv4"),b.__value="random",xs(b,b.__value),Be(E,"id","planetType"),Be(E,"class","svelte-1mgpjv4"),s[1]===void 0&&ch(()=>s[7].call(E)),Be(m,"class","input-group svelte-1mgpjv4"),Be(I,"class","svelte-1mgpjv4"),Be(N,"class","svelte-1mgpjv4"),Be(ne,"class","svelte-1mgpjv4"),Be(k,"id","render"),Be(k,"class","svelte-1mgpjv4"),Be(B,"class","svelte-1mgpjv4"),Be(de,"class","svelte-1mgpjv4"),Be(se,"class","svelte-1mgpjv4"),Be(ze,"class","svelte-1mgpjv4"),Be(ie,"class","svelte-1mgpjv4"),Be(ve,"class","svelte-1mgpjv4"),Be(Se,"class","svelte-1mgpjv4"),Be(Z,"class","svelte-1mgpjv4"),Be(U,"class","svelte-1mgpjv4"),Be(fe,"class","svelte-1mgpjv4"),Be(Le,"class","svelte-1mgpjv4"),Be(Me,"class","svelte-1mgpjv4"),Be(Zt,"class","svelte-1mgpjv4"),Be($,"class","svelte-1mgpjv4"),Be(D,"class","svelte-1mgpjv4"),Be(_,"class","svelte-1mgpjv4"),Be(Ye,"class","svelte-1mgpjv4"),Be(Ut,"class","svelte-1mgpjv4"),Be(Re,"class","svelte-1mgpjv4"),Be(en,"class","svelte-1mgpjv4"),Be(It,"class","svelte-1mgpjv4"),Be(t,"class","main scifi svelte-1mgpjv4")},m(He,ht){Fo(He,e,ht),Fo(He,t,ht),te(t,n),te(t,r),te(t,o),te(t,l),te(t,c),te(c,h),te(c,d),te(c,p),xs(p,s[0]),te(t,g),te(t,m),te(m,f),te(m,w),te(m,E),te(E,b);for(let ye=0;ye<wt.length;ye+=1)wt[ye]&&wt[ye].m(E,null);wa(E,s[1],!0),te(t,L),te(t,I),te(t,C),te(t,N),te(t,ee),te(t,ne),te(ne,G),te(t,z),te(t,k),te(t,X),te(t,B),te(B,K),te(t,Y),te(t,se),te(se,de),te(se,W),te(se,we),te(t,Fe),te(t,ie),te(ie,ze),te(ie,j),te(ie,me),te(t,ce),te(t,Se),te(Se,ve),te(Se,Ze),te(Se,M),te(t,x),te(t,U),te(U,Z),te(U,ue),te(U,V),te(t,De),te(t,Le),te(Le,fe),te(Le,ae),te(Le,Ee),te(Le,pe),te(t,Te),te(t,$),te($,Me),te($,Ue),te($,Pt),te($,Qi),te($,Zt),te($,Yn),te($,di),te($,er),te(t,tr),te(t,_),te(_,D),te(_,F),te(_,Ae),te(_,Pe),te(_,Ne),te(_,je),te(t,Oe),te(t,Re),te(Re,Ye),te(Re,un),te(Re,Dt),te(Re,qe),te(Re,Ut),te(Re,Ot),te(Re,dn),te(Re,Zn),te(t,pt),te(t,It),te(It,en),te(It,Vs),te(It,Ir),te(It,Gs),ks||(ya=[Or(p,"input",s[6]),Or(E,"change",s[7]),Or(I,"click",s[4]),Or(N,"click",s[5])],ks=!0)},p(He,[ht]){if(ht&1&&p.value!==He[0]&&xs(p,He[0]),ht&8){fi=Sa(He[3]);let ye;for(ye=0;ye<fi.length;ye+=1){const $n=lc(He,fi,ye);wt[ye]?wt[ye].p($n,ht):(wt[ye]=cc($n),wt[ye].c(),wt[ye].m(E,null))}for(;ye<wt.length;ye+=1)wt[ye].d(1);wt.length=fi.length}ht&10&&wa(E,He[1]),ht&4&&R!==(R=He[2].name+"")&&Vt(G,R),ht&4&&H!==(H=He[2].description+"")&&Vt(K,H),ht&4&&Ge!==(Ge=He[2].classification.name+"")&&Vt(we,Ge),ht&4&&re!==(re=He[2].populationFriendly+"")&&Vt(me,re),ht&4&&Xe!==(Xe=He[2].government+"")&&Vt(M,Xe),ht&4&&_e!==(_e=He[2].culture+"")&&Vt(V,_e),ht&4&&oe!==(oe=new Intl.NumberFormat().format(He[2].distance_from_sun)+"")&&Vt(Ee,oe),ht&4&&Ct!==(Ct=new Intl.NumberFormat().format(He[2].mass)+"")&&Vt(Pt,Ct),ht&4&&Dn!==(Dn=new Intl.NumberFormat().format(Math.floor(He[2].mass/5.9722*100))+"")&&Vt(di,Dn),ht&4&&q!==(q=new Intl.NumberFormat().format(Math.floor(He[2].diameter))+"")&&Vt(Ae,q),ht&4&&Ie!==(Ie=new Intl.NumberFormat().format(Math.floor(He[2].diameter/12756*100))+"")&&Vt(Ne,Ie),ht&4&&$t!==($t=new Intl.NumberFormat().format(He[2].gravity)+"")&&Vt(Dt,$t),ht&4&&Ht!==(Ht=new Intl.NumberFormat().format(Math.floor(He[2].gravity/9.81*100))+"")&&Vt(dn,Ht),ht&4&&nr!==(nr=new Intl.NumberFormat().format(Math.floor(He[2].orbital_period))+"")&&Vt(Ir,nr)},i:No,o:No,d(He){He&&(ut(e),ut(t)),mh(wt,He),ks=!1,hh(ya)}}}function $0(s,e,t){let n=[],i=[],r=[],o=xh(),a="",l="",c="",h=Ea(13);Vn.use(Ta(h));let u="random",d=new bh,p=new _h(d),g=p.generate(),m=!1,f=new Es,v,w,E;function b(){for(let P=0;P<n.length;P++)n[P].dispose();for(let P=0;P<r.length;P++)r[P].dispose();n=[],i=[],r=[],E.dispose(),m=!1}function T(){if(m&&b(),Vn.use(Ta(h)),u=="random")p.config.possibleClassifications=yh();else{let ee=Mh(u);ee!==void 0&&(p.config.possibleClassifications=[ee])}t(2,g=p.generate());let P=Nh(g.classification.name);l=P.generateFragmentShader(),a=P.generateVertexShader(),c=P.generateCloudShader(),y()}function L(){requestAnimationFrame(L),E.render(f,v)}function I(){t(0,h=Ea(13)),T()}function y(){if(u==""&&t(1,u="random"),w=document.getElementById("render"),f=new Es,v=new Ft(65,600/400,.1,100),v.position.set(0,10,20),w===null)throw new Error("Canvas not found");E=new tt({canvas:w,antialias:!0}),E.setSize(600,400);let P=new zs(50,50,50);r.push(P);let ee=new Wt({fragmentShader:Y0()});n.push(ee);let ne=new At(P,ee);i.push(ne),f.add(ne);let R=l,G=a,z=bc.merge([le.lights]);z.u_resolution={value:{x:600,y:400}},z.seed={value:Vn.float(0,200)};let k=Ih(g.diameter),X=new Ts(k,32,32);r.push(X);let B=new Wt({uniforms:z,fragmentShader:R,vertexShader:G,lights:!0});n.push(B);let H=new th(16181357,4210752,.5);f.add(H);let K=new At(X,B);if(K.position.set(0,10,0),i.push(K),f.add(K),g.has_clouds){let Y=c,se=new Ts(k+.1,32,32);r.push(se),z.numOctaves={value:16};let de=new Wt({uniforms:z,fragmentShader:Y,vertexShader:G,transparent:!0});n.push(de);let ge=new At(se,de);ge.position.set(0,10,0),i.push(ge),f.add(ge)}m=!0,L()}uh(()=>{I()});function C(){h=this.value,t(0,h)}function N(){u=gh(this),t(1,u),t(3,o)}return[h,u,g,o,T,I,C,N]}class ov extends dh{constructor(e){super(),fh(this,e,$0,Z0,lh,{})}}export{ov as component};
//# sourceMappingURL=20.28ca38e1.js.map
