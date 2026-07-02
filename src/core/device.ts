/** WebGPU device/adapter acquisition with fallback */
export class DeviceManager {
  public device: GPUDevice | null = null;
  public adapter: GPUAdapter | null = null;
  public canvas: HTMLCanvasElement | null = null;
  public context: GPUCanvasContext | null = null;
  public format: GPUTextureFormat = 'bgra8unorm';

  private constructor() {}

  static async create(canvas: HTMLCanvasElement): Promise<DeviceManager> {
    const mgr = new DeviceManager();
    mgr.canvas = canvas;

    const gpu = navigator.gpu;
    if (!gpu) throw new Error('WebGPU not available');

    mgr.adapter = await gpu.requestAdapter({
      powerPreference: 'high-performance',
    });
    if (!mgr.adapter) throw new Error('No WebGPU adapter found');

    mgr.device = await mgr.adapter.requestDevice();
    mgr.format = gpu.getPreferredCanvasFormat();

    mgr.context = canvas.getContext('webgpu') as GPUCanvasContext;
    mgr.context.configure({
      device: mgr.device,
      format: mgr.format,
      alphaMode: 'premultiplied',
    });

    return mgr;
  }

  /** Resize swapchain to match canvas display size */
  resize(): void {
    if (!this.canvas || !this.context) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.context.configure({
        device: this.device!,
        format: this.format,
        alphaMode: 'premultiplied',
      });
    }
  }

  get width(): number { return this.canvas?.width ?? 1; }
  get height(): number { return this.canvas?.height ?? 1; }
  get aspect(): number { return this.width / this.height; }
}
