import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 5173
    },
    optimizeDeps: {
        exclude: ['fsevents']
    },
    build: {
        sourcemap: true  // Ensure source maps are enabled for debugging
      }
});
