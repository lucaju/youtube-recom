import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'crawler-schema',
  entry: ['src/types/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'schema',
});
