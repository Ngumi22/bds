"use client";

import dynamic from "next/dynamic";

const ProductCarousel = dynamic(() => import("."), {
  ssr: false,
});

export default ProductCarousel;
