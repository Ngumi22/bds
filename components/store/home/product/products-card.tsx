import { MinimalProductData } from "@/lib/product/product.types";

interface PromoProductCardProps {
  product: MinimalProductData;
}

export default function PromoProductCard({ product }: PromoProductCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-gray-100 aspect-square overflow-hidden">
        <img
          src={product.mainImage || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h3>
        <p className="text-xs text-gray-600 mb-3">{product.category}</p>

        <p className="font-bold text-gray-900 mb-3">
          From ${product.price.toFixed(2)}
        </p>

        <button className="w-full border border-gray-900 text-gray-900 font-bold py-2 rounded hover:bg-gray-900 hover:text-white transition text-sm">
          QUICK ADD
        </button>
      </div>
    </div>
  );
}
