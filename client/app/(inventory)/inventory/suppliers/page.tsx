export const dynamic = "force-dynamic";
import React from "react";
import SupplierList from "../../../../components/internal-requsitions/suppliers/supplierList";

import { inventoryServerAPI } from "@/lib/inventory/inventoryApi.server";
import { inventoryAPI } from "@/lib/inventoryApi";
async function page() {
  const suppliers = await inventoryServerAPI.getSuppliers();
  return <SupplierList suppliers={suppliers} />;
}

export default page;
