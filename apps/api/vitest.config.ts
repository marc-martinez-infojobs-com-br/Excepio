import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/*.module.ts', 'src/**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '@platform': path.resolve(__dirname, './src/platform'),
      '@exception': path.resolve(__dirname, './src/exception'),
      '@auth': path.resolve(__dirname, './src/auth'),
      '@user': path.resolve(__dirname, './src/user'),
      '@level': path.resolve(__dirname, './src/level'),
      '@status': path.resolve(__dirname, './src/status'),
      '@config': path.resolve(__dirname, './src/config'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
});
