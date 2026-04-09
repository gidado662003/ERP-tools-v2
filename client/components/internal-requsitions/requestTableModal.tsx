"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { internalRequestAPI } from "@/lib/internalRequestApi";
import { formatCurrency } from "@/helper/currencyFormat";
import { InternalRequisition } from "@/lib/internalRequestTypes";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const STATUS_DOT: Record<string, string> = {
  approved: "bg-emerald-500",
  pending: "bg-amber-400",
  rejected: "bg-red-500",
  "in review": "bg-blue-500",
  completed: "bg-teal-500",
  outstanding: "bg-orange-400",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

function RequestTableModal({ itemId }: { itemId: string }) {
  const [data, setData] = useState<InternalRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleGetItemById = async () => {
      try {
        const response = await internalRequestAPI.dataById(itemId);
        setData(response);
      } catch (error) {
        console.error("Error fetching requisition:", error);
      } finally {
        setLoading(false);
      }
    };
    if (itemId) handleGetItemById();
  }, [itemId]);

  return (
    <Dialog>
      <DialogTrigger className="text-xs text-[#6366f1] dark:text-indigo-400 hover:underline underline-offset-2 font-medium">
        View
      </DialogTrigger>

      <DialogContent className="w-full max-w-[780px] max-h-[85vh] overflow-y-auto p-0 gap-0 border border-[#e0dfe8] dark:border-gray-700 bg-white dark:bg-gray-900">
        {loading ? (
          /* ── Skeleton ── */
          <div className="p-6 space-y-4">
            <div className="h-4 w-48 rounded bg-[#f0eef5] dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-32 rounded bg-[#f0eef5] dark:bg-gray-800 animate-pulse" />
            <div className="h-px bg-[#e0dfe8] dark:bg-gray-700 my-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded bg-[#f0eef5] dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : !data ? (
          <div className="p-10 text-center text-xs text-red-500 dark:text-red-400">
            Failed to load data.
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <DialogHeader className="px-5 py-4 border-b border-[#e0dfe8] dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <DialogTitle className="text-sm font-semibold text-[#1d1d24] dark:text-gray-100 truncate">
                    {data.title}
                  </DialogTitle>
                  <p className="text-[11px] text-[#80708f] dark:text-gray-400 font-mono">
                    {data.requisitionNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 text-xs text-[#1d1d24] dark:text-gray-200 capitalize">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[data.status] ?? "bg-gray-400"}`}
                    />
                    {data.status}
                  </span>
                  <button
                    onClick={() =>
                      router.push(`/internal-requisitions/request/${data._id}`)
                    }
                    className="flex items-center cursor-pointer gap-1 px-2.5 py-1 text-xs font-medium text-[#6366f1] dark:text-indigo-400 border border-[#e0dfe8] dark:border-gray-700 rounded hover:bg-[#f0eef5] dark:hover:bg-gray-800 transition-colors"
                  >
                    Full details
                    <ArrowUpRight size={11} />
                  </button>
                </div>
              </div>
            </DialogHeader>

            {/* ── Meta row ── */}
            <div className="grid grid-cols-4 gap-px bg-[#e0dfe8] dark:bg-gray-700 border-b border-[#e0dfe8] dark:border-gray-700">
              {[
                { label: "Requested By", value: data.user.name },
                { label: "Department", value: data.user.department },
                { label: "Location", value: data.location },
                {
                  label: "Date",
                  value: new Date(data.requestedOn).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" },
                  ),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-gray-900 px-4 py-3"
                >
                  <p className="text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-xs font-medium text-[#1d1d24] dark:text-gray-200 truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Items table ── */}
            <div className="px-5 py-4">
              <p className="text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-3">
                Line Items
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e0dfe8] dark:border-gray-700">
                    {["Description", "Qty", "Unit Price", "Total"].map(
                      (h, i) => (
                        <th
                          key={h}
                          className={`pb-2 text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide font-medium ${i === 0 ? "text-left" : "text-right"}`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-[#f0eef5] dark:border-gray-800 hover:bg-[#faf9fc] dark:hover:bg-gray-800/50"
                    >
                      <td className="py-2.5 text-[#1d1d24] dark:text-gray-200 font-medium">
                        {item.description}
                      </td>
                      <td className="py-2.5 text-right text-[#80708f] dark:text-gray-400 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[#80708f] dark:text-gray-400">
                        {fmt(item.unitPrice)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[#1d1d24] dark:text-gray-200">
                        {fmt(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="pt-3 text-right text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide font-medium"
                    >
                      Grand Total
                    </td>
                    <td className="pt-3 text-right font-mono font-semibold text-[#6366f1] dark:text-indigo-400 text-sm">
                      {fmt(data.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── Payment + Additional ── */}
            <div className="grid grid-cols-2 gap-px bg-[#e0dfe8] dark:bg-gray-700 border-t border-[#e0dfe8] dark:border-gray-700">
              {/* Payment */}
              <div className="bg-white dark:bg-gray-900 px-5 py-4 space-y-2">
                <p className="text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-3">
                  Payment Details
                </p>
                {data.accountToPay ? (
                  [
                    {
                      label: "Account Name",
                      value: data.accountToPay.accountName,
                    },
                    {
                      label: "Account Number",
                      value: data.accountToPay.accountNumber,
                    },
                    { label: "Bank", value: data.accountToPay.bankName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-[#80708f] dark:text-gray-400">
                        {label}
                      </span>
                      <span className="text-[#1d1d24] dark:text-gray-200 font-mono">
                        {value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#80708f] dark:text-gray-400">
                    No account details
                  </p>
                )}
              </div>

              {/* Additional */}
              <div className="bg-white dark:bg-gray-900 px-5 py-4 space-y-2">
                <p className="text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-3">
                  Additional Info
                </p>
                {[
                  { label: "Category", value: data.category, mono: false },
                  { label: "Location", value: data.location, mono: false },
                  {
                    label: "Attachments",
                    value: `${data.attachments.length} file(s)`,
                    mono: true,
                  },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#80708f] dark:text-gray-400">
                      {label}
                    </span>
                    <span
                      className={`text-[#1d1d24] dark:text-gray-200 capitalize ${mono ? "font-mono" : ""}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RequestTableModal;
