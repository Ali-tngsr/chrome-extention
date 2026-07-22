import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
// Multi-page build: produces newtab.html (+ index.html placeholder) into dist/
// for loading as an unpacked Manifest V3 Chrome Extension.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, "newtab.html"),
        index: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
