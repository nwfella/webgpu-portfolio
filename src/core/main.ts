/**
 * WebGPU Portfolio — Main Entry Point
 *
 * Orchestrates: device init → asset loading → render loop → UI overlay
 * Falls back to static HTML when WebGPU is unavailable.
 */
import { DeviceManager } from '../core/device';
import { Timer } from '../core/timer';
import { InputManager } from '../core/input';
import { Camera } from '../core/camera';
import { Renderer } from '../render/renderer';
import { HUD } from '../ui/hud';
import { LoadingScreen } from '../ui/loading';
import { showFallbackPortfolio } from '../fallback/fallback';
import { PROJECTS } from '../portfolio/data';

async function main(): Promise<void> {
  const loading = new LoadingScreen();
  loading.setProgress(5, 'checking WebGPU support...');

  // Check WebGPU availability
  if (!navigator.gpu) {
    loading.setProgress(100, 'WebGPU not available — showing fallback');
    setTimeout(() => {
      loading.hide();
      showFallbackPortfolio();
    }, 500);
    return;
  }

  try {
    loading.setProgress(10, 'acquiring GPU device...');

    const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const deviceManager = await DeviceManager.create(canvas);

    loading.setProgress(25, 'bundling shaders...');

    // Initialize systems
    const camera = new Camera();
    const input = new InputManager();
    const timer = new Timer();
    const renderer = new Renderer(deviceManager);

    loading.setProgress(45, 'building particle system...');
    await renderer.init();

    loading.setProgress(70, 'configuring scene...');

    // Configure camera
    const aspect = deviceManager.aspect;
    camera.updateProjection(Math.PI / 4, aspect, 0.1, 100);

    // Attach input
    input.attach(canvas);

    // Create HUD overlay
    const hud = new HUD();

    loading.setProgress(85, 'starting render loop...');

    // Resize once
    deviceManager.resize();

    // Frame scheduling
    let frameCount = 0;
    const frame = () => {
      timer.tick();
      const dt = timer.delta;
      const t = timer.elapsed;

      // Handle resize
      if (canvas.clientWidth !== deviceManager.width ||
          canvas.clientHeight !== deviceManager.height) {
        deviceManager.resize();
        camera.updateProjection(Math.PI / 4, deviceManager.aspect, 0.1, 100);
        renderer.resize();
      }

      // Update input
      input.endFrame();

      // Update camera
      camera.updateInput(input.state, dt);
      camera.updateProjection(Math.PI / 4, deviceManager.aspect, 0.1, 100);

      // Render
      renderer.render(camera, t, dt, input.state);

      // Animate project object rotation
      for (const obj of renderer.objects) {
        obj.rotation[0] += dt * 0.3;
        obj.rotation[1] += dt * 0.2;
      }

      // Ready signal
      if (frameCount === 0) {
        loading.setProgress(100, 'running...');
        setTimeout(() => loading.hide(), 300);
      }
      frameCount++;

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

  } catch (err) {
    console.error('WebGPU init failed:', err);
    loading.setProgress(100, 'GPU init failed — showing fallback');
    setTimeout(() => {
      loading.hide();
      showFallbackPortfolio();
    }, 500);
  }
}

// Boot
main();
