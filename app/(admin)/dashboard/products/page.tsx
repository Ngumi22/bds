import { ProductColumns } from "@/components/dashboard/product/table/columns";
import { DataTable } from "@/components/dashboard/tables/data-table";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/actions/product-action";
import Link from "next/link";

export default async function ProductsPage() {
  const data = await getAllProducts();

  return (
    <div className="container mx-auto py-3">
      <Link className="flex" href={"/dashboard/products/new"}>
        <Button variant="outline">Add New Product</Button>
      </Link>
      <DataTable columns={ProductColumns} data={data} />
    </div>
  );
}
