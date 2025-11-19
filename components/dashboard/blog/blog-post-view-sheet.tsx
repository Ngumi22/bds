"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/form-helpers";
import Image from "next/image";
import type { BlogPost, BlogPostStatus } from "@prisma/client";

interface BlogPostViewSheetProps {
  post: BlogPost | undefined | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BlogPostViewSheet({
  post,
  open,
  onOpenChange,
}: BlogPostViewSheetProps) {
  if (!post) return null;

  const getStatusBadgeVariant = (status: BlogPostStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "DRAFT":
        return "secondary";
      case "ARCHIVED":
        return "outline";

      default:
        return "secondary";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{post.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {post.featuredImage && (
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Title
                </p>
                <p className="text-sm font-semibold">{post.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Slug
                </p>
                <Badge variant="outline" className="text-xs">
                  {post.slug}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </p>
                <Badge variant={getStatusBadgeVariant(post.status)}>
                  {post.status}
                </Badge>
              </div>

              {post.excerpt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Excerpt
                  </p>
                  <p className="text-sm">{post.excerpt}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Content
                </p>
                <div className="text-sm prose prose-sm max-w-none line-clamp-4">
                  {post.content}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </p>
                <p className="text-sm">{formatDate(post.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm">{formatDate(post.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
