import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/feed": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/boxes": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/checkins": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/results": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/rewards": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/classes": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/exercises": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/wods": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/users": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/admin/reports": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://localhost:3000",
        changeOrigin: true,
        bypass(req) {
          // Serve index.html for /admin route (SPA navigation)
          if (req.url === "/admin" || (!req.url.includes(".") && !req.url.startsWith("/admin/reports"))) {
            return "/index.html";
          }
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
