import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";

// Custom plugin to copy manifest.json to the output directory
const copyManifest = () => {
  return {
    name: "copy-manifest",
    writeBundle() {
      const manifestPath = resolve(__dirname, "manifest.json");
      const manifestContent = readFileSync(manifestPath, "utf-8");
      writeFileSync(
        resolve(__dirname, "dist", "manifest.json"),
        manifestContent
      );
    },
  };
};

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        contentScript: "src/contentScript.ts",
        background: "src/background.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
