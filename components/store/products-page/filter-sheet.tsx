"use client";

import type React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function FilterSheet({
  open,
  onOpenChange,
  children,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] p-0 flex flex-col bg-background">
        <SheetHeader className="sticky top-0 bg-background border-b border-border/40 px-6 py-4 space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
          </div>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-80px)] px-6 py-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
