import React from "react";
import ActionItemPage from "@/components/meeting-app/actionItems/actionItemPage";
import { mettingAppAPI } from "@/lib/meeting/mettingAppApi";
async function page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const params: any = {};

  if (status) {
    params.status = status;
  }
  const data = await mettingAppAPI.getActionItems(params);

  return (
    <div>
      <ActionItemPage data={data.actionItems} status={status} />
    </div>
  );
}

export default page;
