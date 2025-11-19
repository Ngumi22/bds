"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";

interface SpecificationFormData {
  id: string;
  key: string;
  name: string;
  categoryId: string;
}

interface SpecificationsManagerProps {
  specifications: SpecificationFormData[];
  onChange: (specifications: SpecificationFormData[]) => void;
  disabled?: boolean;
}

export function SpecificationsManager({
  specifications,
  onChange,
  disabled,
}: SpecificationsManagerProps) {
  const [editingSpec, setEditingSpec] = useState<SpecificationFormData | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setEditingSpec({
      id: crypto.randomUUID(),
      name: "",
      key: "",
      categoryId: "",
    });
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!editingSpec || !editingSpec.name.trim() || !editingSpec.key.trim())
      return;

    if (isAdding) {
      onChange([...specifications, editingSpec]);
    } else {
      onChange(
        specifications.map((spec) =>
          spec.id === editingSpec.id ? editingSpec : spec
        )
      );
    }

    setEditingSpec(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingSpec(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onChange(specifications.filter((spec) => spec.id !== id));
  };

  const handleEdit = (spec: SpecificationFormData) => {
    setEditingSpec({ ...spec });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {specifications.length === 0 && !editingSpec && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No specifications defined yet. Add new specifications below.
        </p>
      )}

      <div className="space-y-2">
        {specifications.map((spec) => (
          <div
            key={spec.id}
            className="flex items-center gap-2 border p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">{spec.name}</span>
              <p className="text-xs text-muted-foreground truncate">
                Key: {spec.key}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(spec)}
              disabled={disabled || !!editingSpec}
              className="text-xs">
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(spec.id)}
              disabled={disabled || !!editingSpec}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {editingSpec && (
        <div className="border p-4 space-y-4 bg-background">
          <div className="space-y-2">
            <Label className="text-xs">Specification Name *</Label>
            <Input
              placeholder="e.g., RAM, Storage, Color"
              value={editingSpec.name}
              onChange={(e) =>
                setEditingSpec({ ...editingSpec, name: e.target.value })
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Key *</Label>
            <Input
              placeholder="e.g., ram_size, storage_capacity"
              value={editingSpec.key}
              onChange={(e) =>
                setEditingSpec({ ...editingSpec, key: e.target.value })
              }
              className="text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              size="sm"
              className="text-xs flex-1">
              {isAdding ? "Add Specification" : "Save Changes"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!editingSpec && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          className="text-xs w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add Specification
        </Button>
      )}
    </div>
  );
}
