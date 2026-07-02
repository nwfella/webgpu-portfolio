// SPDX-License-Identifier: MIT
// Particle rendering vertex/fragment shaders

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) size: f32,
}

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  life: f32,
  seed: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> camera: CameraUniform;

// Color palettes
fn palette(t: f32) -> vec3<f32> {
  let a = vec3<f32>(0.5, 0.5, 0.5);
  let b = vec3<f32>(0.5, 0.5, 0.5);
  let c = vec3<f32>(1.0, 1.0, 1.0);
  let d = vec3<f32>(0.263, 0.416, 0.557);
  return a + b * cos(6.28318 * (c * t + d));
}

@vertex
fn main(@builtin(vertex_index) vi: u32) -> VertexOutput {
  let idx = vi / 4u;
  let corner = vi % 4u;

  if (idx >= arrayLength(&particles)) {
    var out: VertexOutput;
    out.position = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    out.color = vec4<f32>(0.0);
    out.size = 0.0;
    return out;
  }

  let p = particles[idx];

  // Size attenuation based on distance
  let size = 0.05 * (1.0 + p.seed * 0.5);

  // Corner offsets for a quad
  let corners = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, 1.0)
  );

  let offset = corners[corner] * size;
  let worldPos = p.position.xyz + vec3<f32>(offset.x, offset.y, 0.0);
  let clipPos = camera.viewProjection * vec4<f32>(worldPos, 1.0);
  clipPos.x += offset.x * clipPos.w * 0.001;
  clipPos.y += offset.y * clipPos.w * 0.001;

  var out: VertexOutput;
  out.position = clipPos;
  out.color = vec4<f32>(palette(p.seed), p.life * 0.5);
  out.size = size;
  return out;
}

@fragment
fn main(in: VertexOutput) -> @location(0) vec4<f32> {
  if (in.color.a < 0.01) { discard; }
  return in.color;
}
