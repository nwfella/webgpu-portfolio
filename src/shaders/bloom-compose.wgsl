// SPDX-License-Identifier: MIT
// Bloom compose: tonemap + blend HDR scene with bloom

@group(0) @binding(0) var hdrScene: texture_2d<f32>;
@group(0) @binding(1) var bloomTexture: texture_2d<f32>;
@group(0) @binding(2) var dst: texture_storage_2d<rgba8unorm, write>;

struct ComposeParams {
  bloomIntensity: f32,
  exposure: f32,
}

@group(0) @binding(3) var<uniform> params: ComposeParams;

fn reinhardToneMap(color: vec3<f32>) -> vec3<f32> {
  return color / (color + vec3<f32>(1.0));
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let size = textureDimensions(hdrScene);
  if (id.x >= size.x || id.y >= size.y) { return; }
  let coord = vec2<i32>(id.xy);

  let hdr = textureLoad(hdrScene, coord, 0).xyz * params.exposure;
  let bloom = textureLoad(bloomTexture, coord, 0).xyz * params.bloomIntensity;

  let combined = hdr + bloom;
  let tonemapped = reinhardToneMap(combined);

  textureStore(dst, coord, vec4<f32>(tonemapped, 1.0));
}
