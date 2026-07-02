// SPDX-License-Identifier: MIT
// Common WGSL utilities, structs, and noise functions

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

struct PointLight {
  position: vec3<f32>,
  color: vec3<f32>,
  intensity: f32,
}

struct TimeUniform {
  time: f32,
  delta: f32,
}

// Simplex-like noise (hash-based)
fn hash3(p: vec3<f32>) -> f32 {
  let n = dot(p, vec3<f32>(127.1, 311.7, 74.7));
  return fract(sin(n) * 43758.5453123);
}

fn smoothNoise(p: vec3<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(hash3(i + vec3<f32>(0,0,0)), hash3(i + vec3<f32>(1,0,0)), u.x),
      mix(hash3(i + vec3<f32>(0,1,0)), hash3(i + vec3<f32>(1,1,0)), u.x),
      u.y
    ),
    mix(
      mix(hash3(i + vec3<f32>(0,0,1)), hash3(i + vec3<f32>(1,0,1)), u.x),
      mix(hash3(i + vec3<f32>(0,1,1)), hash3(i + vec3<f32>(1,1,1)), u.x),
      u.y
    ),
    u.z
  );
}

fn fbm(p: vec3<f32>, octaves: u32) -> f32 {
  var val = 0.0;
  var amp = 0.5;
  var freq = 1.0;
  var pos = p;
  for (var i = 0u; i < octaves; i++) {
    val += amp * smoothNoise(pos * freq);
    freq *= 2.0;
    amp *= 0.5;
    pos += vec3<f32>(1.7, 9.2, 5.1);
  }
  return val;
}
