import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batches, batchEvents } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// Derive cacao % from a list of INGREDIENT_ADDED events
function computeCacaoPercentage(
  events: { eventType: string; payload: unknown }[]
): number | null {
  let totalGrams = 0;
  let cacaoGrams = 0;
  for (const e of events) {
    if (e.eventType !== "INGREDIENT_ADDED") continue;
    const p = e.payload as Record<string, string>;
    const grams = parseFloat(p.amount ?? "0");
    if (isNaN(grams) || grams <= 0) continue;
    totalGrams += grams;
    if (p.isCacao === "true") cacaoGrams += grams;
  }
  if (totalGrams === 0) return null;
  return Math.round((cacaoGrams / totalGrams) * 10000) / 100;
}

// GET /api/batches/[id]/state — read batch + events from DB
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;

    const [batch] = await db
      .select()
      .from(batches)
      .where(eq(batches.workflowId, workflowId));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const events = await db
      .select()
      .from(batchEvents)
      .where(eq(batchEvents.batchId, batch.id))
      .orderBy(asc(batchEvents.timestamp));

    const mappedEvents = events.map((e) => ({
      type: e.eventType,
      payload: e.payload as Record<string, string>,
      timestamp: e.timestamp.toISOString(),
    }));

    return NextResponse.json({
      workflowId: batch.workflowId,
      name: batch.name,
      cacaoPercentage: computeCacaoPercentage(events),
      startTime: batch.startTime.toISOString(),
      endTime: batch.endTime ? batch.endTime.toISOString() : null,
      events: mappedEvents,
      isEnded: batch.status === "COMPLETED",
    });
  } catch (err: any) {
    console.error("GET /api/batches/[id]/state error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch batch state" },
      { status: 500 }
    );
  }
}
