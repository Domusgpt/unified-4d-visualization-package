precision mediump float;

uniform vec3 u_primaryColor;
uniform vec2 u_resolution;
uniform float u_time;

// Placeholder: Alternating color
void main() {
  float factor = step(0.5, mod(u_time, 2.0)); // Alternate every second
  gl_FragColor = vec4(u_primaryColor * (0.5 + factor * 0.3), 1.0);
}
