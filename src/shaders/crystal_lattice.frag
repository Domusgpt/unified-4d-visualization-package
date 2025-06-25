precision mediump float;

uniform vec3 u_primaryColor;
uniform vec2 u_resolution;
uniform float u_time;

// Placeholder: Sharp flickering effect
void main() {
  float flicker = floor(mod(u_time * 10.0, 2.0)) * 0.2 + 0.5;
  gl_FragColor = vec4(u_primaryColor * flicker, 1.0);
}
