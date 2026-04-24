import React from "react";
import AssetPage from "@/components/inventory/asset/assetPage";
import { inventoryServerAPI } from "@/lib/inventory/inventoryApi.server";
async function page({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; search?: string }>;
}) {
  const { location, search } = await searchParams;
  const payload = {
    location: location ?? undefined,
    search: search ?? undefined,
  };
  const data = await inventoryServerAPI.getAssetsSummary(payload);
  return (
    <div>
      <AssetPage groups={data} />
    </div>
  );
}

export default page;
