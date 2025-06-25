precision mediump float;

uniform vec3 u_primaryColor;
uniform vec2 u_resolution;
uniform float u_time;

// Placeholder: Using a different component of primary color
void main() {
  float wave = 0.3 + 0.7 * abs(cos(u_time * 2.5 + gl_FragCoord.y * 0.01));
  gl_FragColor = vec4(vec3(u_primaryColor.r * wave, u_primaryColor.g * (1.0-wave), u_primaryColor.b), 1.0);
}
