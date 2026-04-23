export const dynamic = "force-dynamic";
import React from "react";
import { materialRequestAPI } from "@/lib/material-request/material-requestApi";
import { materialRequestServerAPI } from "@/lib/material-request/material-requestApi.server";
import RequestById from "@/components/inventory/material-request/requestById";
async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await materialRequestServerAPI.getMaterialRequestById(id);
  return <RequestById data={data} />;
}

export default page;
