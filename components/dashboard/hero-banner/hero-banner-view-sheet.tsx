"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Calendar,
  Hash,
  Tag,
  FileText,
  MousePointerClick,
} from "lucide-react";
import type { HeroBannerWithRelations } from "@/lib/types/hero-banner";
import Image from "next/image";

interface HeroBannerViewSheetProps {
  banner: HeroBannerWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HeroBannerViewSheet({
  banner,
  open,
  onOpenChange,
}: HeroBannerViewSheetProps) {
  if (!banner) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>Banner Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 p-2">
          <div className="overflow-hidden">
            <div className="relative w-full aspect-16/5 bg-muted">
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <div className="pt-2 pb-0">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{banner.title}</h3>
                    <Badge variant={banner.isActive ? "default" : "secondary"}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    <Tag className="h-3 w-3 mr-1" />
                    {banner.tag}
                  </Badge>
                </div>

                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </p>
                  <p className="text-sm leading-relaxed">
                    {banner.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    Button Text
                  </p>
                  <p className="font-medium">{banner.buttonText}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Display Order
                    </p>
                    <p className="font-medium">{banner.order}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created
                    </p>
                    <p className="font-medium">
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {banner.linkUrl && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Link URL
                    </p>
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all">
                      {banner.linkUrl}
                    </a>
                  </div>
                )}

                {banner.collection && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Linked Collection
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{banner.collection.name}</Badge>
                      <span className="text-xs text-muted-foreground">
                        /{banner.collection.slug}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
