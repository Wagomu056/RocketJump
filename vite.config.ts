import { defineConfig } from "vite";

import { assetpackPlugin } from "./scripts/assetpack-vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  // Set base to repo name for GitHub Pages deployment.
  // Change 'RocketJump' if your GitHub repository has a different name.
  base: process.env.NODE_ENV === "production" ? "/RocketJump/" : "/",
  plugins: [assetpackPlugin()],
  server: {
    port: 8080,
    open: true,
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
