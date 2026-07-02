// SPDX-License-Identifier: MIT
// Fragment shader with bloom-supporting output (RGBA16F)

@group(2) @binding(0) var<uniform> timeUniform: vec4<f32>;

struct Light {
  position: vec3<f32>,
  color: vec3<f32>,
  intensity: f32,
}

@group(2) @binding(1) var<storage, read> lights: array<Light>;

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) color: vec3<f32>,
  @location(3) emission: vec3<f32>,
  @location(4) id: f32,
}

struct LightResult {
  diffuse: vec3<f32>,
  specular: vec3<f32>,
}

fn calculateLight(normal: vec3<f32>, viewDir: vec3<f32>, lightPos: vec3<f32>, lightColor: vec3<f32>, intensity: f32) -> LightResult {
  let lightDir = normalize(lightPos - VertexOutput.worldPos);
  let halfVec = normalize(lightDir + viewDir);

  let nDotL = max(dot(normal, lightDir), 0.0);
  let nDotH = max(dot(normal, halfVec), 0.0);

  let distance = length(lightPos - VertexOutput.worldPos);
  let attenuation = 1.0 / (1.0 + distance * distance * 0.1);

  var result: LightResult;
  result.diffuse = lightColor * nDotL * intensity * attenuation;
  result.specular = lightColor * pow(nDotH, 64.0) * 0.5 * intensity * attenuation;
  return result;
}

@fragment
fn main(in: VertexOutput) -> @location(0) vec4<f32> {
  let viewDir = normalize(cameraPos.xyz - in.worldPos);
  let normal = normalize(in.worldNormal);

  // Accumulate lighting
  var diffuse = vec3<f32>(0.0);
  var specular = vec3<f32>(0.0);

  // Ambient
  diffuse += 0.1 * in.color;

  // Main directional light (from above)
  let sunDir = normalize(vec3<f32>(0.5, 1.0, 0.3));
  let sunDiff = max(dot(normal, sunDir), 0.0);
  diffuse += sunDiff * vec3<f32>(0.6, 0.6, 0.8) * in.color;
  let sunHalf = normalize(sunDir + viewDir);
  specular += pow(max(dot(normal, sunHalf), 0.0), 64.0) * vec3<f32>(0.8, 0.8, 1.0) * 0.3;

  // Rim light
  let rim = 1.0 - max(dot(viewDir, normal), 0.0);
  let rimLight = pow(rim, 3.0) * 0.4;

  // Fresnel
  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);

  let finalColor = diffuse + specular + vec3<f32>(rimLight * 0.3) + in.emission * 0.5 + fresnel * vec3<f32>(0.5, 0.4, 0.8) * 0.2;

  return vec4<f32>(finalColor, 1.0);
}
