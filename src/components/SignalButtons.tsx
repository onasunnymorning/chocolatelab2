"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SignalType } from "@/temporal/types";
import {
  PackageIcon,
  StickyNoteIcon,
  CircleStopIcon,
  Loader2Icon,
} from "lucide-react";
import { CacaoPodIcon } from "@/components/CacaoPodIcon";
import { useLanguage } from "@/i18n/context";

interface SignalButtonsProps {
  workflowId: string;
  onSignalSent?: () => void;
  onEnded?: () => void;
}

type ModalType = "ingredient" | "note" | "end" | null;

async function sendSignal(
  workflowId: string,
  signalType: SignalType,
  payload?: Record<string, string>
) {
  const res = await fetch(`/api/batches/${workflowId}/signal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signalType, payload }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Signal failed");
  }
}

// ── Sub-modals ────────────────────────────────────────────────────────────────

function IngredientModal({
  workflowId,
  onClose,
  onSuccess,
}: {
  workflowId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isCacao, setIsCacao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !amount.trim()) {
      setError(t.signals.errorBothRequired);
      return;
    }
    setLoading(true);
    try {
      await sendSignal(workflowId, "addIngredientSignal", {
        name: name.trim(),
        amount: amount.trim(),
        isCacao: String(isCacao),
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-amber-400 flex items-center gap-2 text-lg">
          <PackageIcon className="w-5 h-5" /> {t.signals.addIngredient}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>{t.signals.ingredientLabel}</Label>
          <Input
            placeholder={t.signals.ingredientPlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>{t.signals.amountLabel}</Label>
          <Input
            placeholder={t.signals.amountPlaceholder}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl"
          />
        </div>
        {/* isCacao toggle */}
        <label
          htmlFor="signal-is-cacao"
          className={`flex items-center gap-3 h-14 px-4 rounded-xl border cursor-pointer select-none transition-colors ${
            isCacao
              ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
              : "bg-secondary/30 border-border/40 text-muted-foreground hover:border-border/70"
          }`}
        >
          <input
            id="signal-is-cacao"
            type="checkbox"
            checked={isCacao}
            onChange={(e) => setIsCacao(e.target.checked)}
            className="sr-only"
          />
          {isCacao ? <CacaoPodIcon size={22} /> : <span className="text-xl opacity-50">○</span>}
          <div>
            <p className="text-sm font-semibold leading-none">
              {isCacao ? t.signals.isCacaoActive : t.signals.isCacaoInactive}
            </p>
            <p className="text-xs opacity-60 mt-0.5">{t.signals.isCacaoDesc}</p>
          </div>
        </label>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <Button
          id="signal-ingredient-submit"
          onClick={submit}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-base"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : t.signals.logIngredient}
        </Button>
      </div>
    </>
  );
}

function NoteModal({
  workflowId,
  onClose,
  onSuccess,
}: {
  workflowId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!note.trim()) {
      setError(t.signals.errorNoteEmpty);
      return;
    }
    setLoading(true);
    try {
      await sendSignal(workflowId, "addNoteSignal", { note: note.trim() });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-violet-400 flex items-center gap-2 text-lg">
          <StickyNoteIcon className="w-5 h-5" /> {t.signals.addNote}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>{t.signals.noteLabel}</Label>
          <Textarea
            placeholder={t.signals.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[120px] text-base bg-secondary/50 border-border/60 rounded-xl resize-none"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <Button
          id="signal-note-submit"
          onClick={submit}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-base"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : t.signals.saveNote}
        </Button>
      </div>
    </>
  );
}

function EndModal({
  workflowId,
  onClose,
  onSuccess,
}: {
  workflowId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      await sendSignal(workflowId, "endRefinementSignal");
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-destructive flex items-center gap-2 text-lg">
          <CircleStopIcon className="w-5 h-5" /> {t.signals.endRefinement}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t.signals.endConfirmText}{" "}
          <strong className="text-foreground">{t.signals.endConfirmCompleted}</strong>.{" "}
          {t.signals.endConfirmWarning}
        </p>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-14 rounded-xl border-border/60"
          >
            {t.signals.cancel}
          </Button>
          <Button
            id="signal-end-submit"
            onClick={submit}
            disabled={loading}
            className="flex-1 h-14 rounded-xl bg-destructive hover:bg-destructive/80 text-white font-bold text-base"
          >
            {loading ? <Loader2Icon className="animate-spin" /> : t.signals.endBatch}
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SignalButtons({
  workflowId,
  onSignalSent,
  onEnded,
}: SignalButtonsProps) {
  const { t } = useLanguage();
  const [modal, setModal] = useState<ModalType>(null);

  const close = () => setModal(null);

  return (
    <>
      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Button
          id="btn-add-ingredient"
          onClick={() => setModal("ingredient")}
          className="action-btn h-auto py-4 flex flex-col gap-1 items-center justify-center rounded-2xl bg-amber-500/12 hover:bg-amber-500/22 border border-amber-400/30 text-amber-300 font-semibold"
        >
          <PackageIcon className="w-6 h-6 mb-0.5" />
          <span className="text-sm font-bold leading-none">{t.signals.addIngredient}</span>
          <span className="text-[10px] font-normal opacity-55 leading-none">{t.signals.addIngredientDesc}</span>
        </Button>

        <Button
          id="btn-add-note"
          onClick={() => setModal("note")}
          className="action-btn h-auto py-4 flex flex-col gap-1 items-center justify-center rounded-2xl bg-violet-500/12 hover:bg-violet-500/22 border border-violet-400/30 text-violet-300 font-semibold"
        >
          <StickyNoteIcon className="w-6 h-6 mb-0.5" />
          <span className="text-sm font-bold leading-none">{t.signals.addNote}</span>
          <span className="text-[10px] font-normal opacity-55 leading-none">{t.signals.addNoteDesc}</span>
        </Button>
      </div>

      {/* Destructive action — full width, visually separated */}
      <Button
        id="btn-end-refinement"
        onClick={() => setModal("end")}
        className="action-btn w-full h-auto py-3.5 flex items-center justify-center gap-3 rounded-2xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/35 text-red-400 font-semibold"
      >
        <CircleStopIcon className="w-5 h-5 flex-none" />
        <div className="text-left">
          <p className="text-sm font-bold leading-none">{t.signals.endRefinement}</p>
          <p className="text-[10px] font-normal opacity-55 leading-none mt-0.5">{t.signals.endRefinementDesc}</p>
        </div>
      </Button>

      {/* Shared modal shell */}
      <Dialog open={modal !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg rounded-2xl">
          {modal === "ingredient" && (
            <IngredientModal
              workflowId={workflowId}
              onClose={close}
              onSuccess={onSignalSent ?? (() => {})}
            />
          )}
          {modal === "note" && (
            <NoteModal
              workflowId={workflowId}
              onClose={close}
              onSuccess={onSignalSent ?? (() => {})}
            />
          )}
          {modal === "end" && (
            <EndModal
              workflowId={workflowId}
              onClose={close}
              onSuccess={onEnded ?? (() => {})}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
