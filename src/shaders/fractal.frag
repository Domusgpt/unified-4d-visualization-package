precision mediump float;

uniform vec3 u_primaryColor;
uniform vec2 u_resolution;
uniform float u_time;

// Placeholder: Fading in and out
void main() {
  float fade = abs(sin(u_time * 0.5)) * 0.4 + 0.2;
  gl_FragColor = vec4(u_primaryColor * fade, 1.0);
}
