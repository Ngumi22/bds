"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterCheckboxProps {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function FilterCheckbox({
  id,
  label,
  count,
  checked,
  onCheckedChange,
  disabled,
}: FilterCheckboxProps) {
  const isDisabled = disabled || count === 0;

  return (
    <div
      className={`flex items-center space-x-1.5 group ${
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={isDisabled}
      />
      <Label
        htmlFor={id}
        className="flex-1 text-[13px] font-normal flex justify-between items-center">
        <span>{label}</span>
        {count !== undefined && (
          <span className="text-[13px] text-muted-foreground ml-2 bg-muted/60 px-2 py-0.5 rounded">
            {count}
          </span>
        )}
      </Label>
    </div>
  );
}
