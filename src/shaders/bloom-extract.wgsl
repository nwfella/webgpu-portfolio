// SPDX-License-Identifier: MIT
// Bloom: bright-pass extraction

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<rgba16float, write>;

struct BloomParams {
  threshold: f32,
  intensity: f32,
}

@group(0) @binding(2) var<uniform> params: BloomParams;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let size = textureDimensions(src);
  if (id.x >= size.x || id.y >= size.y) { return; }
  let coord = vec2<i32>(id.xy);
  let color = textureLoad(src, coord, 0);

  // Luminance-based bright pass
  let luminance = dot(color.xyz, vec3<f32>(0.2126, 0.7152, 0.0722));
  let bright = max(0.0, luminance - params.threshold);
  let bloom = color * bright * params.intensity / max(luminance, 0.001);

  textureStore(dst, coord, vec4<f32>(bloom.xyz, 1.0));
}
