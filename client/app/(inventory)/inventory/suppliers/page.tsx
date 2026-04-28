export const dynamic = "force-dynamic";
import React from "react";
import SupplierList from "../../../../components/internal-requsitions/suppliers/supplierList";

import { inventoryServerAPI } from "@/lib/inventory/inventoryApi.server";
import { inventoryAPI } from "@/lib/inventoryApi";
async function page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const suppliers = await inventoryServerAPI.getSuppliers(params?.search);
  return <SupplierList suppliers={suppliers} />;
}

export default page;
