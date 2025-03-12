import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 * @version 1.2.2 - Updated port configuration to avoid conflicts and added Piwik Pro analytics
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL || process.env.CF_PAGES ? '/' : '/PowerCollectV3/',
  server: {
    port: 3100,
    strictPort: false, // Try another port if 3100 is not available
  },
});
