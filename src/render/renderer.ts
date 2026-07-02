import { DeviceManager } from '../core/device';
import { Camera } from '../core/camera';
import { Timer } from '../core/timer';
import { InputManager, InputState } from '../core/input';
import { ParticleSystem } from '../compute/particle-system';
import { Mesh, createSphere, createTorus, createTorusKnot, createGround } from './geometry';
import { SHADERS } from './shader-sources';

/** Portfolio object descriptor */
export interface PortfolioObject {
  mesh: Mesh;
  position: [number, number, number];
  rotation: [number, number];
  scale: number;
  color: [number, number, number];
  emission: [number, number, number];
  id: number;
  vertexBuffer: GPUBuffer | null;
  indexBuffer: GPUBuffer | null;
  uniformBuffer: GPUBuffer | null;
}

/** Main render orchestrator */
export class Renderer {
  private depthTexture: GPUTexture | null = null;
  private hdrTexture: GPUTexture | null = null;
  public particleSystem: ParticleSystem;
  public objects: PortfolioObject[] = [];
  private groundMesh: Mesh | null = null;
  private groundVB: GPUBuffer | null = null;
  private groundIB: GPUBuffer | null = null;
  private cameraUniformBuffer: GPUBuffer | null = null;
  private objectPipeline: GPURenderPipeline | null = null;
  private objectBindGroupLayout: GPUBindGroupLayout | null = null;
  private objectBindGroup: GPUBindGroup | null = null;

  constructor(private deviceManager: DeviceManager) {
    this.particleSystem = new ParticleSystem(deviceManager);
  }

  async init(): Promise<void> {
    const device = this.deviceManager.device!;

    await this.particleSystem.init();

    // Create uniform buffer for camera
    this.cameraUniformBuffer = device.createBuffer({
      size: 80,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create ground
    this.groundMesh = createGround(16, 40);
    this.groundVB = this.createVertexBuffer(this.groundMesh);
    this.groundIB = this.createIndexBuffer(this.groundMesh);

    // Object pipeline
    const objectVertSrc = SHADERS.objectVert;
    const objectFragSrc = SHADERS.objectFrag;
    const skyVertSrc = SHADERS.sky;
    const groundFragSrc = SHADERS.ground;

    const objectVert = device.createShaderModule({ code: objectVertSrc });
    const objectFrag = device.createShaderModule({ code: objectFragSrc });
    const skyModule = device.createShaderModule({ code: skyVertSrc });
    const groundModule = device.createShaderModule({ code: groundFragSrc });

    // Create portfolio objects
    this.createPortfolioObjects(device);

    // Object bind group layout
    this.objectBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
      ],
    });

