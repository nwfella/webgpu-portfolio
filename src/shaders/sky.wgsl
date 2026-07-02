// SPDX-License-Identifier: MIT
// Procedural sky/nebula fragment shader

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

@group(0) @binding(0) var<uniform> camera: CameraUniform;
@group(0) @binding(1) var<uniform> timeUniform: vec4<f32>;

fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2<f32>(0.0, 0.0)), hash(i + vec2<f32>(1.0, 0.0)), u.x),
    mix(hash(i + vec2<f32>(0.0, 1.0)), hash(i + vec2<f32>(1.0, 1.0)), u.x),
    u.y
  );
}

fn fbm(p: vec2<f32>) -> f32 {
  var val = 0.0;
  var amp = 0.5;
  var freq = 1.0;
  var pos = p;
  for (var i = 0u; i < 5u; i++) {
    val += amp * noise(pos * freq);
    freq *= 2.0;
    amp *= 0.5;
    pos += vec2<f32>(1.7, 9.2);
  }
  return val;
}

fn nebula(p: vec2<f32>, t: f32) -> f32 {
  let n1 = fbm(p + t * 0.01);
  let n2 = fbm(p * 2.0 - t * 0.008 + vec2<f32>(5.2, 1.3));
  return n1 * 0.6 + n2 * 0.4;
}

@fragment
fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = (pos.xy / vec2<f32>(1920.0, 1080.0)) * 2.0 - 1.0;
  let aspect = vec2<f32>(1920.0 / 1080.0, 1.0);
  let p = uv * aspect;

  let t = timeUniform.x;

  // Stars
  let starField = hash(floor(p * 100.0 + vec2<f32>(t * 0.001)));
  let star = step(0.997, starField) * 0.8;

  // Nebula clouds
  let n1 = nebula(p * 2.0 + vec2<f32>(0.0, t * 0.005), t);
  let n2 = nebula(p * 3.0 + vec2<f32>(5.0, t * 0.003), t + 100.0);

  // Color palette based on nebula density
  let color1 = vec3<f32>(0.1, 0.05, 0.2);    // deep dark purple
  let color2 = vec3<f32>(0.4, 0.15, 0.5);    // purple
  let color3 = vec3<f32>(0.8, 0.3, 0.6);     // pink
  let color4 = vec3<f32>(0.2, 0.1, 0.4);     // dark purple

  let nebulaColor = mix(
    mix(color1, color2, n1),
    mix(color3, color4, n2),
    abs(sin(t * 0.02))
  );

  // Vignette
  let vignette = 1.0 - dot(uv, uv) * 0.3;

  // Gradient from dark blue-black at top to slightly lighter at bottom
  let gradient = mix(vec3<f32>(0.05, 0.02, 0.08), vec3<f32>(0.1, 0.05, 0.15), uv.y * 0.5 + 0.5);

  let finalColor = gradient + nebulaColor * 0.3 + vec3<f32>(star);

  return vec4<f32>(finalColor * vignette, 1.0);
}
