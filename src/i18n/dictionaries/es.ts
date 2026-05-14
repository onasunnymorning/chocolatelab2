import type { Dictionary } from "./en";

export const es: Dictionary = {
  // ── Global ────────────────────────────────────────────────────────────────
  appName: "Chocolate Lab",
  appSubtitle: "Rastreador de Refinado",

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    newBatch: "Nuevo Lote",
    activeRefinements: "Refinados Activos",
    completedBatches: "Lotes Completados",
    noActiveBatches: "No hay lotes activos.",
    noActiveBatchesHint: "Inicia un nuevo lote para comenzar el seguimiento.",
    noCompletedBatches: "Aún no hay lotes completados.",
    cacaoSuffix: "% cacao",
  },

  // ── Batch detail ──────────────────────────────────────────────────────────
  batch: {
    backLabel: "Atrás",
    statusCompleted: "Completado",
    statusRefining: "Refinando",
    eventLog: "Registro de Eventos",
    eventCount: (n: number) => `${n} evento${n !== 1 ? "s" : ""}`,
    logActivity: "Registrar Actividad",
    backToDashboard: "Volver al panel",
    cacaoSuffix: "% cacao",
  },

  // ── Start batch modal ─────────────────────────────────────────────────────
  startBatch: {
    title: "Iniciar Nuevo Lote",
    descriptionSuffix: "% cacao",
    description: "Completa los detalles para comenzar una nueva ronda de refinado.",
    batchNameLabel: "Nombre del Lote",
    batchNamePlaceholder: "p.ej. Ghana 72% Oscuro — Tanda 14",
    ingredientsLabel: "Ingredientes Iniciales",
    ingredientNamePlaceholder: "Nombre del ingrediente",
    gramsPlaceholder: "gramos",
    addIngredient: "Agregar ingrediente",
    cacaoLabel: "Cacao",
    isCacaoActive: "Ingrediente de cacao",
    isCacaoInactive: "Marcar como cacao",
    isCacaoDesc: "Cuenta para el cálculo del % de cacao",
    submitLoading: "Iniciando…",
    submitLabel: "Iniciar Refinado ›",
    errorNameRequired: "El nombre del lote es obligatorio.",
    errorStartFailed: "No se pudo iniciar el lote",
  },

  // ── Signal buttons ────────────────────────────────────────────────────────
  signals: {
    addIngredient: "+ Ingrediente",
    addIngredientDesc: "registrar lo que se agregó",
    addNote: "Agregar Nota",
    addNoteDesc: "observación libre",
    endRefinement: "Finalizar Refinado",
    endRefinementDesc: "cerrar y guardar informe del lote",
    ingredientLabel: "Ingrediente",
    ingredientPlaceholder: "Manteca de cacao",
    amountLabel: "Cantidad",
    amountPlaceholder: "200g",
    noteLabel: "Nota",
    notePlaceholder: "Temperatura aumentada a 50°C, se agregó más lecitina…",
    logIngredient: "Registrar Ingrediente",
    saveNote: "Guardar Nota",
    endBatch: "Finalizar Lote",
    cancel: "Cancelar",
    endConfirmText:
      "Esto finalizará el lote y guardará el informe completo en la base de datos. El flujo de trabajo quedará marcado como",
    endConfirmCompleted: "Completado",
    endConfirmWarning: "Esta acción no se puede deshacer.",
    errorBothRequired: "Ambos campos son obligatorios.",
    errorNoteEmpty: "La nota no puede estar vacía.",
    isCacaoActive: "Ingrediente de cacao",
    isCacaoInactive: "Marcar como cacao",
    isCacaoDesc: "Cuenta para el cálculo del % de cacao",
  },

  // ── Event timeline ────────────────────────────────────────────────────────
  timeline: {
    ingredientAdded: "Ingrediente Agregado",
    sampleTaken: "Muestra Tomada",
    noteAdded: "Nota",
    refinementComplete: "Refinado Completo",
    batchClosed: "Lote cerrado",
    noEventsYet: "Sin eventos aún",
    noEventsHint: "Usa las acciones de abajo para registrar actividad.",
    justNow: "ahora mismo",
    minutesAgo: (n: number) => `hace ${n}m`,
    hoursAgo: (n: number) => `hace ${n}h`,
    ingredientBody: (amount: string, name: string) => `${amount}g de ${name} agregado`,
    sampleBody: "Muestra tomada para cata",
    cacaoTag: "cacao",
  },

  // ── Language switcher ─────────────────────────────────────────────────────
  langSwitcher: {
    en: "EN",
    es: "ES",
    switchTo: "Cambiar idioma",
  },
};
