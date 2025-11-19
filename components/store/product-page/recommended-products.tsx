import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
}

interface RecommendedProductsProps {
  products: Product[];
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  return (
    <div className="mt-8 border-t border-border pt-8 sm:mt-12 sm:pt-12">
      <h2 className="mb-4 text-base font-semibold text-foreground sm:mb-6 sm:text-lg">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group border border-border bg-card p-2.5 transition-colors hover:bg-muted/30 sm:p-3">
            <div className="relative mb-2 aspect-square w-full overflow-hidden bg-muted sm:mb-3">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </div>
            <h3 className="mb-1 text-xs font-medium text-foreground line-clamp-2 text-pretty">
              {product.name}
            </h3>
            <div className="mb-2 flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-foreground text-foreground sm:h-3 sm:w-3" />
              <span className="text-xs text-muted-foreground">
                {product.rating}
              </span>
            </div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              ${product.price}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs bg-transparent">
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
