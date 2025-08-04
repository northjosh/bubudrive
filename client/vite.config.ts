import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
    }),
    preact(),
  ],
  
});