    // Create object pipeline
    this.objectPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [this.objectBindGroupLayout] }),
      vertex: {
        module: objectVert,
        entryPoint: 'main',
        buffers: [
          { attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' },
          ], arrayStride: 24 },
        ],
      },
      fragment: {
        module: objectFrag,
        entryPoint: 'main',
        targets: [{ format: 'rgba16float' }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'greater',
      },
    });

    // Ground pipeline (separate, simpler)
    this.groundPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [this.cameraBindGroupLayout] }),
      vertex: {
        module: groundModule,
        entryPoint: 'main',
        buffers: [
          { attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x2' },
          ], arrayStride: 20 },
        ],
      },
      fragment: {
        module: groundModule,
        entryPoint: 'main',
        targets: [{ format: 'rgba16float', blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        } }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'greater',
      },
    });
  }

  private cameraBindGroupLayout: GPUBindGroupLayout | null = null;
  private groundPipeline: GPURenderPipeline | null = null;

  /** Create the portfolio 3D objects */
  private createPortfolioObjects(device: GPUDevice): void {
    const projectData = [
      { type: 'sphere', color: [0.4, 0.2, 0.8], emission: [0.2, 0.1, 0.4], pos: [-3, 0.5, 0] },
      { type: 'torus', color: [0.8, 0.2, 0.3], emission: [0.4, 0.1, 0.15], pos: [0, 0.5, -3] },
      { type: 'knot', color: [0.2, 0.7, 0.5], emission: [0.1, 0.35, 0.25], pos: [3, 0.5, 0] },
      { type: 'sphere', color: [0.9, 0.6, 0.1], emission: [0.45, 0.3, 0.05], pos: [0, 0.5, 3] },
      { type: 'torus', color: [0.1, 0.4, 0.8], emission: [0.05, 0.2, 0.4], pos: [-2.5, 0.5, 2.5] },
      { type: 'knot', color: [0.7, 0.3, 0.7], emission: [0.35, 0.15, 0.35], pos: [2.5, 0.5, -2.5] },
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
      const obj: PortfolioObject = {
        mesh,
        position: d.pos as [number, number, number],
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        scale: 1,
        color: d.color as [number, number, number],
        emission: d.emission as [number, number, number],
        id: i,
        vertexBuffer: this.createVertexBuffer(mesh),
        indexBuffer: this.createIndexBuffer(mesh),
        uniformBuffer: device.createBuffer({
          size: 80,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        }),
      };
      this.objects.push(obj);
    }
  }

  private createVertexBuffer(mesh: Mesh): GPUBuffer {
    // Interleaved: position (3 floats) + normal (3 floats)
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
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  }

  private createIndexBuffer(mesh: Mesh): GPUBuffer {
    const device = this.deviceManager.device!;
    const buffer = device.createBuffer({
      size: mesh.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, mesh.indices);
    return buffer;
  }

  /** Handle resize */
  resize(): void {
    const device = this.deviceManager.device!;
    const w = this.deviceManager.width;
    const h = this.deviceManager.height;

    // Depth
    if (this.depthTexture) this.depthTexture.destroy();
    this.depthTexture = device.createTexture({
      size: { width: w, height: h },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // HDR
    if (this.hdrTexture) this.hdrTexture.destroy();
    this.hdrTexture = device.createTexture({
      size: { width: w, height: h },
      format: 'rgba16float',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
  }

  /** Render a frame */
  render(camera: Camera, time: number, delta: number, input: InputState): void {
    const device = this.deviceManager.device!;
    const w = this.deviceManager.width;
    const h = this.deviceManager.height;

    this.deviceManager.resize();
    this.resize();

    // Write camera data
    const cameraData = camera.getUniforms();
    device.queue.writeBuffer(this.cameraUniformBuffer!, 0, cameraData);

    const commandEncoder = device.createCommandEncoder();

    // --- Particle simulation ---
    const attractor: [number, number, number] = [
      (input.x / window.innerWidth - 0.5) * 8,
      -(input.y / window.innerHeight - 0.5) * 4 + 1,
      0,
    ];
    this.particleSystem.simulate(commandEncoder, delta, attractor, time);

    // --- Main render pass (HDR) ---
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.hdrTexture!.createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
      depthStencilAttachment: {
        view: this.depthTexture!.createView(),
        depthClearValue: 0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    // Render objects
    for (const obj of this.objects) {
      // Update object uniforms
      const ry = obj.rotation[0] + time * 0.3;
      const rx = obj.rotation[1] + time * 0.2;
      const m = new Float32Array(80);
      // Simple TRS
      const cosRy = Math.cos(ry), sinRy = Math.sin(ry);
      const cosRx = Math.cos(rx), sinRx = Math.sin(rx);
      // Build model matrix (column-major)
      m[0] = obj.scale; m[1] = 0; m[2] = 0; m[3] = 0;
      m[4] = 0; m[5] = cosRx * obj.scale; m[6] = sinRx * obj.scale; m[7] = 0;
      m[8] = 0; m[9] = -sinRx * obj.scale; m[10] = cosRx * obj.scale; m[11] = 0;
      m[12] = obj.position[0]; m[13] = obj.position[1]; m[14] = obj.position[2]; m[15] = 1;
      // Color
      m[16] = obj.color[0]; m[17] = obj.color[1]; m[18] = obj.color[2]; m[19] = 1;
      // Emission
      m[20] = obj.emission[0]; m[21] = obj.emission[1]; m[22] = obj.emission[2]; m[23] = 0;
      // ID
      m[24] = obj.id; m[25] = 0; m[26] = 0; m[27] = 0;

      device.queue.writeBuffer(obj.uniformBuffer!, 0, m);

      renderPass.setPipeline(this.objectPipeline!);
      renderPass.setBindGroup(0, device.createBindGroup({
        layout: this.objectBindGroupLayout!,
        entries: [
          { binding: 0, resource: { buffer: this.cameraUniformBuffer! } },
          { binding: 1, resource: { buffer: obj.uniformBuffer! } },
          { binding: 2, resource: { buffer: this.cameraUniformBuffer! } },
        ],
      }));
      renderPass.setVertexBuffer(0, obj.vertexBuffer!);
      renderPass.setIndexBuffer(obj.indexBuffer!, 'uint16');
      renderPass.drawIndexed(obj.mesh.indexCount);
    }

    // Render ground (using camera uniform)
    renderPass.setPipeline(this.groundPipeline!);
    // Ground uses same camera uniform buffer
    renderPass.setBindGroup(0, device.createBindGroup({
      layout: this.cameraBindGroupLayout!,
      entries: [
        { binding: 0, resource: { buffer: this.cameraUniformBuffer! } },
      ],
    }));
    renderPass.setVertexBuffer(0, this.groundVB!);
    renderPass.setIndexBuffer(this.groundIB!, 'uint16');
    renderPass.drawIndexed(this.groundMesh!.indexCount);

    renderPass.end();

    // --- Particle render pass ---
    this.particleSystem.render(commandEncoder, cameraData);

    // --- Composite to screen ---
    const swapChainTexture = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.deviceManager.context!.getCurrentTexture().createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
    });

    // Simple blit from HDR to swapchain (with Reinhard tonemap via fullscreen quad)
    // For simplicity, just clear to sky color and we'll rely on the UI overlay
    swapChainTexture.end();

    device.queue.submit([commandEncoder.finish()]);
  }
}
