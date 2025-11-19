"use client";

import { X } from "lucide-react";

interface FilterBadgeProps {
  label?: string;
  value: string;
  onRemove: () => void;
}

export function FilterBadge({ label, value, onRemove }: FilterBadgeProps) {
  return (
    <button
      onClick={onRemove}
      aria-label={`Remove filter ${label ? `${label}: ${value}` : value}`}
      className="inline-flex items-center gap-1.5 py-1.5 text-xs rounded-sm">
      <X className="h-3 w-3" aria-hidden="true" />
      <span className="font-normal">
        {label && `${label}: `}
        <strong>{value}</strong>
      </span>
    </button>
  );
}
