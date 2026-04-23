"use client";
import React, { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { MapPin, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MaterialRequestResponse,
  MaterialRequest,
} from "@/lib/material-request/material-requestType";
import { Badge } from "@/components/ui/badge";
function RequestList({
  requestsData,
}: {
  requestsData: MaterialRequestResponse;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cursorId, setCursorId] = useState<string[]>([]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns = [
    { key: "requestNumber", label: "Request Number" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
  ];

  const handleStatusColor = (status: MaterialRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "REJECTED":
        return "bg-red-50 text-red-500 border border-red-200";
      case "DISPATCHED":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-200";
    }
  };

  const formattedData = requestsData.data.map((req: any) => ({
    ...req,
    reason: (
      <span className="text-[#80708f] max-w-[200px] truncate block">
        {req.reason}
      </span>
    ),
    createdAt: new Date(req.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: (
      <Badge
        className={`${handleStatusColor(req.status)} text-[10px] font-medium px-2 py-0.5 rounded-md`}
      >
        {req.status}
      </Badge>
    ),
  }));

  const handleNextPage = () => {
    setCursorId((prev) => [...prev, requestsData.lastItemId]);
    if (requestsData.hasNextPage) {
      setFilter("cursor", requestsData.lastItemId);
    }
  };

  const handlePreviousPage = () => {
    if (cursorId.length > 0) {
      const newCursorId = [...cursorId];
      newCursorId.pop();
      setCursorId(newCursorId);
      const prevCursor = newCursorId[newCursorId.length - 1] ?? "";
      setFilter("cursor", prevCursor);
    }
  };

  const actions = [
    {
      icon: MapPin,
      task: (id: string) => router.push(`/inventory/material-request/${id}`),
      label: "View",
      color: "text-indigo-500",
    },
  ];

  const tabs = [
    { value: "", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "DISPATCHED", label: "Dispatched" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const currentStatus = searchParams.get("status") ?? "";
  const currentPage = cursorId.length + 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#f7f6fb] border border-[#e0dfe8] rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter("status", tab.value)}
              className={`
                px-3 py-2 cursor-pointer rounded-md text-xs font-medium transition-all duration-150
                ${
                  currentStatus === tab.value
                    ? "bg-white text-[#1d1d24] shadow-sm border border-[#e0dfe8]"
                    : "text-[#80708f] hover:text-[#1d1d24]"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80708f]"
          />
          <input
            placeholder="Search requests..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#e0dfe8] bg-white text-[#1d1d24] placeholder:text-[#80708f] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            onChange={(e) => setFilter("search", e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        title="Material Requests"
        columns={columns}
        rows={formattedData}
        actions={actions}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-[#80708f]">
          Page{" "}
          <span className="font-semibold text-[#1d1d24]">{currentPage}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={cursorId.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e0dfe8] text-[#80708f] hover:text-[#1d1d24] hover:bg-[#f7f6fb] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={13} />
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={!requestsData.hasNextPage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestList;
