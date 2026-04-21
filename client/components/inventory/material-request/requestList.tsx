"use client";
import React from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { MaterialRequest } from "@/lib/material-request/material-requestType";
import { Badge } from "@/components/ui/badge";

function RequestList({ data }: { data: MaterialRequest[] }) {
  const router = useRouter();
  const columns = [
    { key: "requestNumber", label: "Request Number" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
  ];
  const handleStatusColor = (status: MaterialRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formattedData = data.map((req: any) => ({
    ...req,
    createdAt: new Date(req.createdAt).toLocaleDateString(),
    status: (
      <Badge className={handleStatusColor(req.status)}>{req.status}</Badge>
    ),
  }));
  const actions = [
    {
      icon: MapPin,
      task: (id: string) => {
        router.push(`/inventory/material-request/${id}`);
      },
      label: "View",
      color: "text-yellow-300",
    },
  ];
  return (
    <DataTable
      title="Request"
      columns={columns}
      rows={formattedData}
      actions={actions}
    />
  );
}

export default RequestList;
