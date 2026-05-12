import { NextRequest, NextResponse } from "next/server";
import { getTemporalClient, TASK_QUEUE } from "@/temporal/client";
import { db } from "@/db";
import { batches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { refinementWorkflow } from "@/temporal/workflows/refinementWorkflow";
import type { RefinementInput } from "@/temporal/types";
import { v4 as uuidv4 } from "uuid";

// GET /api/batches — list completed batches from Postgres
export async function GET() {
  try {
    const completed = await db
      .select()
      .from(batches)
      .where(eq(batches.status, "COMPLETED"))
      .orderBy(desc(batches.endTime));

    return NextResponse.json({ batches: completed });
  } catch (err) {
    console.error("GET /api/batches error:", err);
    return NextResponse.json(
      { error: "Failed to fetch completed batches" },
      { status: 500 }
    );
  }
}

// POST /api/batches — start a new refinement workflow
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, cacaoPercentage, initialIngredients } = body;

    if (!name || !cacaoPercentage) {
      return NextResponse.json(
        { error: "name and cacaoPercentage are required" },
        { status: 400 }
      );
    }

    const workflowId = `refinement-${uuidv4()}`;
    const startTime = new Date().toISOString();

    const input: RefinementInput = {
      name,
      startTime,
      initialIngredients: initialIngredients ?? [],
      cacaoPercentage: parseFloat(cacaoPercentage),
    };

    // Pre-create the batch record in Postgres so dashboard can show it immediately
    await db.insert(batches).values({
      workflowId,
      name,
      startTime: new Date(startTime),
      cacaoPercentage: cacaoPercentage.toString(),
      status: "IN_PROGRESS",
    });

    const client = await getTemporalClient();
    await client.workflow.start(refinementWorkflow, {
      taskQueue: TASK_QUEUE,
      workflowId,
      args: [input],
    });

    return NextResponse.json({ workflowId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/batches error:", err);
    return NextResponse.json(
      { error: "Failed to start batch workflow" },
      { status: 500 }
    );
  }
}
