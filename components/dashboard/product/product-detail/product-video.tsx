"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProductVideo({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Video</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <iframe
            width="100%"
            height="100%"
            src={product.videoUrl}
            title="Product Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
