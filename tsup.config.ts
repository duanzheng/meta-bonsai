import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  outDir: "dist",
  sourcemap: true,
  dts: true,
  clean: true,
  splitting: false,
  shims: true,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
