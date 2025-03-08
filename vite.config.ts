import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 * @version 1.1.0 - Added conditional base path for different deployment environments
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/PowerCollectV3/',
  server: {
    port: 3000,
  },
});
