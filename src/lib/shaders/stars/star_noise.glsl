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
