import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'contract',
  entry: ['contract/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
});
