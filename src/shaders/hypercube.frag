precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_dimension;
uniform float u_morphFactor;
uniform float u_rotationSpeed;
uniform float u_gridDensity;
uniform float u_lineThickness;
uniform float u_audioBass;
uniform float u_audioMid;
uniform float u_audioHigh;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform vec3 u_backgroundColor;

// 4D rotation matrices
mat4 rotXW(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    c, 0, 0, -s,
    0, 1, 0, 0,
    0, 0, 1, 0,
    s, 0, 0, c
  );
}

mat4 rotYZ(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    1, 0, 0, 0,
    0, c, -s, 0,
    0, s, c, 0,
    0, 0, 0, 1
  );
}

vec3 project4Dto3D(vec4 p4d) {
  float w = p4d.w + 2.5;
  return p4d.xyz / max(0.1, w);
}

float calculateLattice(vec3 p) {
  float dynamicGridDensity = max(0.1, u_gridDensity * (1.0 + u_audioBass * 0.7));
  float dynamicLineThickness = max(0.002, u_lineThickness * (1.0 - u_audioMid * 0.6));

  // 3D lattice calculation
  vec3 p_grid3D = fract(p * dynamicGridDensity * 0.5 + u_time * 0.01);
  vec3 dist3D = abs(p_grid3D - 0.5);
  float box3D = max(dist3D.x, max(dist3D.y, dist3D.z));
  float lattice3D = smoothstep(0.5, 0.5 - dynamicLineThickness, box3D);

  // 4D extension
  float dim_factor = smoothstep(3.0, 4.5, u_dimension);
  if (dim_factor > 0.01) {
    float w_coord = sin(p.x*1.4 - p.y*0.7 + p.z*1.5 + u_time * 0.25)
                  * cos(length(p) * 1.1 - u_time * 0.35 + u_audioMid * 2.5)
                  * dim_factor * (0.4 + u_morphFactor * 0.6 + u_audioHigh * 0.6);

    vec4 p4d = vec4(p, w_coord);
    p4d = rotXW(u_time * 0.33 * u_rotationSpeed) *
          rotYZ(u_time * 0.28 * u_rotationSpeed) * p4d;

    vec3 projectedP = project4Dto3D(p4d);
    vec3 p_grid4D = fract(projectedP * dynamicGridDensity * 0.5 + u_time * 0.015);
    vec3 dist4D = abs(p_grid4D - 0.5);
    float box4D = max(dist4D.x, max(dist4D.y, dist4D.z));
    float lattice4D = smoothstep(0.5, 0.5 - dynamicLineThickness, box4D);

    return mix(lattice3D, lattice4D, smoothstep(0.0, 1.0, u_morphFactor));
  }

  return lattice3D;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Apply mouse offset
  vec2 mouseOffset = (u_mouse - 0.5) * 2.0;
  uv += mouseOffset * 0.5;

  vec3 p = vec3(uv * 2.0, 0.0);
  float lattice = calculateLattice(p);

  // Color mixing based on lattice intensity
  vec3 color = mix(u_backgroundColor, u_primaryColor, lattice);
  color = mix(color, u_secondaryColor, lattice * u_audioHigh);

  // Apply glow effect
  float glow = lattice * (1.0 + u_audioHigh * 0.5);
  color *= glow;

  gl_FragColor = vec4(color, 1.0);
}
