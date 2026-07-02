/**
 * WebGPU Portfolio — Main Entry Point
 *
 * Orchestrates: device init → asset loading → render loop → UI overlay
 * Falls back to static HTML when WebGPU is unavailable.
 * Uses timeouts everywhere so nothing hangs forever.
 */
import { DeviceManager } from '../core/device';
import { Timer } from '../core/timer';
import { InputManager } from '../core/input';
import { Camera } from '../core/camera';
import { Renderer } from '../render/renderer';
import { HUD } from '../ui/hud';
import { LoadingScreen } from '../ui/loading';
import { showFallbackPortfolio } from '../fallback/fallback';

/** Race a promise against a timeout — rejects if slower */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT: ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

/** Safe element query — returns null instead of throwing */
function safeElem(id: string): HTMLElement | null {
  return document.getElementById(id);
}

/** Safe LoadingScreen that won't crash if DOM elements are missing */
class SafeLoadingScreen {
  private fill: HTMLElement | null = safeElem('loader-fill');
  private status: HTMLElement | null = safeElem('loading-status');
  private screen: HTMLElement | null = safeElem('loading-screen');

  setProgress(pct: number, msg: string): void {
    if (this.fill) this.fill.style.width = `${Math.min(100, pct)}%`;
    if (this.status) this.status.textContent = msg;
  }

  hide(): void {
    if (this.screen) this.screen.classList.add('hidden');
  }
}

/** Try WebGPU init. Returns the manager or null. */
async function tryInitWebGPU(canvas: HTMLCanvasElement): Promise<DeviceManager | null> {
  if (!navigator.gpu) return null;

  // Try without powerPreference first — some browsers hang on 'high-performance'
  try {
    const adapter = await withTimeout(
      navigator.gpu.requestAdapter(),
      3000,
      'requestAdapter'
    );
    if (!adapter) return null;

    const device = await withTimeout(
      adapter.requestDevice(),
      3000,
      'requestDevice'
    );
    if (!device) return null;

    const context = canvas.getContext('webgpu');
    if (!context) return null;

    const mgr = new DeviceManager();
    mgr['device'] = device;
    mgr['adapter'] = adapter;
    mgr['canvas'] = canvas;
    mgr['context'] = context;
    mgr['format'] = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
      device,
      format: mgr['format'],
      alphaMode: 'premultiplied',
    });
    return mgr;
  } catch {
    // Also try with 'low-power' as a fallback
    try {
      const adapter = await withTimeout(
        navigator.gpu.requestAdapter({ powerPreference: 'low-power' }),
        3000,
        'requestAdapter (low-power)'
      );
      if (!adapter) return null;
      const device = await withTimeout(
        adapter.requestDevice(),
        3000,
        'requestDevice (low-power)'
      );
      if (!device) return null;
      const context = canvas.getContext('webgpu');
      if (!context) return null;
      const mgr = new DeviceManager();
      mgr['device'] = device;
      mgr['adapter'] = adapter;
      mgr['canvas'] = canvas;
      mgr['context'] = context;
      mgr['format'] = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format: mgr['format'], alphaMode: 'premultiplied' });
      return mgr;
    } catch {
      return null;
    }
  }
}

async function main(): Promise<void> {
  const loading = new SafeLoadingScreen();
  loading.setProgress(5, 'checking WebGPU support...');

  const canvas = safeElem('gpu-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    loading.setProgress(100, 'canvas not found');
    setTimeout(() => { loading.hide(); showFallbackPortfolio(); }, 200);
    return;
  }

  loading.setProgress(10, 'acquiring GPU device...');
  const deviceManager = await tryInitWebGPU(canvas);

  if (!deviceManager) {
    loading.setProgress(100, 'WebGPU unavailable — showing static portfolio');
    setTimeout(() => { loading.hide(); showFallbackPortfolio(); }, 300);
    return;
  }

  try {
    loading.setProgress(30, 'bundling shaders...');
    const camera = new Camera();
    const input = new InputManager();
    const timer = new Timer();
    const renderer = new Renderer(deviceManager);

    loading.setProgress(50, 'building particle system...');
    await withTimeout(renderer.init(), 8000, 'renderer initialization');

    loading.setProgress(70, 'configuring scene...');
    camera.updateProjection(Math.PI / 4, deviceManager.aspect, 0.1, 100);
    input.attach(canvas);

    // Create HUD overlay
    const hud = new HUD();

    loading.setProgress(85, 'starting render loop...');
    deviceManager.resize();

    let frameCount = 0;
    const frame = () => {
      timer.tick();
      const dt = timer.delta;
      const t = timer.elapsed;

      if (canvas.clientWidth !== deviceManager.width ||
          canvas.clientHeight !== deviceManager.height) {
        deviceManager.resize();
        camera.updateProjection(Math.PI / 4, deviceManager.aspect, 0.1, 100);
        renderer.resize();
      }

      input.endFrame();
      camera.updateInput(input.state, dt);
      camera.updateProjection(Math.PI / 4, deviceManager.aspect, 0.1, 100);
      renderer.render(camera, t, dt, input.state);

      for (const obj of renderer.objects) {
        obj.rotation[0] += dt * 0.3;
        obj.rotation[1] += dt * 0.2;
      }

      if (frameCount === 0) {
        loading.setProgress(100, '⚡ running');
        setTimeout(() => loading.hide(), 200);
      }
      frameCount++;
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

  } catch (err) {
    console.error('WebGPU init failed:', err);
    loading.setProgress(100, 'WebGPU unavailable — showing static portfolio');
    setTimeout(() => { loading.hide(); showFallbackPortfolio(); }, 400);
  }
}

// Boot — catch any top-level crash
main().catch(err => {
  console.error('Fatal error:', err);
  const s = new SafeLoadingScreen();
  s.setProgress(100, 'Error — showing static portfolio');
  setTimeout(() => { s.hide(); showFallbackPortfolio(); }, 300);
});
