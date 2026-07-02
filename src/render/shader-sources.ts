/** 
 * Shader sources loaded via Vite's ?raw import.
 * This bundles WGSL into the JS at build time — no runtime fetch needed.
 */
// @ts-ignore — WGSL files don't have TS declarations
import particleSimSrc from '../shaders/particle-sim.wgsl?raw';
// @ts-ignore
import particleRenderSrc from '../shaders/particle-render.wgsl?raw';
// @ts-ignore
import objectVertSrc from '../shaders/object-vert.wgsl?raw';
// @ts-ignore
import objectFragSrc from '../shaders/object-frag.wgsl?raw';
// @ts-ignore
import skySrc from '../shaders/sky.wgsl?raw';
// @ts-ignore
import groundSrc from '../shaders/ground.wgsl?raw';
// @ts-ignore
import bloomExtractSrc from '../shaders/bloom-extract.wgsl?raw';
// @ts-ignore
import bloomBlurSrc from '../shaders/bloom-blur.wgsl?raw';
// @ts-ignore
import bloomComposeSrc from '../shaders/bloom-compose.wgsl?raw';
// @ts-ignore
import dissolveSrc from '../shaders/dissolve.wgsl?raw';
// @ts-ignore
import constellationSrc from '../shaders/constellation.wgsl?raw';

export const SHADERS = {
  particleSim: particleSimSrc,
  particleRender: particleRenderSrc,
  objectVert: objectVertSrc,
  objectFrag: objectFragSrc,
  sky: skySrc,
  ground: groundSrc,
  bloomExtract: bloomExtractSrc,
  bloomBlur: bloomBlurSrc,
  bloomCompose: bloomComposeSrc,
  dissolve: dissolveSrc,
  constellation: constellationSrc,
} as const;

export type ShaderName = keyof typeof SHADERS;
