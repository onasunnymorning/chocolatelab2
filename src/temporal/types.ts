// ─── Shared types used by both the Temporal workflow and the API layer ──────
// This file must NOT import from '@temporalio/workflow' — it is plain TS.

export interface RefinementIngredient {
  name: string;
  amount: string; // numeric grams, e.g. "1200"
  isCacao: boolean;
}

export interface RefinementEvent {
  type: "INGREDIENT_ADDED" | "SAMPLE_TAKEN" | "NOTE_ADDED";
  payload: Record<string, string>;
  timestamp: string; // ISO string
}

export interface RefinementInput {
  name: string;
  startTime: string; // ISO string
  initialIngredients: RefinementIngredient[];
}

export interface RefinementState {
  workflowId: string;
  name: string;
  /** Computed from INGREDIENT_ADDED events with isCacao=true */
  cacaoPercentage: number | null;
  startTime: string;
  endTime?: string | null;
  events: RefinementEvent[];
  isEnded: boolean;
}

export type SignalType =
  | "addIngredientSignal"
  | "takeSampleSignal"
  | "addNoteSignal"
  | "endRefinementSignal";

export interface AddIngredientPayload {
  name: string;
  amount: string;
  isCacao: boolean;
}

export interface TakeSamplePayload {
  observation: string;
}

export interface AddNotePayload {
  note: string;
}
