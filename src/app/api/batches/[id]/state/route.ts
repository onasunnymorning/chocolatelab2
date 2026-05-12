import { NextRequest, NextResponse } from "next/server";
import { getTemporalClient } from "@/temporal/client";
import { getRefinementStateQuery } from "@/temporal/workflows/refinementWorkflow";

// GET /api/batches/[id]/state — query the live workflow state
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    const state = await handle.query(getRefinementStateQuery);
    return NextResponse.json(state);
  } catch (err: any) {
    const status =
      err?.name === "WorkflowNotFoundError" ||
      err?.message?.includes("workflow not found")
        ? 404
        : 500;
    return NextResponse.json(
      { error: err?.message ?? "Failed to query workflow state" },
      { status }
    );
  }
}
