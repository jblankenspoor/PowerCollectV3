import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration for the PowerCollectV3 project
 * @see {@link https://vitejs.dev/config/}
 * @version 1.2.1 - Updated for bug-fixing-11-3 branch with fixed port configuration
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL || process.env.CF_PAGES ? '/' : '/PowerCollectV3/',
  server: {
    port: 3000,
    strictPort: true, // Fail if port 3000 is not available
  },
});
