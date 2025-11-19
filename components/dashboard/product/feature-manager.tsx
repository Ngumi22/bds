"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  addFeature,
  deleteFeature,
  getProductFeatures,
  updateFeature,
} from "@/lib/actions/features-actions";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface FeatureManagerProps {
  productId: string;
  initialFeatures?: Feature[];
}

export default function FeatureManager({
  productId,
  initialFeatures = [],
}: FeatureManagerProps) {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [isAdding, setIsAdding] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isPending, startTransition] = useTransition();

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const refreshFeatures = async () => {
    startTransition(async () => {
      const updated = await getProductFeatures(productId);
      if (Array.isArray(updated)) setFeatures(updated);
    });
  };

  useEffect(() => {
    refreshFeatures();
  }, [productId]);

  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewIcon("");
    setIsAdding(false);
    setEditingFeature(null);
  };

  const handleAddFeature = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Please enter a title and description");
      return;
    }
    const result = await addFeature(
      productId,
      newTitle,
      newDescription,
      newIcon
    );
    if (result.success) {
      toast.success("Feature added successfully");
      resetForm();
      refreshFeatures();
    } else {
      toast.error(result.error ?? "Failed to add feature");
    }
  };

  const handleUpdateFeature = async () => {
    if (!editingFeature) return;
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Please enter a title and description");
      return;
    }

    const result = await updateFeature(
      editingFeature.id,
      newTitle,
      newDescription,
      newIcon
    );
    if (result.success) {
      toast.success("Feature updated successfully");
      resetForm();
      refreshFeatures();
    } else {
      toast.error(result.error ?? "Failed to update feature");
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    const result = await deleteFeature(featureId);
    if (result.success) {
      toast.success("Feature deleted successfully");
      refreshFeatures();
    } else {
      toast.error(result.error ?? "Failed to delete feature");
    }
  };

  const startEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setNewTitle(feature.title);
    setNewDescription(feature.description);
    setNewIcon(feature.icon || "");
    setIsAdding(false);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex flex-row items-center justify-between">
        <h2>Features</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            resetForm();
            setIsAdding((prev) => !prev);
          }}
          variant={isAdding ? "secondary" : "default"}>
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? "Cancel" : "Add Feature"}
        </Button>
      </div>

      <div className="space-y-4">
        {(isAdding || editingFeature) && (
          <div className="border rounded-sm p-4 space-y-3 bg-muted/50">
            <Input
              placeholder="Feature title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Feature description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
            <Input
              placeholder="Icon (optional)"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={
                  editingFeature ? handleUpdateFeature : handleAddFeature
                }>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingFeature ? "Update Feature" : "Save Feature"}
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

        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground">No features added yet</p>
        ) : (
          <div className="space-y-2">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start justify-between p-3 border rounded-sm bg-muted/30">
                <div className="flex-1">
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(feature)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteFeature(feature.id)}>
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
