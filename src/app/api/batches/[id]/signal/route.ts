import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batches, batchEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SignalType } from "@/temporal/types";

// POST /api/batches/[id]/signal — log an event or end the batch
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const body = await req.json();
    const { signalType, payload } = body as {
      signalType: SignalType;
      payload?: Record<string, string>;
    };

    // Look up the batch
    const [batch] = await db
      .select({ id: batches.id, status: batches.status })
      .from(batches)
      .where(eq(batches.workflowId, workflowId));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
    if (batch.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Batch is already completed" },
        { status: 409 }
      );
    }

    switch (signalType) {
      case "addIngredientSignal": {
        if (!payload?.name || !payload?.amount) {
          return NextResponse.json(
            { error: "name and amount are required" },
            { status: 400 }
          );
        }
        await db.insert(batchEvents).values({
          batchId: batch.id,
          eventType: "INGREDIENT_ADDED",
          payload: {
            name: payload.name,
            amount: payload.amount,
            isCacao: payload.isCacao === "true" ? "true" : "false",
          },
          timestamp: new Date(),
        });
        break;
      }

      case "takeSampleSignal": {
        if (!payload?.observation) {
          return NextResponse.json(
            { error: "observation is required" },
            { status: 400 }
          );
        }
        await db.insert(batchEvents).values({
          batchId: batch.id,
          eventType: "SAMPLE_TAKEN",
          payload: { observation: payload.observation },
          timestamp: new Date(),
        });
        break;
      }

      case "addNoteSignal": {
        if (!payload?.note) {
          return NextResponse.json(
            { error: "note is required" },
            { status: 400 }
          );
        }
        await db.insert(batchEvents).values({
          batchId: batch.id,
          eventType: "NOTE_ADDED",
          payload: { note: payload.note },
          timestamp: new Date(),
        });
        break;
      }

      case "endRefinementSignal": {
        // Compute cacao % from events and finalise the batch
        const events = await db
          .select()
          .from(batchEvents)
          .where(eq(batchEvents.batchId, batch.id));

        let totalGrams = 0;
        let cacaoGrams = 0;
        for (const e of events) {
          if (e.eventType !== "INGREDIENT_ADDED") continue;
          const p = e.payload as Record<string, string>;
          const g = parseFloat(p.amount ?? "0");
          if (isNaN(g) || g <= 0) continue;
          totalGrams += g;
          if (p.isCacao === "true") cacaoGrams += g;
        }
        const cacaoPercentage =
          totalGrams > 0
            ? String(Math.round((cacaoGrams / totalGrams) * 10000) / 100)
            : null;

        await db
          .update(batches)
          .set({
            status: "COMPLETED",
            endTime: new Date(),
            cacaoPercentage,
          })
          .where(eq(batches.id, batch.id));
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown signal type: ${signalType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("POST /api/batches/[id]/signal error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to process signal" },
      { status: 500 }
    );
  }
}
