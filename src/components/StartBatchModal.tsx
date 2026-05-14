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
import { useLanguage } from "@/i18n/context";

interface Ingredient {
  name: string;
  amount: string;
  isCacao: boolean;
}

interface StartBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartBatchModal({ open, onOpenChange }: StartBatchModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", isCacao: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { name: "", amount: "", isCacao: false }]);

  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const updateIngredient = (
    i: number,
    field: keyof Ingredient,
    value: string | boolean
  ) => {
    setIngredients((prev) =>
      prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing))
    );
  };

  /** Live-compute cacao % from current ingredient state */
  const computedCacaoPct = (): number | null => {
    const totalGrams = ingredients.reduce((sum, ing) => {
      const g = parseFloat(ing.amount);
      return sum + (isNaN(g) ? 0 : g);
    }, 0);
    if (totalGrams === 0) return null;
    const cacaoGrams = ingredients.reduce((sum, ing) => {
      if (!ing.isCacao) return sum;
      const g = parseFloat(ing.amount);
      return sum + (isNaN(g) ? 0 : g);
    }, 0);
    return Math.round((cacaoGrams / totalGrams) * 10000) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.startBatch.errorNameRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          initialIngredients: ingredients.filter(
            (i) => i.name.trim() && i.amount.trim()
          ),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t.startBatch.errorStartFailed);
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

  const cacaoPct = computedCacaoPct();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            {t.startBatch.title}
            {cacaoPct !== null && (
              <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                {cacaoPct}{t.startBatch.descriptionSuffix}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.startBatch.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Batch Name */}
          <div className="space-y-2">
            <Label htmlFor="batch-name" className="text-sm font-semibold">
              {t.startBatch.batchNameLabel}
            </Label>
            <Input
              id="batch-name"
              placeholder={t.startBatch.batchNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-base bg-secondary/50 border-border/60 rounded-xl"
            />
          </div>

          {/* Initial Ingredients */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t.startBatch.ingredientsLabel}
            </Label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Name — full width on mobile */}
                <Input
                  placeholder={t.startBatch.ingredientNamePlaceholder}
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  className="h-12 sm:flex-1 bg-secondary/50 border-border/60 rounded-xl text-sm"
                />
                {/* Grams + cacao + delete — share a row on mobile */}
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder={t.startBatch.gramsPlaceholder}
                    type="number"
                    min="0"
                    step="any"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    className="h-12 w-24 bg-secondary/50 border-border/60 rounded-xl text-sm"
                  />
                  {/* isCacao toggle */}
                  <label
                    htmlFor={`is-cacao-${i}`}
                    className={`flex flex-1 sm:flex-none items-center gap-1.5 h-12 px-3 rounded-xl border cursor-pointer select-none text-xs font-medium transition-colors whitespace-nowrap ${
                      ing.isCacao
                        ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                        : "bg-secondary/30 border-border/40 text-muted-foreground hover:border-border/70"
                    }`}
                  >
                    <input
                      id={`is-cacao-${i}`}
                      type="checkbox"
                      checked={ing.isCacao}
                      onChange={(e) => updateIngredient(i, "isCacao", e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-base">{ing.isCacao ? "🍫" : "○"}</span>
                    {t.startBatch.cacaoLabel}
                  </label>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg flex-none"
                      aria-label="Remove ingredient"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              {t.startBatch.addIngredient}
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
            {loading ? t.startBatch.submitLoading : t.startBatch.submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
