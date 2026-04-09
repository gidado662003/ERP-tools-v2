"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { formatCurrency } from "@/helper/currencyFormat";
import { formatDate } from "@/helper/dateFormat";
import { InternalRequisition } from "@/lib/internalRequestTypes";
import RequestTableDropDown from "@/components/internal-requsitions/requestTableDropDown";
import { Badge } from "../ui/badge";
import { FileDown, X, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { generatePrintable } from "@/lib/pdfGenrator";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

type RequestTableProps = {
  data?: InternalRequisition[];
  hasMore?: boolean;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
};

function RequestTable({
  data,
  hasMore,
  onNext,
  onBack,
  loading,
}: RequestTableProps) {
  const [requestData, setRequestData] = useState<InternalRequisition[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<
    InternalRequisition[]
  >([]);
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  useEffect(() => {
    if (data) setRequestData(data);
  }, [data]);

  const handleSelectRequest = (request: InternalRequisition) => {
    const isAlreadySelected = selectedRequests.some(
      (item) => item._id === request._id,
    );
    if (isAlreadySelected) {
      setSelectedRequests(
        selectedRequests.filter((item) => item._id !== request._id),
      );
    } else {
      if (selectedRequests.length >= 2) return;
      setSelectedRequests([...selectedRequests, request]);
    }
  };

  const clearSelection = () => {
    setSelectedRequests([]);
    setShowPDFDialog(false);
  };

  const user = useAuthStore((state) => state.user);

  const canPrint =
    user?.role === "admin" ||
    user?.department?.toLocaleLowerCase() === "finance";

  // Status Badge Logic
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
      case "rejected":
        return "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="relative space-y-4">
      {/* Selection Floating Bar */}
      {selectedRequests.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="flex items-center justify-between p-4 shadow-2xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {selectedRequests.map((req, i) => (
                  <div
                    key={req._id}
                    className="h-8 w-8 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                  {selectedRequests.length === 2
                    ? "Ready to export"
                    : "Select one more document"}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 italic">
                  Up to 2 documents supported
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                className="h-9 px-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear
              </Button>
              <Button
                size="sm"
                disabled={selectedRequests.length === 0}
                onClick={() => generatePrintable(selectedRequests)}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Print Request
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="my-2 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent dark:border-gray-700">
              {canPrint && <TableHead className="w-[40px]"></TableHead>}
              <TableHead className="w-[60px] text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                S/N
              </TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                Date
              </TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                Request Title
              </TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                Dept/Location
              </TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                Category
              </TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 text-center">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 text-right">
                Amount
              </TableHead>
              <TableHead className="w-[80px] text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestData.length > 0 ? (
              requestData.map((data, index) => {
                const isSelected = selectedRequests.some(
                  (item) => item._id === data._id,
                );
                const canSelect = selectedRequests.length < 2 || isSelected;

                return (
                  <TableRow
                    key={data._id}
                    className={cn(
                      "group transition-colors dark:border-gray-700",
                      isSelected
                        ? "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
                        : "hover:bg-slate-50/50 dark:hover:bg-gray-800/50",
                    )}
                  >
                    {canPrint && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectRequest(data)}
                          disabled={!canSelect}
                          className="border-slate-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-slate-500 dark:text-gray-400 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-600 dark:text-gray-300">
                      {formatDate(data.requestedOn)}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="flex flex-col">
                        <span
                          className="font-semibold text-slate-900 dark:text-gray-100 truncate"
                          title={data.title}
                        >
                          {data.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono uppercase tracking-tighter">
                          ID: {data._id.slice(-6)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-200">
                          {data.department}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-gray-500">
                          {data.location || "Head Office"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize font-medium border-slate-200 text-slate-600 bg-white dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800"
                      >
                        {data.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "px-2.5 py-0.5 border shadow-none capitalize",
                          getStatusVariant(data.status),
                        )}
                      >
                        {data.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 dark:text-gray-100">
                      {formatCurrency(data.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <RequestTableDropDown itemId={data._id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="dark:border-gray-700">
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-gray-800 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-slate-300 dark:text-gray-600" />
                    </div>
                    <p className="text-slate-500 dark:text-gray-400 font-medium">
                      No requisitions found.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-transparent border-t dark:border-gray-700">
            <TableRow className="dark:border-gray-700">
              <TableCell colSpan={9} className="p-4">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-slate-500 dark:text-gray-400 italic">
                    Showing {requestData.length} records on this page
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBack}
                      className="h-8 px-3 border-slate-200 text-slate-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNext}
                      disabled={!hasMore}
                      className="h-8 px-3 border-slate-200 text-slate-600 disabled:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

export default RequestTable;
