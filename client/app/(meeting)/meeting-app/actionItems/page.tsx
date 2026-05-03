import React from "react";
import ActionItemPage from "@/components/meeting-app/actionItems/actionItemPage";
import { meetingServerAPI } from "@/lib/meeting/mettingAppApi.server";
import { ActionItem } from "@/lib/meeting/meetingAppTypes";
async function page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const data = await meetingServerAPI.getActionItems(status);
  const actionItems = data  as ActionItem[];
  return (
    <div>
      <ActionItemPage data={actionItems} status={status} />
    </div>
  );
}

export default page;
