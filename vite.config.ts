import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: "esm", // instead of 'cjs'
      },
    },
  },
});
