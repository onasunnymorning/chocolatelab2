"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { EventTimeline } from "@/components/EventTimeline";
import { SignalButtons } from "@/components/SignalButtons";
import { Badge } from "@/components/ui/badge";
import type { RefinementState } from "@/temporal/types";
import {
  ArrowLeftIcon,
  ClockIcon,
  Loader2Icon,
  CheckCircle2Icon,
} from "lucide-react";

function ElapsedTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
      <ClockIcon className="w-4 h-4" />
      {elapsed}
    </div>
  );
}

export default function BatchPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const router = useRouter();

  const [state, setState] = useState<RefinementState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/batches/${workflowId}/state`);
      if (res.status === 404) {
        // Workflow completed — stop polling
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to load batch state");
        return;
      }
      const data: RefinementState = await res.json();
      setState(data);
      if (data.isEnded && pollRef.current) {
        clearInterval(pollRef.current);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchState();
    pollRef.current = setInterval(fetchState, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchState]);

  const handleEnded = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    // Give the activity a moment to write the DB record, then redirect
    setTimeout(() => router.push("/"), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2Icon className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-destructive font-semibold">{error}</p>
        <Link href="/" className="text-sm text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="min-h-screen fade-up pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base text-foreground truncate">
              {state.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="secondary"
                className="text-xs bg-amber-400/15 text-amber-300 border-amber-400/30 px-2 py-0"
              >
                {state.cacaoPercentage}%
              </Badge>
              {state.isEnded ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 live-pulse" />
                  Refining
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-6">
        {/* Timer */}
        {!state.isEnded && <ElapsedTimer startTime={state.startTime} />}

        {state.isEnded && (
          <div className="rounded-2xl bg-green-500/10 border border-green-500/30 px-4 py-4 text-center text-sm text-green-300 font-medium">
            ✅ Refinement complete! Saving report and redirecting…
          </div>
        )}

        {/* Timeline */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Event Log
            </h2>
            <span className="text-xs text-muted-foreground">
              {state.events.length} event{state.events.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="choc-card-glow bg-card rounded-2xl p-4 border border-border/40">
            <EventTimeline events={state.events} />
          </div>
        </section>

        {/* Signal buttons — only show if still active */}
        {!state.isEnded && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Log Activity
            </h2>
            <SignalButtons
              workflowId={workflowId}
              onSignalSent={fetchState}
              onEnded={handleEnded}
            />
          </section>
        )}

        {/* Workflow ID footer */}
        <p className="text-center text-xs text-muted-foreground/50 font-mono break-all">
          {workflowId}
        </p>
      </main>
    </div>
  );
}
