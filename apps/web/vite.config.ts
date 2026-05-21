import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ["e2e/**", "node_modules/**", "dist/**"]
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      },
      "/realtime": {
        target: "ws://localhost:3000",
        ws: true
      }
    }
  }
});
