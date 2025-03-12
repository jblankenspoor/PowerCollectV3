import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 * @version 1.2.3 - Updated port configuration to use port 3000 with hot reload for token counter feature
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL || process.env.CF_PAGES ? '/' : '/PowerCollectV3/',
  server: {
    port: 3000,
    strictPort: false, // Try another port if 3000 is not available
    hmr: {
      overlay: true, // Show errors as an overlay
    },
  },
});
