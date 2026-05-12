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
};

export default nextConfig;
