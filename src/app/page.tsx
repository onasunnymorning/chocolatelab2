"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StartBatchModal } from "@/components/StartBatchModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import type { Batch } from "@/db/schema";

interface ActiveWorkflow {
  workflowId: string;
  runId: string;
  startTime: string | null;
}

function ElapsedTime({ startTime }: { startTime: string | null }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [startTime]);

  return <span>{elapsed || "—"}</span>;
}

function ActiveBatchCard({ batch }: { batch: ActiveWorkflow }) {
  return (
    <Link href={`/batch/${batch.workflowId}`}>
      <div className="group choc-card-glow bg-card rounded-2xl p-4 flex items-center gap-4 hover:bg-card/80 transition-all active:scale-[0.98] cursor-pointer border border-border/40">
        {/* Live indicator */}
        <div className="w-3 h-3 rounded-full bg-amber-400 live-pulse flex-none" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-muted-foreground truncate">
            {batch.workflowId}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <ElapsedTime startTime={batch.startTime} />
            </span>
          </div>
        </div>

        <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-none" />
      </div>
    </Link>
  );
}

function CompletedBatchCard({ batch }: { batch: Batch }) {
  const duration =
    batch.startTime && batch.endTime
      ? (() => {
          const diff =
            new Date(batch.endTime).getTime() -
            new Date(batch.startTime).getTime();
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          return `${h}h ${m}m`;
        })()
      : null;

  return (
    <div className="choc-card-glow bg-card rounded-2xl p-4 flex items-center gap-4 border border-border/40">
      <CheckCircle2Icon className="w-5 h-5 text-green-500 flex-none" />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{batch.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <Badge
            variant="secondary"
            className="text-xs bg-amber-400/15 text-amber-300 border-amber-400/30"
          >
            {batch.cacaoPercentage}%
          </Badge>
          {duration && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {duration}
            </span>
          )}
          {batch.endTime && (
            <span className="text-xs text-muted-foreground">
              {new Date(batch.endTime).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeBatches, setActiveBatches] = useState<ActiveWorkflow[]>([]);
  const [completedBatches, setCompletedBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        fetch("/api/active"),
        fetch("/api/batches"),
      ]);
      const activeData = await activeRes.json();
      const completedData = await completedRes.json();
      setActiveBatches(activeData.batches ?? []);
      setCompletedBatches(completedData.batches ?? []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen fade-up">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              🍫 Chocolate Lab
            </h1>
            <p className="text-xs text-muted-foreground">Refinement Tracker</p>
          </div>
          <Button
            id="open-start-modal"
            onClick={() => setShowModal(true)}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 amber-glow transition-all flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Batch
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Active batches */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Active Refinements
            </h2>
            <div className="w-2 h-2 rounded-full bg-amber-400 live-pulse" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2Icon className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : activeBatches.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border/40 rounded-2xl">
              <p>No active batches.</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                Start a new batch to begin tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBatches.map((b) => (
                <ActiveBatchCard key={b.workflowId} batch={b} />
              ))}
            </div>
          )}
        </section>

        {/* Completed batches */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4">
            Completed Batches
          </h2>
          {completedBatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/40 rounded-2xl">
              <p>No completed batches yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedBatches.map((b) => (
                <CompletedBatchCard key={b.id} batch={b} />
              ))}
            </div>
          )}
        </section>
      </main>

      <StartBatchModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}
