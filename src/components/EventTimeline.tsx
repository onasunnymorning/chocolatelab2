"use client";

import type { RefinementEvent } from "@/temporal/types";
import { BeakerIcon, StickyNoteIcon, FlaskConicalIcon, PackageIcon } from "lucide-react";

const EVENT_CONFIG = {
  INGREDIENT_ADDED: {
    icon: PackageIcon,
    label: "Ingredient Added",
    color: "text-amber-400",
    bg: "bg-amber-400/15",
    border: "border-amber-400/30",
  },
  SAMPLE_TAKEN: {
    icon: BeakerIcon,
    label: "Sample Taken",
    color: "text-sky-400",
    bg: "bg-sky-400/15",
    border: "border-sky-400/30",
  },
  NOTE_ADDED: {
    icon: StickyNoteIcon,
    label: "Note",
    color: "text-violet-400",
    bg: "bg-violet-400/15",
    border: "border-violet-400/30",
  },
} as const;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function EventCard({ event, isLast }: { event: RefinementEvent; isLast: boolean }) {
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;

  const body =
    event.type === "INGREDIENT_ADDED"
      ? `${event.payload.name} — ${event.payload.amount}`
      : event.type === "SAMPLE_TAKEN"
      ? event.payload.observation
      : event.payload.note;

  return (
    <div className={`relative flex gap-4 pb-6 ${!isLast ? "timeline-line" : ""}`}>
      {/* Icon dot */}
      <div
        className={`relative z-10 flex-none w-10 h-10 rounded-full flex items-center justify-center border ${config.bg} ${config.border}`}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
            {config.label}
          </span>
          <div className="text-right flex-none">
            <div className="text-xs text-muted-foreground font-mono">
              {formatTime(event.timestamp)}
            </div>
            <div className="text-xs text-muted-foreground/60 font-mono">
              {formatDate(event.timestamp)}
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-foreground/90 break-words">{body}</p>
      </div>
    </div>
  );
}

interface EventTimelineProps {
  events: RefinementEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        <FlaskConicalIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
        No events yet. Use the buttons below to log activity.
      </div>
    );
  }

  return (
    <div className="px-1 pt-2">
      {events.map((event, i) => (
        <EventCard key={i} event={event} isLast={i === events.length - 1} />
      ))}
    </div>
  );
}
