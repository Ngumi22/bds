"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp } from "lucide-react"

export function ProductReviews({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.reviews.map((review: any) => (
          <div key={review.id} className="border-b border-border pb-4 last:border-0">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{review.author}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{"⭐".repeat(review.rating)}</span>
                  {review.verified && (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Verified</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            <div className="mt-2 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{review.helpful} found helpful</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
