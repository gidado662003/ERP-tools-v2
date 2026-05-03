import React from "react";
import MeetingDashboardPage from "@/components/meeting-app/dashboard/dashboardPage";
import { meetingServerAPI } from "@/lib/meeting/mettingAppApi.server";
import { DashboardData } from "@/lib/meeting/meetingAppTypes";
async function MeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate: string; endDate: string }>;
}) {
  const { startDate, endDate } = await searchParams;
  const dashboard = await meetingServerAPI.getDashboardData(startDate, endDate);
  return (
    <div>
      <MeetingDashboardPage data={dashboard as DashboardData} />
    </div>
  );
}

export default MeetingPage;
