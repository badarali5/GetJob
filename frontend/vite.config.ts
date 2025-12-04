import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy API requests to backend to avoid CORS issues during local development
    proxy: {
      '/jobs': {
        target: 'https://getjob-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    // HMR configuration for development only
    hmr: mode === 'development' ? {
      host: 'localhost',
      port: 8080,
      protocol: 'ws'
    } : false,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure production build doesn't include HMR code
    minify: 'terser',
    sourcemap: false,
  },
}));
