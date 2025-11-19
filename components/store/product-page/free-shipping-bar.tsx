"use client";

import { formatCurrency } from "@/lib/utils/form-helpers";

interface FreeShippingBarProps {
  currentTotal: number;
  threshold: number;
}

export function FreeShippingBar({
  currentTotal,
  threshold,
}: FreeShippingBarProps) {
  const remaining = Math.max(0, threshold - currentTotal);
  const percentage = Math.min(100, (currentTotal / threshold) * 100);
  const isUnlocked = remaining === 0;

  return (
    <div className="border-b border-border bg-foreground px-4 py-2 text-background">
      <div className="mx-auto max-w-7xl">
        {isUnlocked ? (
          <p className="text-center text-xs font-medium">
            🎉 You've unlocked FREE shipping!
          </p>
        ) : (
          <div>
            <p className="mb-1 text-center text-xs font-medium">
              Add {formatCurrency(remaining)} more to unlock FREE shipping!
            </p>
            <div className="h-1.5 w-full bg-background/30">
              <div
                className="h-full bg-background transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
