"use client";

export function ProductFeatures({ product }: { product: any }) {
  return (
    <div className="p-2">
      <div>
        <h2>Key Features</h2>
      </div>
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          {product.features.map((feature: any) => (
            <div
              key={feature.id}
              className="rounded-sm border border-border p-2">
              <div className="mb-1 text-lg">{feature.icon}</div>
              <h4 className="font-semibold text-foreground">{feature.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
