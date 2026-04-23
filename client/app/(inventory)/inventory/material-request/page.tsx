import React from "react";
import { materialRequestServerAPI } from "@/lib/material-request/material-requestApi.server";
import { materialRequestAPI } from "@/lib/material-request/material-requestApi";
import RequestList from "@/components/inventory/material-request/requestList";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; cursor?: string }>;
}) {
  const { status, search, cursor } = await searchParams;

  const data = await materialRequestServerAPI.getMaterialRequests({
    status,
    search,
    cursor,
  });

  return (
    <div>
      <RequestList requestsData={data} />
    </div>
  );
}

export default Page;
