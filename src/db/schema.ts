import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Enums ─────────────────────────────────────────────────────────────────

export const batchStatusEnum = pgEnum("batch_status", [
  "IN_PROGRESS",
  "COMPLETED",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "INGREDIENT_ADDED",
  "SAMPLE_TAKEN",
  "NOTE_ADDED",
]);

// ─── Tables ────────────────────────────────────────────────────────────────

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: text("workflow_id").notNull().unique(),
  name: text("name").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  cacaoPercentage: numeric("cacao_percentage", {
    precision: 5,
    scale: 2,
  }).notNull(),
  status: batchStatusEnum("status").notNull().default("IN_PROGRESS"),
});

export const batchEvents = pgTable("batch_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
});

// ─── Types ─────────────────────────────────────────────────────────────────

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;
export type BatchEvent = typeof batchEvents.$inferSelect;
export type NewBatchEvent = typeof batchEvents.$inferInsert;
