import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 * @version 2.0.0 - Major version update with improved configuration for deployment
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL || process.env.CF_PAGES ? '/' : '/PowerCollectV3/',
  server: {
    port: 3000,
    strictPort: false, // Try another port if 3000 is not available
    hmr: {
      overlay: true, // Show errors as an overlay
      port: 24678, // Use a dedicated port for HMR to avoid conflicts
    },
  },
  json: {
    stringify: true, // Enable JSON imports
  },
});
