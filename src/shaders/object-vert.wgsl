// SPDX-License-Identifier: MIT
// PBR-ish vertex shader for portfolio objects

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

struct ObjectUniform {
  modelMatrix: mat4x4<f32>,
  color: vec4<f32>,
  emissionColor: vec4<f32>,
  id: f32,
}

@group(0) @binding(0) var<uniform> camera: CameraUniform;
@group(1) @binding(0) var<uniform> object: ObjectUniform;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) color: vec3<f32>,
  @location(3) emission: vec3<f32>,
  @location(4) id: f32,
}

@vertex
fn main(input: VertexInput) -> VertexOutput {
  let worldPos = (object.modelMatrix * vec4<f32>(input.position, 1.0)).xyz;
  let worldNormal = normalize((object.modelMatrix * vec4<f32>(input.normal, 0.0)).xyz);

  var out: VertexOutput;
  out.clipPos = camera.viewProjection * vec4<f32>(worldPos, 1.0);
  out.worldPos = worldPos;
  out.worldNormal = worldNormal;
  out.color = object.color.xyz;
  out.emission = object.emissionColor.xyz;
  out.id = object.id;
  return out;
}
