"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createVariantGroup,
  deleteVariantGroup,
  updateVariantGroup,
  getVariantGroupsByProductId,
} from "@/lib/actions/variants";
import { normalizeColorValue } from "@/lib/utils/color-helpers";

interface VariantOption {
  id?: string;
  name: string;
  value?: string | null;
  color?: string | null;
  priceModifier: number;
  stockCount: number;
  inStock: boolean;
}

interface VariantGroup {
  id: string;
  name: string;
  options: VariantOption[];
}

interface VariantManagerProps {
  productId: string;
  initialVariants?: VariantGroup[];
}

export default function VariantManager({
  productId,
  initialVariants = [],
}: VariantManagerProps) {
  const [variants, setVariants] = useState<VariantGroup[]>(initialVariants);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVariantName, setNewVariantName] = useState("");
  const [newOptions, setNewOptions] = useState<VariantOption[]>([]);
  const [newOptionInput, setNewOptionInput] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState(0);
  const [newOptionStock, setNewOptionStock] = useState(0);
  const [isPending, startTransition] = useTransition();

  async function refreshVariants() {
    startTransition(async () => {
      const updated = await getVariantGroupsByProductId(productId);
      if (Array.isArray(updated)) {
        setVariants(updated);
      } else {
        console.error("Unexpected variants result:", updated);
        setVariants([]);
      }
    });
  }

  useEffect(() => {
    refreshVariants();
  }, [productId]);

  const handleAddVariant = async () => {
    if (!newVariantName.trim() || newOptions.length === 0) {
      toast.error("Please enter variant name and at least one option");
      return;
    }

    const result = await createVariantGroup(productId, {
      name: newVariantName,
      options: newOptions.map((opt) => ({
        name: opt.name,
        value: opt.value ?? null,
        color: opt.color ?? null,
        priceModifier: opt.priceModifier ?? 0,
        stockCount: opt.stockCount ?? 0,
      })),
    });

    if (result.success) {
      toast.success("Variant added successfully");
      resetForm();
      refreshVariants();
    } else {
      toast.error(result.error ?? "Failed to add variant");
    }
  };

  const handleUpdateVariant = async (variantId: string) => {
    if (!newVariantName.trim() || newOptions.length === 0) {
      toast.error("Please enter variant name and at least one option");
      return;
    }

    const result = await updateVariantGroup(variantId, {
      name: newVariantName,
      options: newOptions.map((opt) => ({
        name: opt.name,
        value: opt.value ?? null,
        color: opt.color ?? null,
        priceModifier: opt.priceModifier ?? 0,
        stockCount: opt.stockCount ?? 0,
      })),
    });

    if (result.success) {
      toast.success("Variant updated successfully");
      resetForm();
      refreshVariants();
    } else {
      toast.error(result.error ?? "Failed to update variant");
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (variantId: string) => {
    const result = await deleteVariantGroup(variantId);
    if (result.success) {
      toast.success("Variant deleted successfully");
      refreshVariants();
    } else {
      toast.error(result.error ?? "Failed to delete variant");
    }
  };

  const addOption = () => {
    if (newOptionInput.trim()) {
      setNewOptions((prev) => [
        ...prev,
        {
          name: newOptionInput.trim(),
          value: newOptionValue || null,
          priceModifier: newOptionPrice,
          stockCount: newOptionStock,
          inStock: newOptionStock > 0,
        },
      ]);
      setNewOptionInput("");
      setNewOptionValue("");
      setNewOptionPrice(0);
      setNewOptionStock(0);
    }
  };

  const removeOption = (index: number) => {
    setNewOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewVariantName("");
    setNewOptions([]);
    setNewOptionInput("");
    setNewOptionValue("");
    setNewOptionPrice(0);
    setNewOptionStock(0);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (variant: VariantGroup) => {
    setEditingId(variant.id);
    setNewVariantName(variant.name);
    setNewOptions(variant.options);
    setIsAdding(true);
  };

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Variants</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          variant={isAdding ? "secondary" : "default"}>
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? "Cancel" : "Add Variant"}
        </Button>
      </div>

      <div className="space-y-4 mt-4">
        {isAdding && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <Input
              placeholder="Variant name (e.g., Color, Size)"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">Add Options</div>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Option name (e.g., Black)"
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                />
                <Input
                  placeholder="Value (e.g., #000000)"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                />
                <div
                  className="w-6 h-6 rounded border"
                  style={{
                    backgroundColor:
                      normalizeColorValue(newOptionValue) || "#fff",
                  }}
                />
                <Input
                  type="number"
                  placeholder="Price modifier"
                  value={newOptionPrice}
                  onChange={(e) =>
                    setNewOptionPrice(Number.parseFloat(e.target.value))
                  }
                />
                <Input
                  type="number"
                  placeholder="Stock count"
                  value={newOptionStock}
                  onChange={(e) =>
                    setNewOptionStock(Number.parseInt(e.target.value))
                  }
                />
              </div>
              <Button type="button" size="sm" onClick={addOption}>
                Add Option
              </Button>

              {newOptions.length > 0 && (
                <div className="space-y-2 mt-3">
                  <div className="text-sm font-medium">Options:</div>
                  {newOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="bg-muted p-2 rounded flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{opt.name}</span>
                        {opt.value && (
                          <span className="text-muted-foreground ml-2">
                            ({opt.value})
                          </span>
                        )}
                        <span className="text-muted-foreground ml-2">
                          +${opt.priceModifier} | Stock: {opt.stockCount}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="hover:opacity-70">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() =>
                  editingId
                    ? handleUpdateVariant(editingId)
                    : handleAddVariant()
                }>
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingId ? "Update Variant" : "Save Variant"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants added yet</p>
        ) : (
          <div className="space-y-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {variant.options?.length || 0} options
                  </p>
                  {variant.options?.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {variant.options.map((opt) => opt.name).join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(variant)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteVariant(variant.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
