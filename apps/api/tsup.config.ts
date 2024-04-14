import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'api',
  entry: ['contract/index.ts', 'db/index.ts', 'jobs/index.ts', 'server/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'transpiled',
});
