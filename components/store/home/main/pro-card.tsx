import { MinimalProductData } from "@/lib/product/product.types";
import { Heart, Eye } from "lucide-react";

interface ProductCardProps {
  product: MinimalProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const colorMap = {
    black: "#000000",
    white: "#FFFFFF",
    gray: "#999999",
    orange: "#FF9500",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden group">
        <img
          src={product.mainImage || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="bg-white/90 hover:bg-white p-2 rounded-full transition">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
          <button className="bg-white/90 hover:bg-white p-2 rounded-full transition">
            <Eye className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4">short description</p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="font-bold text-gray-900">
            From ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Colors */}
        <div className="flex gap-2 mb-4">
          {product.colorVariants?.map((color) => (
            <button
              key={
                typeof color === "string"
                  ? color
                  : color?.name || color?.value || Math.random()
              }
              className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-600 transition"
              style={{
                backgroundColor:
                  colorMap[
                    typeof color === "string"
                      ? color
                      : (color?.name as keyof typeof colorMap)
                  ] || "#ccc",
              }}
              title={typeof color === "string" ? color : color?.name || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
