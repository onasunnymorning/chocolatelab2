import { NextResponse } from "next/server";
import { getTemporalClient } from "@/temporal/client";
import { WorkflowExecutionStatusName } from "@temporalio/client";

// GET /api/active — list all running refinement workflows from Temporal
export async function GET() {
  try {
    const client = await getTemporalClient();
    const namespace = process.env.TEMPORAL_NAMESPACE ?? "default";

    const activeBatches: {
      workflowId: string;
      runId: string;
      startTime: Date | null;
    }[] = [];

    const handle = client.workflow.list({
      query: `WorkflowType = "refinementWorkflow" AND ExecutionStatus = "Running"`,
    });

    for await (const workflow of handle) {
      activeBatches.push({
        workflowId: workflow.workflowId,
        runId: workflow.runId,
        startTime: workflow.startTime ?? null,
      });
    }

    return NextResponse.json({ batches: activeBatches });
  } catch (err) {
    console.error("GET /api/active error:", err);
    return NextResponse.json(
      { error: "Failed to list active workflows" },
      { status: 500 }
    );
  }
}
