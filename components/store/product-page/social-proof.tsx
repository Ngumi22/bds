"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface SocialProofProps {
  viewingNow: number;
  recentPurchases: string[];
}

export function SocialProof({ viewingNow, recentPurchases }: SocialProofProps) {
  const [currentPurchase, setCurrentPurchase] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 4000);
      setCurrentPurchase((prev) => (prev + 1) % recentPurchases.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [recentPurchases.length]);

  return (
    <>
      <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        <span>
          <span className="font-medium text-foreground">{viewingNow}</span>{" "}
          people viewing this now
        </span>
      </div>

      {isVisible && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left border border-border bg-card p-3 shadow-lg">
          <p className="text-xs text-foreground">
            <span className="font-medium">
              {recentPurchases[currentPurchase]}
            </span>{" "}
            purchased this 2 hours ago
          </p>
        </div>
      )}
    </>
  );
}
