precision mediump float;

uniform vec3 u_primaryColor;
uniform vec2 u_resolution;
uniform float u_time;

// Placeholder: Color cycling differently
void main() {
  float intensity = 0.7 + 0.3 * cos(u_time * 1.5);
  gl_FragColor = vec4(u_primaryColor.grb * intensity, 1.0); // Swizzle for different base
}
