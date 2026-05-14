import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batches, batchEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/batches — list completed batches from Postgres
export async function GET() {
  try {
    const completed = await db
      .select()
      .from(batches)
      .where(eq(batches.status, "COMPLETED"))
      .orderBy(desc(batches.startTime));

    return NextResponse.json({ batches: completed });
  } catch (err) {
    console.error("GET /api/batches error:", err);
    return NextResponse.json(
      { error: "Failed to fetch completed batches" },
      { status: 500 }
    );
  }
}

// POST /api/batches — create a new refinement batch + seed initial ingredient events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, initialIngredients } = body as {
      name: string;
      initialIngredients?: { name: string; amount: string; isCacao: boolean }[];
    };

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const workflowId = `refinement-${uuidv4()}`;
    const startTime = new Date();

    // Insert batch row
    const [batch] = await db
      .insert(batches)
      .values({
        workflowId,
        name,
        startTime,
        status: "IN_PROGRESS",
      })
      .returning();

    // Seed initial ingredient events
    if (initialIngredients && initialIngredients.length > 0) {
      await db.insert(batchEvents).values(
        initialIngredients.map((ing) => ({
          batchId: batch.id,
          eventType: "INGREDIENT_ADDED" as const,
          payload: {
            name: ing.name,
            amount: String(ing.amount),
            isCacao: String(ing.isCacao),
          },
          timestamp: startTime,
        }))
      );
    }

    return NextResponse.json({ workflowId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/batches error:", err);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}
