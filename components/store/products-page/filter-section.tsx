"use client";

import { Button } from "@/components/ui/button";
import type React from "react";

import { useState } from "react";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group">
        <h3 className="text-[16px] font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
      </Button>

      {isOpen && (
        <div className="space-y-1 pl-0 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
