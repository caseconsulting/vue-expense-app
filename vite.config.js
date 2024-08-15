import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  // https://router.vuejs.org/guide/advanced/lazy-loading.html
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'base-imports': ['@/views/Home.vue', '@/views/MyBudgets.vue', '@/views/EmployeeBeta.vue']
        }
      }
    }
  }
});
