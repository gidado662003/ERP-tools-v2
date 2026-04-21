import React from "react";
import SupplierList from "../../../../components/internal-requsitions/suppliers/supplierList";
import { inventoryAPI } from "@/lib/inventoryApi";
async function page() {
  const suppliers = await inventoryAPI.getSuppliers();
  return <SupplierList suppliers={suppliers} />;
}

export default page;
