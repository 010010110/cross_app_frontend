import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = (env.VITE_PROXY_TARGET || env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

  return {
    server: {
      host: "localhost",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/auth": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/feed": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/boxes": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/checkins": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/results": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/rewards": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/classes": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/exercises": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/wods": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/users": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/admin/reports": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/admin": {
          target: proxyTarget,
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
  };
});
