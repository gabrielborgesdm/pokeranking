import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'models/index': 'src/models/index.ts',
    'hooks/index': 'src/hooks/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  outDir: 'dist',
  external: ['react', '@tanstack/react-query'],
  sourcemap: true,
  minify: false,
});
