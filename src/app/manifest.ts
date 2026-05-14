import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chocolate Lab — Refinement Tracker",
    short_name: "ChocLab",
    description:
      "Mobile-first shop floor tracker for bean-to-bar chocolate batch refinement. Monitor your melanger in real time.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2d1a0e",
    theme_color: "#2d1a0e",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
