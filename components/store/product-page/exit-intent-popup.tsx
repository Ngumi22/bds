"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
      <div className="relative w-full max-w-md border border-border bg-card p-6 shadow-xl">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4" />
        </Button>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Wait! Don't Miss Out
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Get 10% off your first order when you sign up for our newsletter.
        </p>
        <div className="mb-4 flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <Button>Subscribe</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Plus free shipping on orders over Ksh 70000!
        </p>
      </div>
    </div>
  );
}
