"use client";
import React, { Suspense, useEffect, useState } from "react";
import { FileText, Clock, Check, X, Package } from "lucide-react";
import RequestListCards from "@/components/internal-requsitions/card";
import DateRangePicker from "@/components/internal-requsitions/datepicker";
import { internalRequestAPI } from "@/lib/internalRequestApi";
import { CountList, InternalRequisition } from "@/lib/internalRequestTypes";
import RequestTable from "@/components/internal-requsitions/requestTable";
import InputSearch from "@/components/internal-requsitions/inputSearch";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const CARDS = [
  {
    key: "",
    label: "Total",
    countKey: "countTotal",
    variant: "accent" as const,
    icon: <FileText size={16} />,
  },
  {
    key: "pending",
    label: "Pending",
    countKey: "pendingTotal",
    variant: "warning" as const,
    icon: <Clock size={16} />,
  },
  {
    key: "approved",
    label: "Approved",
    countKey: "approvedTotal",
    variant: "success" as const,
    icon: <Check size={16} />,
  },
  {
    key: "rejected",
    label: "Rejected",
    countKey: "rejectedTotal",
    variant: "danger" as const,
    icon: <X size={16} />,
  },
  {
    key: "outstanding",
    label: "Outstanding",
    countKey: "outstandingTotal",
    variant: "default" as const,
    icon: <Package size={16} />,
  },
];

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-3 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[100px] rounded-lg border border-[#e0dfe8] bg-white p-4 space-y-3"
        >
          <div className="h-2 w-16 rounded bg-[#f0eef5] animate-pulse" />
          <div className="h-6 w-10 rounded bg-[#f0eef5] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function RequisitionListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listCount, setListCount] = useState<CountList>();
  const [data, setData] = useState<InternalRequisition[]>();
  const [statusData, setStatusData] = useState<string>(
    searchParams.get("status") || "",
  );
  const [searchInput, setSearchInput] = useState<string>(
    searchParams.get("search") || "",
  );
  const [hasMore, setHasMore] = useState<boolean>();
  const [cursorTimeStamp, setCursorTimeStamp] = useState<string | undefined>();
  const [cursorId, setCursorId] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<
    { cursorId: string; cursorTimeStamp?: string }[]
  >([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const updateURL = (params: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    router.push(`?${query.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const handleListCount = async () => {
      const res = await internalRequestAPI.countList();
      setListCount(res?.data);
      setLoading(false);
    };
    handleListCount();
  }, []);

  useEffect(() => {
    updateURL({ search: searchInput, status: statusData });
    fetchRequests(null);
  }, [statusData, searchInput, startDate, endDate]);

  const fetchRequests = async (
    cursorId?: string | null,
    cursorTimeStamp?: string,
  ) => {
    const response = await internalRequestAPI.allData({
      search: searchInput,
      status: statusData,
      cursorTimestamp: cursorTimeStamp || "",
      cursorId: cursorId || "",
      startDate: startDate || "",
      endDate: endDate || "",
    });
    setData(response?.data);
    setHasMore(response?.hasMore);
    setCursorId(response?.nextCursor?.id ?? "");
    setCursorTimeStamp(response?.nextCursor?.timestamp);
  };

  const handleNext = () => {
    if (!cursorId && !cursorTimeStamp) return;
    setCursorStack((prev) => [
      ...prev,
      { cursorId: cursorId!, cursorTimeStamp },
    ]);
    fetchRequests(cursorId, cursorTimeStamp);
  };

  const handleBack = () => {
    setCursorStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      newStack.pop();
      const previousCursor = newStack[newStack.length - 1];
      fetchRequests(previousCursor?.cursorId, previousCursor?.cursorTimeStamp);
      return newStack;
    });
  };

  return (
    <div>
      <div className="flex justify-center items-center">
        <DateRangePicker
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      {loading ? (
        <CardsSkeleton />
      ) : (
        <div className="grid grid-cols-5 gap-3 p-3">
          {CARDS.map(({ key, label, countKey, variant, icon }) => (
            <RequestListCards
              key={key}
              label={label}
              amount={listCount?.[countKey as keyof CountList] as number}
              variant={variant}
              icon={icon}
              active={statusData === key}
              onClick={() => setStatusData(key)}
            />
          ))}
        </div>
      )}

      <main className="px-3 pb-3">
        <div className="flex justify-end items-center gap-2 mb-3">
          <InputSearch onSearch={(value) => setSearchInput(value)} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setStatusData("");
            }}
            className="text-[#80708f] dark:text-white border-[#e0dfe8] hover:bg-[#f0eef5] hover:text-[#1d1d24]"
          >
            Clear
          </Button>
        </div>
        <RequestTable
          data={data}
          hasMore={hasMore}
          onNext={handleNext}
          onBack={handleBack}
        />
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CardsSkeleton />}>
      <RequisitionListContent />
    </Suspense>
  );
}
