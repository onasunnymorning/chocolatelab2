import { db } from "@/db";
import { batches, batchEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { RefinementEvent } from "../types";

export interface SaveRefinementReportInput {
  workflowId: string;
  name: string;
  startTime: string;
  endTime: string;
  cacaoPercentage: number;
  events: RefinementEvent[];
}

export interface Activities {
  saveRefinementReport(input: SaveRefinementReportInput): Promise<void>;
}

export async function saveRefinementReport(
  input: SaveRefinementReportInput
): Promise<void> {
  const { workflowId, name, startTime, endTime, cacaoPercentage, events } =
    input;

  // Upsert the batch record (create or update to COMPLETED)
  const existing = await db
    .select()
    .from(batches)
    .where(eq(batches.workflowId, workflowId))
    .limit(1);

  let batchId: string;

  if (existing.length > 0) {
    // Update existing record to completed
    await db
      .update(batches)
      .set({
        status: "COMPLETED",
        endTime: new Date(endTime),
      })
      .where(eq(batches.workflowId, workflowId));
    batchId = existing[0].id;
  } else {
    // Insert new record (handles edge cases where batch was never pre-created)
    const inserted = await db
      .insert(batches)
      .values({
        workflowId,
        name,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        cacaoPercentage: cacaoPercentage.toString(),
        status: "COMPLETED",
      })
      .returning({ id: batches.id });
    batchId = inserted[0].id;
  }

  // Insert all events
  if (events.length > 0) {
    await db.insert(batchEvents).values(
      events.map((event) => ({
        batchId,
        eventType: event.type,
        payload: event.payload as Record<string, string>,
        timestamp: new Date(event.timestamp),
      }))
    );
  }
}
