"use client";

interface VariantOption {
  id: string;
  name: string;
  color?: string;
  inStock: boolean;
}

interface VariantType {
  name: string;
  options: VariantOption[];
}

interface VariantSwatchesProps {
  variantTypes?: VariantType[];
}

export function VariantSwatches({ variantTypes }: VariantSwatchesProps) {
  if (!variantTypes?.length) return null;

  const colorVariants = variantTypes.find(
    (v) => v.name.toLowerCase() === "color"
  );

  if (!colorVariants || colorVariants.options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {colorVariants.options.map((option) => (
        <div
          key={option.id}
          className={`h-5 w-5 rounded-full border ${
            option.inStock ? "opacity-100" : "opacity-40"
          }`}
          style={{
            backgroundColor: option.color || "#ccc",
          }}
          title={`${option.name}${!option.inStock ? " (Out of Stock)" : ""}`}
        />
      ))}
    </div>
  );
}
