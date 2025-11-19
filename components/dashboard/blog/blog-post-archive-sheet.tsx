"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogPost, BlogPostStatus } from "@prisma/client";

interface BlogPostArchiveSheetProps {
  post: BlogPost | undefined | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: BlogPostStatus) => Promise<void>;
}

export default function BlogPostArchiveSheet({
  post,
  open,
  onOpenChange,
  onStatusChange,
}: BlogPostArchiveSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState(post?.status ?? "DRAFT");
  const [isPending, setIsPending] = useState(false);

  if (!post) return null;

  const handleStatusChange = async () => {
    setIsPending(true);
    try {
      await onStatusChange(selectedStatus);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>Change Post Status</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <div>
            <div>
              <h2 className="text-base">Update Status</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Current Status
                </p>
                <p className="text-sm font-semibold">{post.status}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  New Status
                </p>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(
                      value as "DRAFT" | "PUBLISHED" | "ARCHIVED"
                    )
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleStatusChange}
                  disabled={isPending}
                  className="w-full">
                  {isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
