import {
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  proxyActivities,
  workflowInfo,
} from "@temporalio/workflow";
import type {
  RefinementInput,
  RefinementState,
  RefinementEvent,
  AddIngredientPayload,
  TakeSamplePayload,
  AddNotePayload,
} from "../types";
import type { Activities } from "../activities/saveRefinementReport";

// ─── Signal & Query Definitions ────────────────────────────────────────────

export const addIngredientSignal =
  defineSignal<[AddIngredientPayload]>("addIngredientSignal");
export const takeSampleSignal =
  defineSignal<[TakeSamplePayload]>("takeSampleSignal");
export const addNoteSignal = defineSignal<[AddNotePayload]>("addNoteSignal");
export const endRefinementSignal = defineSignal("endRefinementSignal");
export const getRefinementStateQuery =
  defineQuery<RefinementState>("getRefinementStateQuery");

// ─── Activity Proxy ────────────────────────────────────────────────────────

const { saveRefinementReport } = proxyActivities<Activities>({
  startToCloseTimeout: "2 minutes",
  retry: {
    maximumAttempts: 3,
    initialInterval: "5s",
    backoffCoefficient: 2,
  },
});

// ─── Workflow ──────────────────────────────────────────────────────────────

export async function refinementWorkflow(
  input: RefinementInput
): Promise<void> {
  const { workflowId } = workflowInfo();

  const events: RefinementEvent[] = [];
  let isEnded = false;

  // Seed with initial ingredients provided at start time
  for (const ingredient of input.initialIngredients) {
    events.push({
      type: "INGREDIENT_ADDED",
      payload: { name: ingredient.name, amount: ingredient.amount },
      timestamp: input.startTime,
    });
  }

  // ── Signal Handlers ──────────────────────────────────────────────────────

  setHandler(addIngredientSignal, ({ name, amount }: AddIngredientPayload) => {
    events.push({
      type: "INGREDIENT_ADDED",
      payload: { name, amount },
      timestamp: new Date().toISOString(),
    });
  });

  setHandler(takeSampleSignal, ({ observation }: TakeSamplePayload) => {
    events.push({
      type: "SAMPLE_TAKEN",
      payload: { observation },
      timestamp: new Date().toISOString(),
    });
  });

  setHandler(addNoteSignal, ({ note }: AddNotePayload) => {
    events.push({
      type: "NOTE_ADDED",
      payload: { note },
      timestamp: new Date().toISOString(),
    });
  });

  setHandler(endRefinementSignal, () => {
    isEnded = true;
  });

  // ── Query Handler ────────────────────────────────────────────────────────

  setHandler(getRefinementStateQuery, (): RefinementState => ({
    workflowId,
    name: input.name,
    cacaoPercentage: input.cacaoPercentage,
    startTime: input.startTime,
    events: [...events],
    isEnded,
  }));

  // ── Wait for end signal ──────────────────────────────────────────────────

  await condition(() => isEnded);

  // ── Persist report ───────────────────────────────────────────────────────

  await saveRefinementReport({
    workflowId,
    name: input.name,
    startTime: input.startTime,
    endTime: new Date().toISOString(),
    cacaoPercentage: input.cacaoPercentage,
    events,
  });
}
