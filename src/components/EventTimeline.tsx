"use client";

import type { RefinementEvent } from "@/temporal/types";

const EVENT_CONFIG = {
  INGREDIENT_ADDED: {
    label: "Ingredient Added",
    color: "text-amber-400",
    bg: "bg-amber-400/15",
    border: "border-amber-400/30",
    chipBg: "bg-amber-400/20",
    chipText: "text-amber-300",
    dotColor: "bg-amber-400",
    glowColor: "oklch(0.82 0.16 78 / 25%)",
  },
  NOTE_ADDED: {
    label: "Note",
    color: "text-violet-400",
    bg: "bg-violet-400/15",
    border: "border-violet-400/30",
    chipBg: "bg-violet-400/20",
    chipText: "text-violet-300",
    dotColor: "bg-violet-400",
    glowColor: "oklch(0.60 0.22 300 / 25%)",
  },
} as const;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Turn "butter" → "Butter", "cocoa nibs" → "Cocoa Nibs" */
function titleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function buildBody(event: RefinementEvent): string {
  if (event.type === "INGREDIENT_ADDED") {
    const name = titleCase(event.payload.name ?? "Ingredient");
    const amount = event.payload.amount ?? "";
    return `${amount}g of ${name} added`;
  }
  if (event.type === "NOTE_ADDED") {
    return event.payload.note ?? "";
  }
  return "";
}

function EventCard({
  event,
  isLast,
  isNewest,
  index,
}: {
  event: RefinementEvent;
  isLast: boolean;
  isNewest: boolean;
  index: number;
}) {
  const config = EVENT_CONFIG[event.type];
  const body = buildBody(event);
  const isCacao = event.type === "INGREDIENT_ADDED" && event.payload.isCacao === "true";

  return (
    <div
      className={`event-card-enter relative flex gap-4 ${!isLast ? "timeline-line pb-8" : "pb-2"}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Dot node — no icon */}
      <div
        className={`relative z-10 flex-none w-3 h-3 mt-1.5 rounded-full ${config.dotColor} ${isNewest ? "node-glow" : ""}`}
        style={isNewest ? { boxShadow: `0 0 0 0 ${config.glowColor}` } : undefined}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Time row */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${config.chipText}`}
          >
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums whitespace-nowrap">
            {formatTime(event.timestamp)}
          </span>
        </div>

        {/* Human-readable body */}
        <p className="text-base font-semibold text-foreground/90 leading-snug break-words">
          {body}
        </p>

        {/* isCacao tag — only when true */}
        {isCacao && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
            cacao
          </span>
        )}

        {/* Relative time */}
        <p className="mt-1 text-[10px] text-muted-foreground/40 font-mono">
          {relativeTime(event.timestamp)}
        </p>
      </div>
    </div>
  );
}

interface EventTimelineProps {
  events: RefinementEvent[];
  isEnded?: boolean;
  endTime?: string | null;
}

export function EventTimeline({ events, isEnded, endTime }: EventTimelineProps) {
  if (events.length === 0 && !isEnded) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-muted/20 opacity-40" />
        <p className="font-medium">No events yet</p>
        <p className="text-xs mt-1 opacity-60">Use the actions below to log activity.</p>
      </div>
    );
  }

  return (
    <div className="px-1 pt-2">
      {events.map((event, i) => (
        <EventCard
          key={i}
          event={event}
          isLast={i === events.length - 1 && !isEnded}
          isNewest={i === events.length - 1 && !isEnded}
          index={i}
        />
      ))}

      {/* Completion marker */}
      {isEnded && (
        <div className="event-card-enter relative flex gap-4 pb-2" style={{ animationDelay: `${events.length * 60}ms` }}>
          {/* Green terminal dot */}
          <div className="relative z-10 flex-none w-3 h-3 mt-1.5 rounded-full bg-green-400 ring-2 ring-green-400/30" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                Refinement Complete
              </span>
              {endTime && (
                <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums whitespace-nowrap">
                  {new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-green-400/80 leading-snug">
              Batch closed
            </p>
            {endTime && (
              <p className="mt-1 text-[10px] text-muted-foreground/40 font-mono">
                {new Date(endTime).toLocaleDateString([], { month: "short", day: "numeric" })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
