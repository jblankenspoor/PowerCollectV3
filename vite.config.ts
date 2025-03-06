import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 */
export default defineConfig({
  plugins: [react()],
  base: '/PowerCollectV3/',
  server: {
    port: 3000,
  },
});
