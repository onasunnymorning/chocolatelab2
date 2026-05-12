"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, TrashIcon } from "lucide-react";

interface Ingredient {
  name: string;
  amount: string;
}

interface StartBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartBatchModal({ open, onOpenChange }: StartBatchModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cacaoPercentage, setCacaoPercentage] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { name: "", amount: "" }]);

  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const updateIngredient = (
    i: number,
    field: keyof Ingredient,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !cacaoPercentage) {
      setError("Batch name and cacao % are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          cacaoPercentage,
          initialIngredients: ingredients.filter(
            (i) => i.name.trim() && i.amount.trim()
          ),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to start batch");
      }

      const { workflowId } = await res.json();
      onOpenChange(false);
      router.push(`/batch/${workflowId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 max-w-lg mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            🍫 Start New Batch
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details to begin a new refinement run.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Batch Name */}
          <div className="space-y-2">
            <Label htmlFor="batch-name" className="text-sm font-semibold">
              Batch Name
            </Label>
            <Input
              id="batch-name"
              placeholder="e.g. Ghana 72% Dark — Run 14"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl"
            />
          </div>

          {/* Cacao % */}
          <div className="space-y-2">
            <Label htmlFor="cacao-pct" className="text-sm font-semibold">
              Cacao Percentage
            </Label>
            <div className="relative">
              <Input
                id="cacao-pct"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="72"
                value={cacaoPercentage}
                onChange={(e) => setCacaoPercentage(e.target.value)}
                className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                %
              </span>
            </div>
          </div>

          {/* Initial Ingredients */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Initial Ingredients
            </Label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Cacao mass"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  className="h-12 flex-1 bg-secondary/50 border-border/60 rounded-xl text-sm"
                />
                <Input
                  placeholder="1200g"
                  value={ing.amount}
                  onChange={(e) =>
                    updateIngredient(i, "amount", e.target.value)
                  }
                  className="h-12 w-28 bg-secondary/50 border-border/60 rounded-xl text-sm"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg"
                    aria-label="Remove ingredient"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add ingredient
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            id="start-batch-submit"
            className="w-full h-14 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 amber-glow transition-all"
          >
            {loading ? "Starting…" : "Start Refinement ›"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
