import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface RecentlyViewedProps {
  products: Product[];
}

export function RecentlyViewed({ products }: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12 border-t border-border pt-12">
      <h2 className="mb-6 text-lg font-semibold text-foreground">
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group border border-border bg-card p-3 transition-colors hover:bg-muted/30">
            <div className="relative mb-3 aspect-square overflow-hidden bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="mb-1 text-xs font-medium text-foreground line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm font-semibold text-foreground">
              ${product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
