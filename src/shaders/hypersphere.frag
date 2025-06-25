precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse; // Normalized mouse coordinates
uniform float u_dimension; // Current dimension (3.0 to 4.0+)
uniform float u_morphFactor; // General morphing (0 to 1)
uniform float u_rotationSpeed;
uniform float u_gridDensity; // Can be repurposed for shell count/density
uniform float u_lineThickness; // Can be repurposed for shell thickness

uniform float u_audioBass;   // Reactivity for pulse/scale
uniform float u_audioMid;    // Reactivity for detail/shells
uniform float u_audioHigh;   // Reactivity for shimmer/speed

uniform vec3 u_primaryColor;   // Base color for shells (yellow)
uniform vec3 u_secondaryColor; // Accent color
uniform vec3 u_backgroundColor;

// --- Rotation Matrices (from hypercube, can be shared or duplicated) ---
mat4 rotXW(float angle) {
  float c = cos(angle); float s = sin(angle);
  return mat4(c,0,0,-s, 0,1,0,0, 0,0,1,0, s,0,0,c);
}

mat4 rotYW(float angle) {
  float c = cos(angle); float s = sin(angle);
  return mat4(1,0,0,0, c,0,-s,0, 0,1,0,0, 0,s,0,c);
}

mat4 rotZW(float angle) {
  float c = cos(angle); float s = sin(angle);
  return mat4(1,0,0,0, 0,1,0,0, 0,c,-s,0, 0,s,c,0);
}

mat4 rotXY(float angle) {
  float c = cos(angle); float s = sin(angle);
  return mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);
}

mat4 rotXZ(float angle) {
  float c = cos(angle); float s = sin(angle);
  return mat4(c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1);
}

mat4 rotYZ(float angle) {
  float c = cos(angle); float s = sin(angle);
  return mat4(1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);
}


// --- SDF for a 4D Hypersphere ---
// p: sample point in 4D
// r: radius of the hypersphere
float sdHypersphere(vec4 p, float r) {
  return length(p) - r;
}

// --- Projection from 4D to 3D (stereographic or perspective) ---
vec3 project4Dto3D(vec4 p4, float perspectiveFactor) {
  // Simple perspective projection: w affects scale
  // perspectiveFactor helps control how much the w dimension influences the projection
  float w = 1.0 + p4.w * perspectiveFactor;
  return p4.xyz / max(0.1, w); // Avoid division by zero
}


