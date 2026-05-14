"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EventTimeline } from "@/components/EventTimeline";
import { SignalButtons } from "@/components/SignalButtons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import type { RefinementState } from "@/temporal/types";
import { useLanguage } from "@/i18n/context";
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
  const { t } = useLanguage();

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
          {t.batch.backToDashboard}
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
            className="p-1.5 -ml-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label={t.batch.backLabel}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <Image
            src="/logo-mark.png"
            alt="De Prins"
            width={28}
            height={32}
            priority
            className="flex-none opacity-80"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base text-foreground truncate">
              {state.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {state.cacaoPercentage != null && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-amber-400/15 text-amber-300 border-amber-400/30 px-2 py-0"
                >
                  {state.cacaoPercentage}{t.batch.cacaoSuffix}
                </Badge>
              )}
              {state.isEnded ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                  {t.batch.statusCompleted}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 live-pulse" />
                  {t.batch.statusRefining}
                </span>
              )}
            </div>
          </div>
          {/* Timer + language switcher in header */}
          <div className="flex items-center gap-2 flex-none">
            {!state.isEnded && (
              <ElapsedTimer startTime={state.startTime} />
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-6 pb-[200px]">
        {/* Timeline */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t.batch.eventLog}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t.batch.eventCount(state.events.length)}
            </span>
          </div>
          <div className="choc-card-glow bg-card rounded-2xl p-4 border border-border/40">
            <EventTimeline
              events={state.events}
              isEnded={state.isEnded}
              endTime={state.endTime ?? null}
            />
          </div>
        </section>

        {/* Workflow ID footer */}
        <p className="text-center text-xs text-muted-foreground/50 font-mono break-all">
          {workflowId}
        </p>
      </main>

      {/* Sticky action bar — always thumb-reachable */}
      {!state.isEnded && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-lg border-t border-border/30 safe-bottom">
          <div className="max-w-2xl mx-auto px-4 pt-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 text-center">
              {t.batch.logActivity}
            </p>
            <SignalButtons
              workflowId={workflowId}
              onSignalSent={fetchState}
              onEnded={handleEnded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
