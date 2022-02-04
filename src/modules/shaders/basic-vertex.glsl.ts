'use strict';

export default `varying vec3 vertPos;
varying vec2 vUv;
varying vec3 v_Normal;

void main() {
  vUv = uv;
  vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
  vertPos = vec3(vertPos4) / vertPos4.w;
  gl_Position = projectionMatrix * vertPos4;
  v_Normal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
}`;
