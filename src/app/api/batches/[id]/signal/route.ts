import { NextRequest, NextResponse } from "next/server";
import { getTemporalClient } from "@/temporal/client";
import {
  addIngredientSignal,
  takeSampleSignal,
  addNoteSignal,
  endRefinementSignal,
} from "@/temporal/workflows/refinementWorkflow";
import type { SignalType } from "@/temporal/types";

// POST /api/batches/[id]/signal — send a signal to a running workflow
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

    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);

    switch (signalType) {
      case "addIngredientSignal":
        if (!payload?.name || !payload?.amount) {
          return NextResponse.json(
            { error: "name and amount are required for addIngredientSignal" },
            { status: 400 }
          );
        }
        await handle.signal(addIngredientSignal, {
          name: payload.name,
          amount: payload.amount,
        });
        break;

      case "takeSampleSignal":
        if (!payload?.observation) {
          return NextResponse.json(
            { error: "observation is required for takeSampleSignal" },
            { status: 400 }
          );
        }
        await handle.signal(takeSampleSignal, {
          observation: payload.observation,
        });
        break;

      case "addNoteSignal":
        if (!payload?.note) {
          return NextResponse.json(
            { error: "note is required for addNoteSignal" },
            { status: 400 }
          );
        }
        await handle.signal(addNoteSignal, { note: payload.note });
        break;

      case "endRefinementSignal":
        await handle.signal(endRefinementSignal);
        break;

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
      { error: err?.message ?? "Failed to send signal" },
      { status: 500 }
    );
  }
}
