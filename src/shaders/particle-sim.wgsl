// SPDX-License-Identifier: MIT
// Particle simulation compute shader — 65K particles with physics

struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  life: f32,
  seed: f32,
}

struct SimParams {
  deltaTime: f32,
  attractorX: f32,
  attractorY: f32,
  attractorZ: f32,
  time: f32,
  pad: vec3<f32>,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;

// Hash from particle seed
fn hash(v: vec2<f32>) -> f32 {
  return fract(sin(dot(v, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let idx = id.x;
  if (idx >= arrayLength(&particles)) { return; }

  var p = particles[idx];

  // Reset dead particles
  if (p.life <= 0.0) {
    let theta = hash(vec2<f32>(f32(idx), 0.0)) * 6.2832;
    let phi = acos(2.0 * hash(vec2<f32>(f32(idx), 1.0)) - 1.0);
    let r = 3.0 + hash(vec2<f32>(f32(idx), 2.0)) * 5.0;
    p.position = vec4<f32>(
      r * sin(phi) * cos(theta),
      (hash(vec2<f32>(f32(idx), 3.0)) - 0.5) * 4.0,
      r * sin(phi) * sin(theta),
      1.0
    );
    p.velocity = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    p.life = 0.5 + hash(vec2<f32>(f32(idx), 4.0)) * 2.0;
    p.seed = hash(vec2<f32>(f32(idx), 5.0));
    particles[idx] = p;
    return;
  }

  // Forces
  let attractor = vec3<f32>(params.attractorX, params.attractorY, params.attractorZ);
  let toAttractor = attractor - p.position.xyz;
  let dist = length(toAttractor);
  let gravityForce = dist > 0.1 ? normalize(toAttractor) * 0.5 / (1.0 + dist * 0.3) : vec3<f32>(0.0);

  // Orbital force (tangential)
  let up = vec3<f32>(0.0, 1.0, 0.0);
  let tangent = normalize(cross(toAttractor, up));
  let orbitalForce = tangent * 0.3;

  // Noise-based wandering
  let noiseAngle = hash(vec2<f32>(p.seed, params.time * 0.1)) * 6.2832;
  let wanderForce = vec3<f32>(cos(noiseAngle), sin(noiseAngle) * 0.5, sin(noiseAngle)) * 0.2;

  // Apply forces
  p.velocity.xyz += (gravityForce + orbitalForce + wanderForce) * params.deltaTime;
  p.velocity.xyz *= 0.98; // damping
  p.position.xyz += p.velocity.xyz * params.deltaTime;

  // Age
  p.life -= params.deltaTime * (0.1 + 0.3 * p.seed);

  particles[idx] = p;
}
