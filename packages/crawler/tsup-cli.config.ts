import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'cli',
  entry: ['cli/collectOnce/index.ts', 'cli/collectOne/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist-cli',
});
