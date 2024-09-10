import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: ['./src/Index.ts'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    external: ['tsup'],
    splitting: false,
    sourcemap: true,
    minify: true,
    treeshake: true,
});