import { NextResponse } from "next/server";
import { db } from "@/db";
import { batches } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/active — list all IN_PROGRESS batches from the DB
export async function GET() {
  try {
    const active = await db
      .select({
        workflowId: batches.workflowId,
        name: batches.name,
        startTime: batches.startTime,
      })
      .from(batches)
      .where(eq(batches.status, "IN_PROGRESS"));

    return NextResponse.json({
      batches: active.map((b) => ({
        workflowId: b.workflowId,
        name: b.name,
        runId: b.workflowId,
        startTime: b.startTime?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    console.error("GET /api/active error:", err);
    return NextResponse.json(
      { error: "Failed to list active batches" },
      { status: 500 }
    );
  }
}
