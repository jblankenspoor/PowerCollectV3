import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 * @version 1.2.0 - Updated base path configuration for multiple deployment platforms
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL || process.env.CF_PAGES ? '/' : '/PowerCollectV3/',
  server: {
    port: 3000,
  },
});
