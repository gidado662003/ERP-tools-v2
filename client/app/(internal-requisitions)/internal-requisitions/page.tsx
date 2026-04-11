"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { internalRequestAPI } from "@/lib/internalRequestApi";
import Dashboard from "@/components/internal-requsitions/dashboard";
import DashboardSkeleton from "@/components/internal-requsitions/dashboard-skeleton";
import { DashboardData } from "@/lib/internalRequestTypes";
import { getDateRange } from "@/helper/datePicker";

function DashboardPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [data, setData] = useState<DashboardData>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const selectedDateRange = searchParams.get("date");
      if (!selectedDateRange) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("date", "All");

        window.history.replaceState(
          null,
          "",
          `${pathname}?${params.toString()}`,
        );
      }
      const resolvedRange = getDateRange({
        label: selectedDateRange || "All",
      });
      const res = await internalRequestAPI.getDashboardData({
        dateRange: resolvedRange,
      });
      setData(res);
      setLoading(false);
    };
    fetchDashboardData();
  }, [searchParams]);

  const handleDateRangeChange = (label: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", label);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  if (loading || !data) return <DashboardSkeleton />;

  return (
    <Dashboard
      data={data}
      handleDateRangeChange={handleDateRangeChange}
      activeFilter={searchParams.get("date")}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
