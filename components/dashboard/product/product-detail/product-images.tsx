"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@prisma/client";

export function ProductImages({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const allImages = [product.mainImage, ...product.galleryImages];

  return (
    <div className="sticky top-2">
      <div className="p-2">
        <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={allImages[selectedImage] || "/placeholder.svg"}
            alt={`Product image ${selectedImage + 1}`}
            fill
            className="object-cover"
          />
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setSelectedImage(
                    (prev) => (prev - 1 + allImages.length) % allImages.length
                  )
                }>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setSelectedImage((prev) => (prev + 1) % allImages.length)
                }>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-border"
                }`}>
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
