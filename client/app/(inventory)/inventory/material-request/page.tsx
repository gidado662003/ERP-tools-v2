import React from "react";
import { materialRequestAPI } from "@/lib/material-request/material-requestApi";
import RequestList from "@/components/inventory/material-request/requestList";
async function page() {
  const data = await materialRequestAPI.getMaterialRequests();
  return (
    <div>
      <RequestList data={data} />
    </div>
  );
}

export default page;
