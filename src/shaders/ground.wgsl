// SPDX-License-Identifier: MIT
// Reflective ground plane

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

@group(0) @binding(0) var<uniform> camera: CameraUniform;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

@vertex
fn main(@location(0) position: vec3<f32>, @location(1) uv: vec2<f32>) -> VertexOutput {
  var out: VertexOutput;
  out.position = camera.viewProjection * vec4<f32>(position, 1.0);
  out.worldPos = position;
  out.uv = uv;
  return out;
}

@fragment
fn main(in: VertexOutput) -> @location(0) vec4<f32> {
  // Simple reflective ground: dark with subtle grid
  let grid = abs(fract(in.uv * 10.0) - 0.5);
  let gridLine = 1.0 - step(0.45, grid.x) * step(0.45, grid.y);

  let fresnel = pow(1.0 - abs(in.worldPos.y / length(in.worldPos - camera.cameraPos.xyz)), 2.0);
  let baseColor = vec3<f32>(0.04, 0.02, 0.06);
  let reflectionTint = vec3<f32>(0.3, 0.2, 0.5);

  let color = mix(baseColor, reflectionTint, fresnel * 0.3) + vec3<f32>(gridLine * 0.05);
  return vec4<f32>(color, 0.8);
}
