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
  BeakerIcon,
  StickyNoteIcon,
  CircleStopIcon,
  Loader2Icon,
} from "lucide-react";

interface SignalButtonsProps {
  workflowId: string;
  onSignalSent?: () => void;
  onEnded?: () => void;
}

type ModalType = "ingredient" | "sample" | "note" | "end" | null;

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
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !amount.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    try {
      await sendSignal(workflowId, "addIngredientSignal", {
        name: name.trim(),
        amount: amount.trim(),
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
          <PackageIcon className="w-5 h-5" /> Add Ingredient
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>Ingredient</Label>
          <Input
            placeholder="Cacao butter"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            placeholder="200g"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl"
          />
        </div>
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
          {loading ? <Loader2Icon className="animate-spin" /> : "Log Ingredient"}
        </Button>
      </div>
    </>
  );
}

function SampleModal({
  workflowId,
  onClose,
  onSuccess,
}: {
  workflowId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!observation.trim()) {
      setError("Observation is required.");
      return;
    }
    setLoading(true);
    try {
      await sendSignal(workflowId, "takeSampleSignal", {
        observation: observation.trim(),
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
        <DialogTitle className="text-sky-400 flex items-center gap-2 text-lg">
          <BeakerIcon className="w-5 h-5" /> Take Sample
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>Observation</Label>
          <Textarea
            placeholder="Texture feels smooth, slight bitterness, temperature 45°C…"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="min-h-[120px] text-base bg-secondary/50 border-border/60 rounded-xl resize-none"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <Button
          id="signal-sample-submit"
          onClick={submit}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-sky-500 hover:bg-sky-400 text-sky-950 font-bold text-base"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : "Log Sample"}
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
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!note.trim()) {
      setError("Note cannot be empty.");
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
          <StickyNoteIcon className="w-5 h-5" /> Add Note
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>Note</Label>
          <Textarea
            placeholder="Increased temp to 50°C, added more lecithin…"
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
          {loading ? <Loader2Icon className="animate-spin" /> : "Save Note"}
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
          <CircleStopIcon className="w-5 h-5" /> End Refinement
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <p className="text-muted-foreground text-sm leading-relaxed">
          This will finalize the batch and save the full report to the database.
          The workflow will be marked as <strong className="text-foreground">Completed</strong>.
          This cannot be undone.
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
            Cancel
          </Button>
          <Button
            id="signal-end-submit"
            onClick={submit}
            disabled={loading}
            className="flex-1 h-14 rounded-xl bg-destructive hover:bg-destructive/80 text-white font-bold text-base"
          >
            {loading ? <Loader2Icon className="animate-spin" /> : "End Batch"}
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
  const [modal, setModal] = useState<ModalType>(null);

  const close = () => setModal(null);

  return (
    <>
      {/* 2×2 grid of large tap targets */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          id="btn-add-ingredient"
          onClick={() => setModal("ingredient")}
          className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 font-semibold transition-all"
        >
          <PackageIcon className="w-6 h-6" />
          <span className="text-sm">Add Ingredient</span>
        </Button>

        <Button
          id="btn-take-sample"
          onClick={() => setModal("sample")}
          className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 font-semibold transition-all"
        >
          <BeakerIcon className="w-6 h-6" />
          <span className="text-sm">Take Sample</span>
        </Button>

        <Button
          id="btn-add-note"
          onClick={() => setModal("note")}
          className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-2xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-400/30 text-violet-300 font-semibold transition-all"
        >
          <StickyNoteIcon className="w-6 h-6" />
          <span className="text-sm">Add Note</span>
        </Button>

        <Button
          id="btn-end-refinement"
          onClick={() => setModal("end")}
          className="h-20 flex flex-col gap-1.5 items-center justify-center rounded-2xl bg-destructive/15 hover:bg-destructive/25 border border-destructive/30 text-red-400 font-semibold transition-all"
        >
          <CircleStopIcon className="w-6 h-6" />
          <span className="text-sm">End Refinement</span>
        </Button>
      </div>

      {/* Shared modal shell */}
      <Dialog open={modal !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="bg-card border-border/50 max-w-lg mx-4 rounded-2xl">
          {modal === "ingredient" && (
            <IngredientModal
              workflowId={workflowId}
              onClose={close}
              onSuccess={onSignalSent ?? (() => {})}
            />
          )}
          {modal === "sample" && (
            <SampleModal
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
