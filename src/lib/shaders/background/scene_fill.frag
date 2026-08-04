#ifdef GL_ES
precision highp float;
#endif

// The scene's background fill, as a flat colour over the whole canvas.
//
// The fill is drawn as a plane rather than set as the renderer's clear colour so that it goes
// through the same path as everything else: the clear colour is subject to three's colour
// management, while every shader here writes the framebuffer directly.
uniform vec3 fill_color;

void main() {
  gl_FragColor = vec4(fill_color, 1.0);
}
