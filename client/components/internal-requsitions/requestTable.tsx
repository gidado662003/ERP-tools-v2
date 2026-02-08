import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import { Button } from "../ui/button";
import { formatCurrency } from "@/helper/currencyFormat";
import { formatDate } from "@/helper/dateFormat";
import { internlRequestAPI } from "@/lib/internalRequestApi";
import { InternalRequisition } from "@/lib/internalRequestTypes";
import RequestTableDropDown from "@/components/internal-requsitions/requestTableDropDown";
import { Badge } from "../ui/badge";
import InvoicePdf from "./invoice/invoice";
type RequestTableProps = {
  data?: InternalRequisition[];
  hasMore?: boolean;
  onNext: () => void;
  onBack: () => void;
};

function RequestTable({ data, hasMore, onNext, onBack }: RequestTableProps) {
  const headers = [
    "",
    "S/N",
    "Date",
    "Title",
    "Department",
    "Location",
    "Category",
    "Status",
    "Amount Requested",
    "Actions",
  ];
  const [requestData, setRequestData] = useState<InternalRequisition[]>();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setRequestData(data);
    }
  }, [data]);
  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests((prev) => {
      if (prev.includes(requestId)) {
        return prev.filter((id) => id !== requestId);
      }
      return [...prev, requestId];
    });
  };
  return (
    <div>
      {selectedRequests.length > 0 && (
        <Button onClick={() => setSelectedRequests([])}>Download PDF</Button>
      )}
      <Table>
        <TableCaption>A list of your recent requisitions.</TableCaption>
        <TableHeader>
          <TableRow>
            {headers.map((headers) => (
              <TableHead key={headers}>{headers}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requestData && requestData.length > 0 ? (
            requestData.map((data, index) => (
              <TableRow key={data._id}>
                <TableCell className="w-2">
                  <Input
                    value={data._id}
                    type="checkbox"
                    checked={selectedRequests.includes(data._id)}
                    onChange={() => handleSelectRequest(data._id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{formatDate(data.requestedOn)}</TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={data.title}
                >
                  {data.title}
                </TableCell>
                <TableCell>{data.department}</TableCell>
                <TableCell>{data.location || "Not specified"}</TableCell>
                <TableCell className="capitalize">{data.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={data.status === "approved" ? "default" : "outline"}
                  >
                    {data.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(data.totalAmount)}
                </TableCell>
                <TableCell>
                  <RequestTableDropDown itemId={data._id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-24 text-center text-muted-foreground"
              >
                No requisitions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={11} className="p-0">
              <div className="flex items-center justify-end gap-4 p-4 bg-gray-50/50">
                <Button
                  onClick={onBack}
                  className="cursor-pointer px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Back
                </Button>
                <Button
                  onClick={onNext}
                  disabled={!hasMore}
                  className={` cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors`}
                >
                  Next
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export default RequestTable;
