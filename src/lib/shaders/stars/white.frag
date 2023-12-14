#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

#include ../simplex-noise.glsl

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

  vec3 baseColor = vec3(1.0, 1.0, 1.0);
  vec3 darkerColor = vec3(0.3, 0.3, 0.3);
  vec3 secondaryColor = vec3(1.0, 1.0, 1.0);

  vec3 color = mix(baseColor, secondaryColor, height);
  color = mix(color, darkerColor, qh);

  gl_FragColor = vec4(color +
    0.63 * baseColor, 1.0);
}
