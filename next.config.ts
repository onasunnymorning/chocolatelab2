import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporal's gRPC client uses native Node.js internals that Turbopack
  // cannot bundle correctly. Mark them as server externals so they are
  // required at runtime from node_modules instead.
  serverExternalPackages: [
    "@temporalio/client",
    "@temporalio/worker",
    "@temporalio/workflow",
    "@temporalio/activity",
    "@temporalio/common",
    "@grpc/grpc-js",
  ],

  async headers() {
    return [
      {
        // Prevent browsers from caching the service worker so updates
        // are picked up immediately on the next page load.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
