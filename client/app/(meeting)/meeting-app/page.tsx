import React from "react";
import MeetingDashboardPage from "@/components/meeting-app/dashboard/dashboardPage";
import { mettingAppAPI } from "@/lib/meeting/mettingAppApi";
async function MeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate: string; endDate: string }>;
}) {
  const { startDate, endDate } = await searchParams;
  const dateQuery = {
    startDate,
    endDate,
  };

  const dashboard = await mettingAppAPI.getDashboardData({ dateQuery });
  return (
    <div>
      <MeetingDashboardPage data={dashboard} />
    </div>
  );
}

export default MeetingPage;
