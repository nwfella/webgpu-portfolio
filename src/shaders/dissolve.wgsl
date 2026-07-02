// SPDX-License-Identifier: MIT
// Noise dissolve transition effect

struct DissolveUniform {
  progress: f32,  // 0→1
  softness: f32,
}

@group(0) @binding(0) var srcA: texture_2d<f32>;
@group(0) @binding(1) var srcB: texture_2d<f32>;
@group(0) @binding(2) var noiseTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: DissolveUniform;
@group(0) @binding(4) var dst: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(5) var sampler_: sampler;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let size = textureDimensions(srcA);
  if (id.x >= size.x || id.y >= size.y) { return; }
  let coord = vec2<i32>(id.xy);
  let uv = (vec2<f32>(f32(coord.x), f32(coord.y)) + 0.5) / vec2<f32>(f32(size.x), f32(size.y));

  let noiseVal = textureSampleLevel(noiseTex, sampler_, uv, 0.0).r;
  let threshold = params.progress;
  let mixFactor = smoothstep(threshold - params.softness, threshold + params.softness, noiseVal);

  let colorA = textureLoad(srcA, coord, 0);
  let colorB = textureLoad(srcB, coord, 0);
  let result = mix(colorA, colorB, mixFactor);

  textureStore(dst, coord, result);
}
