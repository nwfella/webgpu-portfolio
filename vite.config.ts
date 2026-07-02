import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgpu-portfolio/',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});
