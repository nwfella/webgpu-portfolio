// SPDX-License-Identifier: MIT
// Separable gaussian blur (compute) — horizontal and vertical

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<rgba16float, write>;

struct BlurParams {
  direction: vec2<f32>,  // (1,0) for horizontal, (0,1) for vertical
  radius: f32,
  sigma: f32,
}

@group(0) @binding(2) var<uniform> params: BlurParams;

// Gaussian kernel weights (13-tap)
fn gaussian(x: f32, sigma: f32) -> f32 {
  return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * 3.14159) * sigma);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let size = textureDimensions(src);
  if (id.x >= size.x || id.y >= size.y) { return; }

  let center = vec2<i32>(id.xy);
  let centerF = vec2<f32>(f32(center.x), f32(center.y));
  var result = vec3<f32>(0.0);
  var totalWeight = 0.0;

  let halfRadius = i32(params.radius);
  let sigma = params.sigma;

  for (var i = -halfRadius; i <= halfRadius; i++) {
    let offset = vec2<f32>(f32(i) * params.direction.x, f32(i) * params.direction.y);
    let samplePos = vec2<i32>(i32(centerF.x + offset.x), i32(centerF.y + offset.y));

    // Clamp to texture bounds
    let clampedPos = vec2<i32>(
      min(max(samplePos.x, 0), i32(size.x) - 1),
      min(max(samplePos.y, 0), i32(size.y) - 1)
    );

    let sample = textureLoad(src, clampedPos, 0);
    let weight = gaussian(f32(i), sigma);
    result += sample.xyz * weight;
    totalWeight += weight;
  }

  result /= totalWeight;
  textureStore(dst, center, vec4<f32>(result, 1.0));
}
