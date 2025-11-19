import React from "react";
import SiteFooter from "./footer";
import { getAllParentCategories } from "@/lib/data/categories";

export default async function Footer() {
  const categories = await getAllParentCategories();
  return <SiteFooter categories={categories} />;
}
