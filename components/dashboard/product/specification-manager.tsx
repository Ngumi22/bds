"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getSpecificationsForCategories } from "@/lib/actions/specifications";
import {
  getProductSpecifications,
  addSpecification,
  deleteSpecification,
  updateSpecification,
} from "@/lib/actions/spec-actions";

type Definition = {
  id: string;
  name: string;
  key: string;
  categoryId?: string;
};

type ProductSpec = {
  id: string;
  specificationDefId: string;
  specificationDef?: Definition;
  value: string;
};

interface SpecificationManagerProps {
  categoryId: string;
  productId: string;
  initialSpecs?: ProductSpec[];
}

export default function SpecificationManager({
  categoryId,
  productId,
  initialSpecs = [],
}: SpecificationManagerProps) {
  const [specs, setSpecs] = useState<ProductSpec[]>(initialSpecs ?? []);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDefId, setSelectedDefId] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!categoryId) return;
    (async () => {
      try {
        const res = await getSpecificationsForCategories(categoryId);
        if (res.success) {
          setDefinitions(res.specifications ?? []);
        } else {
          toast.error(
            res.message ?? "Failed to load specification definitions"
          );
        }
      } catch (err) {
        console.error("Failed to load definitions:", err);
        toast.error("Failed to load specification definitions");
      }
    })();
  }, [categoryId]);

  const refreshSpecs = async () => {
    startTransition(async () => {
      const updated = await getProductSpecifications(productId);
      if (Array.isArray(updated)) setSpecs(updated);
    });
  };

  const handleAddSpec = async () => {
    if (!selectedDefId || !newValue.trim()) {
      toast.error("Please select a specification and enter a value");
      return;
    }

    const result = await addSpecification(productId, selectedDefId, newValue);
    if (result.success) {
      toast.success("Specification added");
      resetForm();
      refreshSpecs();
    } else {
      toast.error(result.message ?? "Failed to add specification");
    }
  };

  const handleUpdateSpec = async (specId: string, value: string) => {
    startTransition(async () => {
      const result = await updateSpecification(specId, value);
      if (result.success) {
        toast.success("Specification updated");
        refreshSpecs();
      } else {
        toast.error(result.message ?? "Failed to update specification");
      }
    });
  };

  const handleDeleteSpec = async (specId: string) => {
    startTransition(async () => {
      const result = await deleteSpecification(specId);
      if (result.success) {
        toast.success("Specification deleted");
        refreshSpecs();
      } else {
        toast.error(result.message ?? "Failed to delete specification");
      }
    });
  };

  const resetForm = () => {
    setSelectedDefId("");
    setNewValue("");
    setIsAdding(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2>Specifications</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          variant={isAdding ? "secondary" : "default"}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-lg bg-muted/40 space-y-3">
            <Select value={selectedDefId} onValueChange={setSelectedDefId}>
              <SelectTrigger>
                <SelectValue placeholder="Select specification" />
              </SelectTrigger>
              <SelectContent>
                {definitions.map((def) => (
                  <SelectItem key={def.id} value={def.id}>
                    {def.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Enter value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />

            <div className="flex gap-2">
              <Button size="sm" disabled={isPending} onClick={handleAddSpec}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {specs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No specifications yet</p>
        ) : (
          <div className="space-y-2">
            {specs.map((spec) => (
              <div
                key={spec.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {spec.specificationDef?.name ??
                      definitions.find((d) => d.id === spec.specificationDefId)
                        ?.name ??
                      spec.specificationDefId}
                  </p>
                  <Input
                    value={spec.value}
                    onChange={(e) => handleUpdateSpec(spec.id, e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSpec(spec.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