void main() {
  vec2 aspectCorrectedUV = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // --- Camera Setup (simple) ---
  vec3 ro = vec3(0.0, 0.0, -3.0 + u_mouse.y * 2.0); // Ray origin, allow mouse to dolly
  vec3 rd_base = normalize(vec3(aspectCorrectedUV + (u_mouse - 0.5) * 0.5, 1.0)); // Ray direction

  // --- Time-based rotations for animation ---
  float time = u_time * 0.2 * u_rotationSpeed;

  // --- 4D Point Construction & Rotation ---
  // Start with the 3D ray direction and lift it to 4D
  // The w-coordinate can be used for morphing or fixed.
  // Let's make w-coordinate related to morphFactor and time for some animation.
  float w_coord = sin(length(rd_base.xy) * 2.0 - time * 0.5) * u_morphFactor;

  vec4 p4_ro = vec4(ro, w_coord); // Ray origin in 4D (less critical for this effect)
  vec4 p4_rd_base = vec4(rd_base, 0.0); // Base ray direction in 4D

  // Apply 4D rotations to the ray direction (or inversely to the object)
  // More complex rotations for a "4D feel"
  mat4 rot_mat = rotXW(time * 1.1 + u_audioHigh * 0.5) *
                 rotYW(time * 1.3 + u_mouse.x * 0.5) *
                 rotZW(time * 1.5) *
                 rotXY(time * 0.5) *
                 rotXZ(time * 0.3) *
                 rotYZ(time * 0.7);

  // We are raymarching, so we transform the sample point, not the ray directly
  // For simplicity, we'll transform the point we sample against the SDF.

  // --- Raymarching Settings ---
  float t = 0.0; // Distance along the ray
  vec3 col = u_backgroundColor;
  float hit_threshold = 0.005;
  int max_steps = 64;

  // --- Hypersphere Parameters ---
  float baseRadius = 0.8 + u_audioBass * 0.2; // Base radius, pulsating with bass
  float numShells = floor(mix(3.0, 10.0, u_gridDensity / 10.0)); // Use gridDensity for shell count
  float shellSpacing = 0.2 / numShells; // Spacing between shells
  float dynamicShellThickness = max(0.005, 0.05 * (u_lineThickness / 0.03) * (1.0 - u_audioMid * 0.5)); // Use lineThickness

  // --- Raymarching Loop ---
  for (int i = 0; i < max_steps; i++) {
    vec3 p3_current = ro + t * rd_base; // Current 3D point along the ray

    // Construct 4D point for SDF sampling, apply inverse rotations
    // The w-coordinate for sampling can be dynamic or fixed relative to p3_current
    // Let's make w_sample vary with depth and time for more dynamism
    float w_sample = sin(length(p3_current.xy) * 1.5 - time * 0.3) * u_morphFactor * 0.5;
    vec4 p4_sample_unrotated = vec4(p3_current, w_sample);
    vec4 p4_sample = rot_mat * p4_sample_unrotated; // Apply rotations

    // Project the 4D sample point to visualize its 3D position (optional, for perspective factor)
    // For SDF, we use the 4D point directly.
    // The projection factor can be influenced by the dimension parameter
    float perspectiveFactor = mix(0.1, 1.0, smoothstep(3.5, 4.5, u_dimension));

    // SDF calculation for concentric shells
    // We modify the distance to the origin before subtracting radius to get shells
    float d_to_origin = length(p4_sample.xyz); // Using xyz of rotated point for shell structure
                                               // Or length(p4_sample) for true 4D shells

    float d_shells = mod(d_to_origin, shellSpacing) - shellSpacing * 0.5;
    float dist = abs(d_shells) - dynamicShellThickness; // This creates shells in 3D space around origin

    // Combine with overall hypersphere boundary (optional, can make shells fade at edge)
    // float d_hypersphere_boundary = sdHypersphere(p4_sample, baseRadius + numShells * shellSpacing);
    // dist = max(dist, d_hypersphere_boundary);


    if (dist < hit_threshold) {
      // --- Coloring ---
      // Color based on shell index, depth, or other properties
      float shellIndex = floor(d_to_origin / shellSpacing);
      float shellLerp = fract(shellIndex / numShells + u_time * 0.1 + u_audioHigh * 0.3);

      vec3 shellColor = mix(u_primaryColor, u_secondaryColor, shellLerp); // Yellow to accent

      // Simple lighting: fake normal with gradient, or use SDF gradient
      vec3 normal_approx = normalize(vec3(
        sdHypersphere(p4_sample + vec4(0.01,0,0,0), baseRadius) - dist,
        sdHypersphere(p4_sample + vec4(0,0.01,0,0), baseRadius) - dist,
        sdHypersphere(p4_sample + vec4(0,0,0.01,0), baseRadius) - dist
      ));
      normal_approx = (inverse(mat3(rot_mat)) * normal_approx); // transform normal back

      float diffuse = max(0.0, dot(normal_approx, normalize(vec3(1,1,1)))) * 0.7 + 0.3;

      col = shellColor * diffuse;

      // --- Add some glow/fresnel for shells ---
      float fresnel = pow(1.0 - dot(normalize(rd_base), normal_approx), 2.0);
      col += shellColor * fresnel * 0.5 * (0.5 + u_audioMid * 0.5);

      break;
    }

    t += dist * 0.7; // March along the ray (0.7 is a safety factor)
    if (t > 20.0) break; // Max distance
  }

  gl_FragColor = vec4(col, 1.0);
}
