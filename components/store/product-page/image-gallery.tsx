"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
}

export function ImageGallery({
  images,
  productName,
  videoUrl,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const hasThumbnails = images.length > 1 || videoUrl;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomed(false);
    };

    if (isZoomed) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isZoomed]);

  return (
    <>
      <div className="flex w-full h-fit flex-col gap-2 sm:gap-3 md:flex-row">
        {hasThumbnails && (
          <div className="order-2 flex w-full gap-2 sm:gap-3 md:order-1 md:w-16 md:flex-col lg:w-20">
            <div className="flex w-full gap-2 overflow-x-auto pb-2 sm:gap-3 md:flex-col md:overflow-x-visible md:overflow-y-auto md:pb-0">
              {videoUrl && (
                <Button
                  onClick={() => {
                    setIsPlayingVideo(true);
                    setSelectedImage(-1);
                  }}
                  className={`relative aspect-square w-14 h-14 shrink-0 overflow-hidden border-2 transition-colors sm:w-16 md:w-full md:h-20 p-2 ${
                    selectedImage === -1
                      ? "border-foreground"
                      : "border-border hover:border-muted-foreground"
                  }`}>
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Play className="h-4 w-4 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                </Button>
              )}
              {images.map((image, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setIsPlayingVideo(false);
                  }}
                  className={`relative aspect-square w-14 h-14 shrink-0 overflow-hidden border-2 transition-colors sm:w-16 md:w-full md:h-20 p-2 ${
                    selectedImage === index && !isPlayingVideo
                      ? "border-foreground"
                      : "border-border hover:border-muted-foreground"
                  }`}>
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100px, 120px"
                  />
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="relative order-1 w-full flex-1 md:order-2 h-8">
          <div className="relative aspect-square w-full overflow-hidden border border-border bg-card md:aspect-auto md:h-[500px] lg:h-[600px]">
            {isPlayingVideo && videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
                onEnded={() => setIsPlayingVideo(false)}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                <Image
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-2 sm:right-3 sm:top-3"
                  onClick={() => setIsZoomed(true)}>
                  <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-3 sm:p-4"
          onClick={() => setIsZoomed(false)}>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10"
            onClick={() => setIsZoomed(false)}>
            <X className="h-4 w-4" />
          </Button>
          <div
            className="relative h-full w-full max-w-6xl overflow-auto"
            onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={productName}
              width={700}
              height={700}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
