import React from "react";
import ProductsBySuppliers from "@/components/internal-requsitions/suppliers/productsBySuppliers";
import { supplierAPI } from "@/lib/supplierAPI";
async function page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const id = slug.split("-").pop();
  const products = await supplierAPI.productsBySupplier(id as string);
  console.log("🚀 ~ page ~ products:", products);
  return (
    <div>
      <ProductsBySuppliers products={products} />
    </div>
  );
}

export default page;
