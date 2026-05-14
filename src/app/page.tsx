"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { StartBatchModal } from "@/components/StartBatchModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react";
import type { Batch } from "@/db/schema";
import { useLanguage } from "@/i18n/context";

interface ActiveWorkflow {
  workflowId: string;
  name: string;
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
      <div className="group choc-card-glow bg-card rounded-2xl px-5 py-5 flex items-center gap-4 border border-amber-400/20 hover:bg-card/80 transition-all active:scale-[0.98] cursor-pointer min-h-[96px]">
        <div className="flex-1 min-w-0">
          <p className="text-4xl font-black text-foreground leading-none truncate tracking-tight">
            {batch.name}
          </p>
          <p className="text-xs text-amber-400/70 mt-2.5 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 live-pulse inline-block" />
            <ElapsedTime startTime={batch.startTime} />
          </p>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-none" />
      </div>
    </Link>
  );
}

function CompletedBatchCard({ batch }: { batch: Batch }) {
  const { t } = useLanguage();
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
    <Link href={`/batch/${batch.workflowId}`}>
      <div className="group choc-card-glow bg-card rounded-2xl px-5 py-5 flex items-center gap-4 border border-border/40 hover:bg-card/80 transition-all active:scale-[0.98] cursor-pointer min-h-[96px]">
        <div className="flex-1 min-w-0">
          <p className="text-4xl font-black text-foreground leading-none truncate tracking-tight">
            {batch.name}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2.5 font-mono">
            {[batch.endTime && new Date(batch.endTime).toLocaleDateString([], { month: "short", day: "numeric" }), duration]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {batch.cacaoPercentage != null && (
          <div className="flex-none text-right">
            <p className="text-2xl font-black text-amber-400 leading-none tabular-nums">
              {batch.cacaoPercentage}{t.dashboard.cacaoSuffix}
            </p>
          </div>
        )}

        <ChevronRightIcon className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-none" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
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
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.png"
              alt="De Prins logo"
              width={36}
              height={52}
              priority
              className="flex-none brightness-0 invert opacity-90"
              style={{ objectFit: "contain" }}
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground leading-none">
                {t.appName}
              </h1>
              <p className="hidden sm:block text-[11px] tracking-widest uppercase text-muted-foreground/70 mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              id="open-start-modal"
              onClick={() => setShowModal(true)}
              aria-label={t.dashboard.newBatch}
              className="h-10 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 amber-glow transition-all flex items-center gap-2 px-3 sm:px-4"
            >
              <PlusIcon className="w-4 h-4 flex-none" />
              <span className="hidden sm:inline">{t.dashboard.newBatch}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Active batches */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-foreground">
              {t.dashboard.activeRefinements}
            </h2>
            <div className="w-2 h-2 rounded-full bg-amber-400 live-pulse" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2Icon className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : activeBatches.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border/40 rounded-2xl">
              <p>{t.dashboard.noActiveBatches}</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                {t.dashboard.noActiveBatchesHint}
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
            {t.dashboard.completedBatches}
          </h2>
          {completedBatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/40 rounded-2xl">
              <p>{t.dashboard.noCompletedBatches}</p>
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
