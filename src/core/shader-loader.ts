/** Load WGSL shader modules */
export class ShaderLoader {
  private cache = new Map<string, GPUShaderModule>();

  constructor(private device: GPUDevice) {}

  async load(name: string, code: string): Promise<GPUShaderModule> {
    const existing = this.cache.get(name);
    if (existing) return existing;

    const module = this.device.createShaderModule({ code });
    // Check compilation
    const info = await module.getCompilationInfo();
    for (const msg of info.messages) {
      if (msg.type === 'error') {
        console.error(`WGSL error in ${name} (${msg.lineNum}:${msg.linePos}): ${msg.message}`);
      }
    }
    this.cache.set(name, module);
    return module;
  }

  get(name: string): GPUShaderModule | undefined {
    return this.cache.get(name);
  }
}
