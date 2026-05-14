// DeepMutable removes 'as const' narrowing so translations can be any string
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
    ? DeepMutable<T[K]>
    : string;
};

export const en = {
  // ── Global ────────────────────────────────────────────────────────────────
  appName: "Chocolate Lab",
  appSubtitle: "Refinement Tracker",

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    newBatch: "New Batch",
    activeRefinements: "Active Refinements",
    completedBatches: "Completed Batches",
    noActiveBatches: "No active batches.",
    noActiveBatchesHint: "Start a new batch to begin tracking.",
    noCompletedBatches: "No completed batches yet.",
    cacaoSuffix: "% cacao",
  },

  // ── Batch detail ──────────────────────────────────────────────────────────
  batch: {
    backLabel: "Back",
    statusCompleted: "Completed",
    statusRefining: "Refining",
    eventLog: "Event Log",
    eventCount: (n: number) => `${n} event${n !== 1 ? "s" : ""}`,
    logActivity: "Log Activity",
    backToDashboard: "Back to dashboard",
    cacaoSuffix: "% cacao",
  },

  // ── Start batch modal ─────────────────────────────────────────────────────
  startBatch: {
    title: "Start New Batch",
    descriptionSuffix: "% cacao",
    description: "Fill in the details to begin a new refinement run.",
    batchNameLabel: "Batch Name",
    batchNamePlaceholder: "e.g. Ghana 72% Dark — Run 14",
    ingredientsLabel: "Initial Ingredients",
    ingredientNamePlaceholder: "Ingredient name",
    gramsPlaceholder: "grams",
    addIngredient: "Add ingredient",
    cacaoLabel: "Cacao",
    isCacaoActive: "Cacao ingredient",
    isCacaoInactive: "Mark as cacao",
    isCacaoDesc: "Counts toward cacao % calculation",
    submitLoading: "Starting…",
    submitLabel: "Start Refinement ›",
    errorNameRequired: "Batch name is required.",
    errorStartFailed: "Failed to start batch",
  },

  // ── Signal buttons ────────────────────────────────────────────────────────
  signals: {
    addIngredient: "+ Ingredient",
    addIngredientDesc: "log what went in",
    addNote: "Add Note",
    addNoteDesc: "freeform observation",
    endRefinement: "End Refinement",
    endRefinementDesc: "finalize & save batch report",
    ingredientLabel: "Ingredient",
    ingredientPlaceholder: "Cacao butter",
    amountLabel: "Amount",
    amountPlaceholder: "200g",
    noteLabel: "Note",
    notePlaceholder: "Increased temp to 50°C, added more lecithin…",
    logIngredient: "Log Ingredient",
    saveNote: "Save Note",
    endBatch: "End Batch",
    cancel: "Cancel",
    endConfirmText:
      "This will finalize the batch and save the full report to the database. The workflow will be marked as",
    endConfirmCompleted: "Completed",
    endConfirmWarning: "This cannot be undone.",
    errorBothRequired: "Both fields are required.",
    errorNoteEmpty: "Note cannot be empty.",
    isCacaoActive: "Cacao ingredient",
    isCacaoInactive: "Mark as cacao",
    isCacaoDesc: "Counts toward cacao % calculation",
  },

  // ── Event timeline ────────────────────────────────────────────────────────
  timeline: {
    ingredientAdded: "Ingredient Added",
    sampleTaken: "Sample Taken",
    noteAdded: "Note",
    refinementComplete: "Refinement Complete",
    batchClosed: "Batch closed",
    noEventsYet: "No events yet",
    noEventsHint: "Use the actions below to log activity.",
    justNow: "just now",
    minutesAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    ingredientBody: (amount: string, name: string) => `${amount}g of ${name} added`,
    sampleBody: "Sample taken for tasting",
    cacaoTag: "cacao",
  },

  // ── Language switcher ─────────────────────────────────────────────────────
  langSwitcher: {
    en: "EN",
    es: "ES",
    switchTo: "Switch language",
  },
};

export type Dictionary = DeepMutable<typeof en>;
