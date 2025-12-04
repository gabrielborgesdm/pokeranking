import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  treeshake: true,
  clean: true,
  outDir: "dist",
  sourcemap: true,
  minify: false,
});
