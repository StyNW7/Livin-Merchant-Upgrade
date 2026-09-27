import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const shortcutIcon = [{ src: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" }];

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The app asks before activating a new version (see UpdatePrompt).
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.ico", "icons/apple-touch-icon-180x180.png", "icons/favicon-64x64.png", "Images/*"],
      manifest: {
        id: "/",
        name: "Livin Merchant by Mandiri",
        short_name: "Livin Merchant",
        description: "Run your business, accept payments and grow with Livin Merchant by Mandiri.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "portrait",
        background_color: "#003A70",
        theme_color: "#003A70",
        lang: "en",
        dir: "ltr",
        categories: ["business", "finance", "productivity"],
        icons: [
          { src: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/maskable-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "New Sale", short_name: "Sale", description: "Open the cashier", url: "/cashier", icons: shortcutIcon },
          { name: "QR Payment", short_name: "QRIS", description: "Show a QRIS code", url: "/qr-payment", icons: shortcutIcon },
          { name: "Growth", short_name: "Growth", description: "See your Growth Score", url: "/growth", icons: shortcutIcon },
          { name: "Transactions", short_name: "Sales", description: "Today’s transactions", url: "/transactions", icons: shortcutIcon },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,webmanifest}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Lets the install prompt work while running `npm run dev` too.
      devOptions: { enabled: true, type: "module", navigateFallback: "index.html", suppressWarnings: true },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
