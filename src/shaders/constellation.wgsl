// SPDX-License-Identifier: MIT
// Skill constellation node graph rendering

struct Node {
  position: vec3<f32>,
  color: vec3<f32>,
  size: f32,
  pulsePhase: f32,
}

struct Edge {
  nodeA: u32,
  nodeB: u32,
}

@group(0) @binding(0) var<storage, read> nodes: array<Node>;
@group(0) @binding(1) var<storage, read> edges: array<Edge>;
@group(0) @binding(2) var<uniform> camera: CameraUniform;
@group(0) @binding(3) var<uniform> timeUniform: vec4<f32>;

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) alpha: f32,
}

// Node rendering (as sprites)
@vertex
fn nodeVert(@builtin(vertex_index) vi: u32) -> VertexOutput {
  let idx = vi / 4u;
  let corner = vi % 4u;

  let node = nodes[idx];
  let t = timeUniform.x;
  let pulse = 0.7 + 0.3 * sin(t * 1.5 + node.pulsePhase);
  let size = node.size * pulse;

  let corners = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0)
  );

  let offset = corners[corner] * size * 0.1;
  let worldPos = node.position + vec3<f32>(offset.x, offset.y, 0.0);
  let clipPos = camera.viewProjection * vec4<f32>(worldPos, 1.0);

  var out: VertexOutput;
  out.position = clipPos;
  out.color = node.color;
  out.alpha = 1.0;
  return out;
}

@fragment
fn nodeFrag(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}

// Edge rendering (as lines)
@vertex
fn edgeVert(@builtin(vertex_index) vi: u32) -> VertexOutput {
  let edgeIdx = vi / 2u;
  let vertexId = vi % 2u;

  let edge = edges[edgeIdx];
  let nodeA = nodes[edge.nodeA];
  let nodeB = nodes[edge.nodeB];
  let pos = vertexId == 0u ? nodeA.position : nodeB.position;
  let color = mix(nodeA.color, nodeB.color, 0.5);

  var out: VertexOutput;
  out.position = camera.viewProjection * vec4<f32>(pos, 1.0);
  out.color = color;
  out.alpha = 0.3;
  return out;
}

@fragment
fn edgeFrag(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
