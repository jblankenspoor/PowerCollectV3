import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PowerCollectV3/',
  server: {
    port: 8300,
  },
});
