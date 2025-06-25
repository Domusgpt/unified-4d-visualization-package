precision mediump float;

uniform vec3 u_primaryColor;
uniform vec2 u_resolution;
uniform float u_time;

// Placeholder: Simple gradient based on uv
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float gradient = uv.x * 0.6 + 0.4;
  gl_FragColor = vec4(u_primaryColor * gradient, 1.0);
}
