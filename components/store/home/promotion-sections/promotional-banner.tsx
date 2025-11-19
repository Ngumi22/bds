import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PromotionalBannerProps {
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageSrc: string;
  imageAlt: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "small" | "medium" | "large" | "full" | "special";
  className?: string;
}

export function PromotionalBanner({
  title,
  description,
  ctaText = "Shop Now",
  ctaLink = "/products",
  imageSrc,
  imageAlt,
  variant = "primary",
  size = "medium",
  className,
}: PromotionalBannerProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  const sizeStyles = {
    small: "h-32 md:h-40",
    medium: "h-48 md:h-64",
    large: "h-72 md:h-80",
    full: "h-[calc(100vh-4rem)]",
    special: "h-46",
  };

  const textSizeStyles = {
    small: {
      title: "text-xl md:text-2xl",
      description: "text-xs md:text-sm",
      cta: "text-xs px-3 py-1",
    },
    medium: {
      title: "text-2xl md:text-3xl lg:text-4xl",
      description: "text-sm md:text-base",
      cta: "text-sm px-4 py-2",
    },
    large: {
      title: "text-3xl md:text-4xl lg:text-5xl",
      description: "text-base md:text-lg",
      cta: "text-base px-5 py-2.5",
    },
    full: {
      title: "text-4xl md:text-6xl lg:text-7xl",
      description: "text-lg md:text-xl",
      cta: "text-lg px-6 py-3",
    },
    special: {
      title: "text-2xl",
      description: "text-sm",
      cta: "text-xs p-2",
    },
  };

  const currentTextStyles = textSizeStyles[size];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xs h-auto",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}>
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={size === "full"}
        />
        <div
          className={cn(
            "absolute inset-0",
            variant === "primary" && "bg-black/40",
            variant === "secondary" && "bg-black/20",
            variant === "accent" &&
              "bg-linear-to-r from-primary/60 to-transparent"
          )}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center p-6 md:p-8">
        <div className="max-w-md">
          <h2 className={cn("mb-2 font-bold", currentTextStyles.title)}>
            {title}
          </h2>

          {description && (
            <p
              className={cn("mb-4 max-w-prose", currentTextStyles.description)}>
              {description}
            </p>
          )}

          {ctaText && ctaLink && (
            <Link
              href={ctaLink}
              className={cn(
                "inline-flex items-center justify-center rounded-xs font-normal transition-colors",
                "bg-black text-white hover:bg-white hover:text-black border border-black",
                currentTextStyles.cta
              )}>
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
