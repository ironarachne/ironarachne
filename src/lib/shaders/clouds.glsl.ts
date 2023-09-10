import noiseFunction from "./simplex-noise.glsl.js";

export default `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float seed;
uniform int numOctaves;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 v_Normal;

${noiseFunction}

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
}`;
