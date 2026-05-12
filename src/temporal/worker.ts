import { Worker, NativeConnection } from "@temporalio/worker";
import { saveRefinementReport } from "./activities/saveRefinementReport";
import path from "path";

// Load env vars when running directly with tsx (Next.js does this automatically
// for API routes, but the worker is a standalone process).
import "dotenv/config";

const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE ?? "refinement-queue";
const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS ?? "127.0.0.1:7233";
const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE ?? "default";

async function run() {
  const connection = await NativeConnection.connect({
    address: TEMPORAL_ADDRESS,
  });

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    // path.resolve gives Temporal's bundler an absolute path to the workflow
    // file so it can bundle it with its internal webpack pipeline.
    workflowsPath: path.resolve(__dirname, "./workflows/refinementWorkflow.ts"),
    activities: { saveRefinementReport },
    taskQueue: TASK_QUEUE,
  });

  console.log(
    `🍫 Chocolate Lab worker started\n   task queue : ${TASK_QUEUE}\n   address    : ${TEMPORAL_ADDRESS}\n   namespace  : ${TEMPORAL_NAMESPACE}`
  );

  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
