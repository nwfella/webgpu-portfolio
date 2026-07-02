import { DeviceManager } from '../core/device';
import { SHADERS } from '../render/shader-sources';

const PARTICLE_COUNT = 65536;

/** GPU compute-shader particle system */
export class ParticleSystem {
  private simPipeline: GPUComputePipeline | null = null;
  private renderPipeline: GPURenderPipeline | null = null;
  private particleBuffer: GPUBuffer | null = null;
  private simParamsBuffer: GPUBuffer | null = null;
  private cameraBuffer: GPUBuffer | null = null;
  private simBindGroup: GPUBindGroup | null = null;
  private renderBindGroup: GPUBindGroup | null = null;

  constructor(private deviceManager: DeviceManager) {}

  async init(): Promise<void> {
    const device = this.deviceManager.device!;

    // Load shaders (bundled at build time via ?raw imports)
    const simCode = SHADERS.particleSim;
    const renderCode = SHADERS.particleRender;

    const simModule = device.createShaderModule({ code: simCode });
    const renderModule = device.createShaderModule({ code: renderCode });

    // Particle buffer: position.xyzw, velocity.xyzw, life, seed (each vec4 = 16 bytes)
    // Total per particle: 4×4 + 4 = 20 floats = 80 bytes. Using 2 vec4 + 1 vec2 = 72 bytes
    const particleData = new Float32Array(PARTICLE_COUNT * 10); // 10 floats per particle
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 10;
      // Position (random spherical distribution)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;
      particleData[idx] = r * Math.sin(phi) * Math.cos(theta);
      particleData[idx + 1] = (Math.random() - 0.5) * 4;
      particleData[idx + 2] = r * Math.sin(phi) * Math.sin(theta);
      particleData[idx + 3] = 1;
      // Velocity
      particleData[idx + 4] = 0;
      particleData[idx + 5] = 0;
      particleData[idx + 6] = 0;
      particleData[idx + 7] = 0;
      // Life
      particleData[idx + 8] = 0.5 + Math.random() * 2;
      // Seed
      particleData[idx + 9] = Math.random();
    }

    this.particleBuffer = device.createBuffer({
      size: particleData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.particleBuffer, 0, particleData);

    this.simParamsBuffer = device.createBuffer({
      size: 32, // 8 floats × 4 bytes
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.cameraBuffer = device.createBuffer({
      size: 80, // viewProjection (64) + cameraPos (16)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Sim pipeline
    const simBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });

    this.simPipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [simBindGroupLayout] }),
      compute: { module: simModule, entryPoint: 'main' },
    });

    this.simBindGroup = device.createBindGroup({
      layout: simBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.simParamsBuffer } },
      ],
    });

    // Render pipeline
    const renderBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      ],
    });

    this.renderPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [renderBindGroupLayout] }),
      vertex: {
        module: renderModule,
        entryPoint: 'main',
      },
      fragment: {
        module: renderModule,
        entryPoint: 'main',
        targets: [{ format: this.deviceManager.format, blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        } }],
      },
      primitive: { topology: 'triangle-strip' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: false,
        depthCompare: 'greater',
      },
    });

    this.renderBindGroup = device.createBindGroup({
      layout: renderBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.cameraBuffer } },
      ],
    });
  }

  /** Step simulation */
  simulate(commandEncoder: GPUCommandEncoder, delta: number, attractor: [number, number, number], time: number): void {
    const device = this.deviceManager.device!;
    const params = new Float32Array([delta, attractor[0], attractor[1], attractor[2], time, 0, 0, 0]);
    device.queue.writeBuffer(this.simParamsBuffer!, 0, params);

    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(this.simPipeline!);
    pass.setBindGroup(0, this.simBindGroup!);
    pass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 256));
    pass.end();
  }

  /** Render particles */
  render(passEncoder: GPURenderPassEncoder, cameraData: Float32Array): void {
    const device = this.deviceManager.device!;
    device.queue.writeBuffer(this.cameraBuffer!, 0, cameraData);
    passEncoder.setPipeline(this.renderPipeline!);
    passEncoder.setBindGroup(0, this.renderBindGroup!);
    passEncoder.draw(PARTICLE_COUNT * 4);
  }
}
