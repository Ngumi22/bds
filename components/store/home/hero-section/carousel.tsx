"use client";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  image: string;
  tag: string;
  title: string;
  description: string;
  buttonText: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Carousel
      plugins={[plugin.current]}
      opts={{
        align: "center",
        loop: true,
      }}
      setApi={setApi}
      className="w-full max-w-full">
      <CarouselContent className="">
        {slides.map((slide, index) => {
          const isActive = index === current;

          return (
            <CarouselItem
              key={index}
              className="h-56 lg:h-96 md:px-2 shrink-0 basis-full mx-auto border border-border">
              <div className="w-full h-full relative rounded-xs overflow-hidden">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  className="object-contain object-right absolute inset-0 w-full h-full md:hidden"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                <div
                  className={cn(
                    "absolute inset-0 w-full h-full md:w-1/2 bg-transparent md:bg-white p-4 md:p-12 flex flex-col justify-center items-start md:relative space-y-4",
                    "transition-all duration-1000 ease-out",
                    isActive
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  )}>
                  <span className="inline-block border border-gray-400 text-gray-600 text-xs sm:text-sm font-medium rounded-xs px-3 py-1 mb-3 md:mb-4 backdrop-blur-sm md:backdrop-blur-none">
                    {slide.tag}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 md:mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-gray-600 md:text-gray-500 text-sm sm:text-base mb-4 md:mb-6 line-clamp-3">
                    {slide.description}
                  </p>
                  <Link
                    className="flex items-center justify-between gap-4 text-sm object-bottom"
                    href={"/products"}>
                    <Button className="bg-black text-white font-semibold py-2 px-4 rounded-xs hover:bg-white hover:text-black border border-black transition-colors duration-300">
                      {slide.buttonText}
                      <span>
                        <ArrowRight />
                      </span>
                    </Button>
                  </Link>
                </div>

                <div
                  className={cn(
                    "hidden md:block absolute right-0 top-0 w-1/2 h-full",
                    "transition-opacity duration-1000 ease-out",
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  )}>
                  <Image
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title}
                    fill
                    className="object-contain"
                    sizes="50vw"
                  />
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />

      <div className="absolute left-1/2 bottom-6 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!api) return;
              api.scrollTo(index);
              plugin.current.stop();
            }}
            className={cn(
              "transition-all duration-300 rounded-full",
              index === current
                ? "w-8 h-2 bg-black"
                : "w-2 h-2 bg-gray-500 hover:bg-gray-600"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Carousel>
  );
}
