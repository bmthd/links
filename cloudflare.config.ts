import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "links",
    compatibilityDate: "2026-07-01",
    workersDev: false,
    previewUrls: true,
    assets: {
      htmlHandling: "drop-trailing-slash",
    },
    domains: ["links.bmth.dev"],
  },
});
