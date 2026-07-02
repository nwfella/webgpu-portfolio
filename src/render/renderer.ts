import { DeviceManager } from '../core/device';
import { Camera } from '../core/camera';
import { InputState } from '../core/input';
import { ParticleSystem } from '../compute/particle-system';
import { SHADERS } from './shader-sources';
import { Mesh, createSphere, createTorus, createTorusKnot, createGround } from './geometry';

/** Portfolio object descriptor */
export interface PortfolioObject {
  mesh: Mesh;
  position: [number, number, number];
  rotation: [number, number];
  scale: number;
  color: [number, number, number];
  emission: [number, number, number];
  id: number;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  uniformBuffer: GPUBuffer;
}

/** Full-screen textured quad vertex shader */
const FULLSCREEN_VS = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn main(@builtin(vertex_index) vi: u32) -> VertexOutput {
  let pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  let uv = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(2.0, 0.0),
    vec2<f32>(0.0, 2.0)
  );
  var out: VertexOutput;
  out.position = vec4<f32>(pos[vi], 0.0, 1.0);
  out.uv = uv[vi];
  return out;
}
`;

/** Tonemap blit fragment shader (HDR → swapchain) */
const BLIT_FS = `
@group(0) @binding(0) var hdrTex: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let hdr = textureSample(hdrTex, samp, uv).xyz;
  // Reinhard tonemap
  let tonemapped = hdr / (hdr + vec3<f32>(1.0));
  // Gamma
  let gamma = pow(tonemapped, vec3<f32>(1.0 / 2.2));
  return vec4<f32>(gamma, 1.0);
}
`;

/** Main render orchestrator */
export class Renderer {
  private depthTexture: GPUTexture | null = null;
  private hdrTexture: GPUTexture | null = null;
  public particleSystem: ParticleSystem;
  public objects: PortfolioObject[] = [];

  private groundMesh: Mesh;
  private groundVB: GPUBuffer;
  private groundIB: GPUBuffer;

  private cameraUniformBuffer: GPUBuffer;
  private objectPipeline: GPURenderPipeline;
  private groundPipeline: GPURenderPipeline;
  private blitPipeline: GPURenderPipeline;
  private blitSampler: GPUSampler;
  private blitBindGroupLayout: GPUBindGroupLayout;
  private groundBindGroupLayout: GPUBindGroupLayout;

  constructor(private deviceManager: DeviceManager) {
    const device = deviceManager.device!;
    this.particleSystem = new ParticleSystem(deviceManager);

    // Allocate constant resources in constructor
    this.cameraUniformBuffer = device.createBuffer({
      size: 80,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Ground geometry
    this.groundMesh = createGround(16, 40);
    this.groundVB = this.createVertexBuffer(this.groundMesh);
    this.groundIB = this.createIndexBuffer(this.groundMesh);

    // Bind group layouts
    this.groundBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      ],
    });

    this.blitBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      ],
    });

    // Sampler for blit
    this.blitSampler = device.createSampler({
      minFilter: 'linear',
      magFilter: 'linear',
    });

    // Object pipeline (will be built properly in init())
    const vertMod = device.createShaderModule({ code: SHADERS.objectVert });
    const fragMod = device.createShaderModule({ code: SHADERS.objectFrag });

    const objectBGL = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
      ],
    });

    this.objectPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [objectBGL] }),
      vertex: {
        module: vertMod,
        entryPoint: 'main',
        buffers: [{
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' },
          ],
          arrayStride: 24,
        }],
      },
      fragment: {
        module: fragMod,
        entryPoint: 'main',
        targets: [{ format: 'rgba16float' }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'greater' },
    });

    // Ground pipeline
    const groundMod = device.createShaderModule({ code: SHADERS.ground });
    this.groundPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [this.groundBindGroupLayout] }),
      vertex: {
        module: groundMod,
        entryPoint: 'main',
        buffers: [{
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x2' },
          ],
          arrayStride: 20,
        }],
      },
      fragment: {
        module: groundMod,
        entryPoint: 'main',
        targets: [{ format: 'rgba16float', blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        } }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'greater' },
    });

    // Blit pipeline (fullscreen triangle)
    const blitVs = device.createShaderModule({ code: FULLSCREEN_VS });
    const blitFs = device.createShaderModule({ code: BLIT_FS });
    this.blitPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [this.blitBindGroupLayout] }),
      vertex: { module: blitVs, entryPoint: 'main' },
      fragment: { module: blitFs, entryPoint: 'main', targets: [{ format: this.deviceManager.format }] },
      primitive: { topology: 'triangle-list' },
    });
  }

  async init(): Promise<void> {
    await this.particleSystem.init();
    this.createPortfolioObjects(this.deviceManager.device!);
    this.resize();
  }

  private createPortfolioObjects(device: GPUDevice): void {
    const projectData = [
      { type: 'sphere', color: [0.4, 0.2, 0.8] as [number,number,number], emission: [0.2, 0.1, 0.4] as [number,number,number], pos: [-3, 0.5, 0] },
      { type: 'torus', color: [0.8, 0.2, 0.3] as [number,number,number], emission: [0.4, 0.1, 0.15] as [number,number,number], pos: [0, 0.5, -3] },
      { type: 'knot', color: [0.2, 0.7, 0.5] as [number,number,number], emission: [0.1, 0.35, 0.25] as [number,number,number], pos: [3, 0.5, 0] },
      { type: 'sphere', color: [0.9, 0.6, 0.1] as [number,number,number], emission: [0.45, 0.3, 0.05] as [number,number,number], pos: [0, 0.5, 3] },
      { type: 'torus', color: [0.1, 0.4, 0.8] as [number,number,number], emission: [0.05, 0.2, 0.4] as [number,number,number], pos: [-2.5, 0.5, 2.5] },
      { type: 'knot', color: [0.7, 0.3, 0.7] as [number,number,number], emission: [0.35, 0.15, 0.35] as [number,number,number], pos: [2.5, 0.5, -2.5] },
    ];

    for (let i = 0; i < projectData.length; i++) {
      const d = projectData[i];
      let mesh: Mesh;
      switch (d.type) {
        case 'sphere': mesh = createSphere(0.5, 24, 16); break;
        case 'torus': mesh = createTorus(0.5, 0.2, 12, 24); break;
        case 'knot': mesh = createTorusKnot(0.5, 0.15, 2, 3, 20); break;
        default: mesh = createSphere(0.5, 16, 12);
      }
      this.objects.push({
        mesh,
        position: d.pos,
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        scale: 1,
        color: d.color,
        emission: d.emission,
        id: i,
        vertexBuffer: this.createVertexBuffer(mesh),
        indexBuffer: this.createIndexBuffer(mesh),
        uniformBuffer: device.createBuffer({
          size: 80,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        }),
      });
    }
  }

  private createVertexBuffer(mesh: Mesh): GPUBuffer {
    const data = new Float32Array(mesh.vertexCount * 6);
    for (let i = 0; i < mesh.vertexCount; i++) {
      data[i * 6] = mesh.positions[i * 3];
      data[i * 6 + 1] = mesh.positions[i * 3 + 1];
      data[i * 6 + 2] = mesh.positions[i * 3 + 2];
      data[i * 6 + 3] = mesh.normals[i * 3];
      data[i * 6 + 4] = mesh.normals[i * 3 + 1];
      data[i * 6 + 5] = mesh.normals[i * 3 + 2];
    }
    const device = this.deviceManager.device!;
    const buf = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buf, 0, data);
    return buf;
  }

  private createIndexBuffer(mesh: Mesh): GPUBuffer {
    const device = this.deviceManager.device!;
    const buf = device.createBuffer({
      size: mesh.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buf, 0, mesh.indices);
    return buf;
  }

  /** Handle resize — recreate HDR + depth textures */
  resize(): void {
    const device = this.deviceManager.device!;
    const w = this.deviceManager.width;
    const h = this.deviceManager.height;
    if (w < 2 || h < 2) return;

    if (this.depthTexture) this.depthTexture.destroy();
    if (this.hdrTexture) this.hdrTexture.destroy();

    this.depthTexture = device.createTexture({
      size: { width: w, height: h },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.hdrTexture = device.createTexture({
      size: { width: w, height: h },
      format: 'rgba16float',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
  }

  /** Render a complete frame */
  render(camera: Camera, time: number, delta: number, input: InputState): void {
    const device = this.deviceManager.device!;
    const w = this.deviceManager.width;
    const h = this.deviceManager.height;

    this.deviceManager.resize();
    this.resize();

    // Write camera uniform data
    const cameraData = camera.getUniforms();
    device.queue.writeBuffer(this.cameraUniformBuffer, 0, cameraData);

    const cmd = device.createCommandEncoder();

    // ---- 1. Particle simulation (compute) ----
    const attractor: [number, number, number] = [
      (input.x / window.innerWidth - 0.5) * 8,
      -(input.y / window.innerHeight - 0.5) * 4 + 1,
      0,
    ];
    this.particleSystem.simulate(cmd, delta, attractor, time);

    // ---- 2. HDR scene render pass ----
    const hdrView = this.hdrTexture!.createView();
    const depthView = this.depthTexture!.createView();
    const hdrPass = cmd.beginRenderPass({
      colorAttachments: [{
        view: hdrView,
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    // Render each portfolio object
    for (const obj of this.objects) {
      const ry = obj.rotation[0] + time * 0.3;
      const rx = obj.rotation[1] + time * 0.2;
      const m = new Float32Array(28);
      // Model matrix (column-major)
      m[0] = obj.scale; m[1] = 0; m[2] = 0; m[3] = 0;
      m[4] = 0; m[5] = Math.cos(rx) * obj.scale; m[6] = Math.sin(rx) * obj.scale; m[7] = 0;
      m[8] = 0; m[9] = -Math.sin(rx) * obj.scale; m[10] = Math.cos(rx) * obj.scale; m[11] = 0;
      m[12] = obj.position[0]; m[13] = obj.position[1]; m[14] = obj.position[2]; m[15] = 1;
      // Color
      m[16] = obj.color[0]; m[17] = obj.color[1]; m[18] = obj.color[2]; m[19] = 1;
      // Emission
      m[20] = obj.emission[0]; m[21] = obj.emission[1]; m[22] = obj.emission[2]; m[23] = 0;
      // ID
      m[24] = obj.id; m[25] = 0; m[26] = 0; m[27] = 0;

      device.queue.writeBuffer(obj.uniformBuffer, 0, m);

      const bg = device.createBindGroup({
        layout: this.objectPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
          { binding: 1, resource: { buffer: obj.uniformBuffer } },
          { binding: 2, resource: { buffer: this.cameraUniformBuffer } },
        ],
      });

      hdrPass.setPipeline(this.objectPipeline);
      hdrPass.setBindGroup(0, bg);
      hdrPass.setVertexBuffer(0, obj.vertexBuffer);
      hdrPass.setIndexBuffer(obj.indexBuffer, 'uint16');
      hdrPass.drawIndexed(obj.mesh.indexCount);
    }

    // Ground plane
    const groundBG = device.createBindGroup({
      layout: this.groundBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
      ],
    });
    hdrPass.setPipeline(this.groundPipeline);
    hdrPass.setBindGroup(0, groundBG);
    hdrPass.setVertexBuffer(0, this.groundVB);
    hdrPass.setIndexBuffer(this.groundIB, 'uint16');
    hdrPass.drawIndexed(this.groundMesh.indexCount);

    hdrPass.end();

    // ---- 3. Particle render pass (draws to HDR texture) ----
    const particlePass = cmd.beginRenderPass({
      colorAttachments: [{
        view: hdrView,
        loadOp: 'load',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: depthView,
        depthLoadOp: 'load',
        depthStoreOp: 'store',
      },
    });
    this.particleSystem.render(particlePass, cameraData);
    particlePass.end();

    // ---- 4. Blit HDR → swap chain (with tonemap) ----
    const swapView = this.deviceManager.context!.getCurrentTexture().createView();
    const blitBG = device.createBindGroup({
      layout: this.blitBindGroupLayout,
      entries: [
        { binding: 0, resource: hdrView },
        { binding: 1, resource: this.blitSampler },
      ],
    });
    const swapPass = cmd.beginRenderPass({
      colorAttachments: [{
        view: swapView,
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0.02, g: 0.01, b: 0.04, a: 1 },
      }],
    });
    swapPass.setPipeline(this.blitPipeline);
    swapPass.setBindGroup(0, blitBG);
    swapPass.draw(3); // fullscreen triangle = 3 vertices
    swapPass.end();

    device.queue.submit([cmd.finish()]);
  }
}
