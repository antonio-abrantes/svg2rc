import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    tanstackStart({
      // Custom SSR entry: src/server.ts wraps catastrophic h3 errors.
      server: { entry: "server" },
    }),
    nitro({ preset: "node-server" }),
    viteReact(),
    tailwindcss(),
  ],
});
