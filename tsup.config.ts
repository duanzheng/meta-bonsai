import { defineConfig } from "tsup";

const shared = {
  format: ["esm", "cjs"],
  outDir: "dist",
  sourcemap: true,
  dts: true,
  clean: true,
  splitting: false,
  shims: false,
  outExtension({ format }: { format: "cjs" | "esm" }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
} as const;

export default defineConfig([
  {
    ...shared,
    entry: { cli: "src/cli.ts" },
    shebang: true,
  },
  {
    ...shared,
    entry: { index: "src/index.ts" },
    shebang: false,
  },
]);
