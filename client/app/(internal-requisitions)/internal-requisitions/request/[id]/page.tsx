"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { InternalRequisition } from "@/lib/internalRequestTypes";
import { internalRequestAPI } from "@/lib/internalRequestApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/helper/currencyFormat";
import { formatDate } from "@/helper/dateFormat";
import {
  ArrowLeft,
  Banknote,
  History,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "";

const COMPANY_BANKS = [
  { id: "Wema", name: "Wema Bank" },
  { id: "Fidelity", name: "Fidelity Bank" },
  { id: "Zenith1", name: "Zenith Bank (Main)" },
  { id: "Zenith2", name: "Zenith Bank (Operations)" },
  { id: "Sterling10077", name: "Sterling Bank (10077)" },
  { id: "Sterling76149", name: "Sterling Bank (76149)" },
  { id: "AlertMicro", name: "Alert Microfinance Bank" },
  { id: "Stanbic", name: "Stanbic IBTC Bank" },
  { id: "Petty", name: "Petty Cash" },
];

function StatusIcon({
  status,
  isFullyPaid,
}: {
  status: string;
  isFullyPaid: boolean;
}) {
  if (isFullyPaid) return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "outstanding")
    return <AlertTriangle className="h-3.5 w-3.5" />;
  if (status === "rejected") return <XCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

function SentryBadge({
  status,
  isFullyPaid,
}: {
  status: string;
  isFullyPaid: boolean;
}) {
  const configs: Record<
    string,
    { bg: string; text: string; border: string; label: string }
  > = {
    fullyPaid: {
      bg: "bg-[#1d3a2f]",
      text: "text-[#2ba672]",
      border: "border-[#2ba672]/30",
      label: "FULLY PAID",
    },
    outstanding: {
      bg: "bg-[#3a2a1a]",
      text: "text-[#fb923c]",
      border: "border-[#fb923c]/30",
      label: "OUTSTANDING",
    },
    rejected: {
      bg: "bg-[#3a1a1a]",
      text: "text-[#f05050]",
      border: "border-[#f05050]/30",
      label: "REJECTED",
    },
    pending: {
      bg: "bg-[#1a2a3a]",
      text: "text-[#5b9cf6]",
      border: "border-[#5b9cf6]/30",
      label: "PENDING",
    },
  };
  const key = isFullyPaid
    ? "fullyPaid"
    : status in configs
      ? status
      : "pending";
  const c = configs[key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border font-mono ${c.bg} ${c.text} ${c.border}`}
    >
      <StatusIcon status={status} isFullyPaid={isFullyPaid} />
      {c.label}
    </span>
  );
}

export default function RequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [request, setRequest] = useState<InternalRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [manualAmount, setManualAmount] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cheque">("bank");
  const user = useAuthStore((state) => state.user);
  const isDev = process.env.NODE_ENV === "development";

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await internalRequestAPI.dataById(id);
      setRequest(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requisition");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#fb923c ]" />
          <p className="text-[#9b9ba1] text-xs font-mono tracking-wider uppercase">
            Loading Requisition…
          </p>
        </div>
      </div>
    );

  if (!request)
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center space-y-3">
          <XCircle className="h-8 w-8 text-[#f05050] mx-auto" />
          <p className="text-[#333] font-mono text-sm">Requisition not found</p>
          <button
            onClick={() => router.push("/internal-requisitions")}
            className="text-[#fb923c ] text-xs font-mono hover:underline"
          >
            ← Back to list
          </button>
        </div>
      </div>
    );

  const totalPaid = request.paymentHistory.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const amountRemaining = request.amountRemaining;
  const amountToPay =
    manualAmount !== null ? Number(manualAmount) : amountRemaining;
  const isPartialPayment = manualAmount !== null;
  const paymentProgress = Math.min(
    100,
    (totalPaid / request.totalAmount) * 100,
  );
  const canProcess =
    ["pending", "outstanding"].includes(request.status) &&
    (isDev || user?.department === "Finance" || user?.role === "admin");
  const isFullyPaid = amountRemaining === 0;

  const handleAction = async (
    status: "approved" | "outstanding" | "rejected",
  ) => {
    if (!id || !request) return;
    // if (!isDev && user?.department !== "Finance") {
    //   return toast.error("You are not authorized to update this request");
    // }
    if (status !== "rejected") {
      if (!selectedBank) return toast.error("Please select a bank account.");
      if (!amountToPay || amountToPay <= 0)
        return toast.error("Enter a valid amount.");
      if (amountToPay > amountRemaining)
        return toast.error("Amount exceeds remaining balance.");
    }
    try {
      setIsSubmitting(true);
      await internalRequestAPI.updateRequest(id, {
        status,
        financeComment: comment,
        sourceBank: selectedBank,
        amountPaid: status === "rejected" ? 0 : amountToPay,
        paymentMethod,
      });
      toast.success(
        `Request ${status === "rejected" ? "rejected" : "processed"}`,
      );
      setComment("");
      setSelectedBank("");
      setManualAmount(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen "
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[#333] leading-tight tracking-tight">
                {request.title}
              </h1>
              <SentryBadge status={request.status} isFullyPaid={isFullyPaid} />
            </div>
            <p className="text-[#9b9ba1] font-mono text-[11px] tracking-wider">
              {request.requisitionNumber}
            </p>
          </div>

          <div className="flex items-stretch gap-px  rounded overflow-hidden shrink-0 border border-[#34363f]">
            <div className=" px-5 py-3">
              <p className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest mb-0.5">
                Total Requested
              </p>
              <p className="text-base font-mono font-bold text-[#333]">
                {formatCurrency(request.totalAmount)}
              </p>
            </div>
            <div className=" px-5 py-3">
              <p className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest mb-0.5">
                Total Paid
              </p>
              <p className="text-base font-mono font-bold text-[#2ba672]">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className=" px-5 py-3">
              <p className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest mb-0.5">
                Remaining
              </p>
              <p
                className={`text-base font-mono font-bold ${amountRemaining > 0 ? "text-[#fb923c ]" : "text-[#2ba672]"}`}
              >
                {formatCurrency(amountRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#9b9ba1] uppercase tracking-widest">
              Payment Progress
            </span>
            <span className="text-[10px] font-mono text-[#fb923c ]">
              {Math.round(paymentProgress)}%
            </span>
          </div>
          <div className="h-4 w-full bg-gray-400 rounded-full overflow-hidden">
            <div
              className="h-full  rounded-full transition-all duration-500"
              style={{
                width: `${paymentProgress}%`,
                background:
                  paymentProgress === 100
                    ? "#2ba672"
                    : "linear-gradient(90deg, #fb923c , #f0c314)",
              }}
            />
          </div>
        </div>

        {/* ── Body Grid ── */}
        <div
          className={`grid grid-cols-1 ${canProcess ? "lg:grid-cols-12" : ""} gap-6`}
        >
          {/* LEFT */}
          <div className={`${canProcess ? "lg:col-span-8" : ""} space-y-5`}>
            {/* Items Table */}
            <div className="rounded border border-[#34363f] overflow-hidden ">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#34363f] ">
                <span className="text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                  Request Items
                </span>
                <span className="text-[10px] font-mono text-[#9b9ba1]">
                  {request.items.length} line
                  {request.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2b2d36]">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                      Description
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                      Qty
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {request.items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-[#2b2d36]  transition-colors"
                    >
                      <td className="px-4 py-3 text-[#333] truncate max-w-[280px]">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-[#9b9ba1]">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#333]">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                  <tr className="">
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-right text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono"
                    >
                      Gross Amount
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#fb923c ] text-base">
                      {formatCurrency(request.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Meta cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded border border-[#34363f]  p-4 space-y-3">
                <CardContent>
                  <MetaField label="Requested By" value={request.user.name} />
                  <MetaField
                    label="Department"
                    value={`${request.user.department}`}
                  />
                  <MetaField label="Email" value={request.user.email} mono />
                </CardContent>
              </Card>
              <Card className="rounded border border-[#34363f]  p-4 space-y-3">
                <CardContent>
                  <MetaField
                    label="Location"
                    value={`${request.location} Office`}
                  />
                  <MetaField
                    label="Submitted"
                    value={formatDate(request.requestedOn)}
                    mono
                  />
                  <div>
                    <p className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest mb-1 font-mono">
                      Category
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2b2d36] text-[#7553c0] border border-[#7553c0]/30 uppercase tracking-wider">
                      {request.category.replace("-", " ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attachments */}
            {request.attachments.length > 0 && (
              <div className="rounded border border-[#34363f] overflow-hidden ">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#34363f] ">
                  <span className="text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                    Attachments
                  </span>
                  <span className="text-[10px] font-mono text-[#9b9ba1]">
                    {request.attachments.length} file
                    {request.attachments.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {request.attachments.map((file, idx) => {
                      const extension = file.substring(
                        file.lastIndexOf(".") + 1,
                      );
                      return (
                        <div
                          key={idx}
                          className="group relative rounded overflow-hidden border border-[#34363f] bg-gray-300"
                        >
                          {extension === "png" ||
                          extension === "jpg" ||
                          extension === "jpeg" ? (
                            <img
                              src={`${FILE_BASE_URL}${file}`}
                              alt={`Attachment ${idx + 1}`}
                              className="w-full h-36 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                            />
                          ) : (
                            <div>
                              <div className="h-36 flex items-center justify-center text-[#9b9ba1]">
                                <p className="text-center text-sm font-mono">
                                  {file.split("/").pop()}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2 justify-between">
                            <span className="text-[10px] font-mono text-white/80">
                              #{idx + 1}
                            </span>
                            <a
                              href={`${FILE_BASE_URL}${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono font-bold bg-[#fb923c ] text-white px-2 py-0.5 rounded"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Payment History (non-finance) */}
            {!canProcess && (
              <PaymentHistoryCard request={request} totalPaid={totalPaid} />
            )}
          </div>

          {/* RIGHT: Finance Actions */}
          {canProcess && (
            <div className="lg:col-span-4">
              <div className="rounded border border-[#34363f] overflow-hidden  sticky top-6">
                {/* Panel header */}
                <div className="px-4 py-3  border-b border-[#34363f] flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5 text-[#fb923c ]" />
                  <span className="text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                    Finance Actions
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Beneficiary */}
                  <div className="rounded border border-[#34363f]  p-3 space-y-1">
                    <p className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono mb-2">
                      Beneficiary
                    </p>
                    <p className="text-sm font-semibold text-[#333] truncate">
                      {request.accountToPay?.accountName}
                    </p>
                    <p className="text-xl font-mono font-bold text-[#fb923c ] tracking-tight leading-none">
                      {request.accountToPay?.accountNumber}
                    </p>
                    <p className="text-[10px] font-mono text-[#9b9ba1]">
                      {request.accountToPay?.bankName}
                    </p>
                  </div>

                  <div className="h-px " />

                  {/* Source Bank */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono block">
                      Source Account
                    </label>
                    <Select
                      onValueChange={setSelectedBank}
                      value={selectedBank}
                    >
                      <SelectTrigger className="w-full  border-[#34363f] text-[#333] text-sm font-mono h-9 focus:ring-[#fb923c ] focus:border-[#fb923c ]">
                        <SelectValue placeholder="Select bank…" />
                      </SelectTrigger>
                      <SelectContent className=" border-[#34363f] text-[#333]">
                        {COMPANY_BANKS.map((bank) => (
                          <SelectItem
                            key={bank.id}
                            value={bank.id}
                            className="font-mono text-sm "
                          >
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono block">
                      Payment Method
                    </label>
                    <div className="flex gap-2">
                      {(["bank", "cheque"] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`flex-1 py-1.5 rounded text-[10px] font-bold font-mono uppercase tracking-widest border transition-colors ${
                            paymentMethod === method
                              ? "bg-black text-white border-[#fb923c ]/50"
                              : " text-[#9b9ba1] border-[#34363f] hover:border-[#9b9ba1]"
                          }`}
                        >
                          {method === "bank" ? "Transfer" : "Cheque"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
                        Amount
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setManualAmount(manualAmount === null ? "" : null)
                        }
                        className="text-[9px] font-bold font-mono text-[#fb923c ] hover:underline uppercase tracking-widest"
                      >
                        {manualAmount === null ? "Manual →" : "Full Amount →"}
                      </button>
                    </div>
                    {manualAmount !== null ? (
                      <Input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="0.00"
                        className=" border-[#34363f] text-[#fb923c ] font-mono text-sm h-9 focus:ring-[#fb923c ] focus:border-[#fb923c ]"
                      />
                    ) : (
                      <div className="rounded border border-[#34363f]  px-3 py-2">
                        <p className="font-mono text-lg font-bold text-[#fb923c ]">
                          {formatCurrency(amountRemaining)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono block">
                      Notes / Transaction ID
                    </label>
                    <Textarea
                      placeholder="e.g. TXN-2024-00123…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className=" border-[#34363f] text-[#333] font-mono text-xs min-h-[72px] resize-none focus:ring-[#fb923c ] focus:border-[#fb923c ] placeholder:text-[#9b9ba1]"
                    />
                  </div>

                  <div className="h-px " />

                  {/* CTA Buttons */}
                  <div className="space-y-2">
                    <button
                      disabled={isSubmitting}
                      onClick={() =>
                        handleAction(
                          isPartialPayment ? "outstanding" : "approved",
                        )
                      }
                      className="w-full cursor-pointer h-10 rounded font-mono text-xs font-bold uppercase tracking-widest bg-green-500 text-white hover:bg-green-800 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      {isPartialPayment
                        ? "Process Partial Payment"
                        : "Process Full Payment"}
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction("rejected")}
                      className="w-full h-8 rounded font-mono text-[10px] font-bold uppercase tracking-widest text-[#f05050] bg-transparent hover:bg-[#f05050]/10 border border-[#f05050]/30 hover:border-[#f05050]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Decline Requisition
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment History (finance) */}
        {canProcess && (
          <PaymentHistoryCard request={request} totalPaid={totalPaid} />
        )}
      </div>
    </div>
  );
}

// ─── Meta Field helper ────────────────────────────────────────────────────────
function MetaField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono mb-0.5">
        {label}
      </p>
      <p className={`text-sm text-[#333] ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Payment History Card ─────────────────────────────────────────────────────
function PaymentHistoryCard({
  request,
  totalPaid,
}: {
  request: InternalRequisition;
  totalPaid: number;
}) {
  return (
    <div className="rounded border border-[#34363f] overflow-hidden ">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#34363f] ">
        <div className="flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-[#9b9ba1]" />
          <span className="text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono">
            Payment Ledger
          </span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#2b2d36] text-[#9b9ba1] text-[9px] font-mono">
            {request.paymentHistory?.length || 0}
          </span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2b2d36]">
            {[
              "Timestamp",
              "Source Bank",
              "Method",
              "Processed By",
              "Amount",
            ].map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2.5 text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono ${i === 4 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {request.paymentHistory.length > 0 ? (
            request.paymentHistory.map((log, idx) => (
              <tr
                key={idx}
                className="border-b border-[#2b2d36]  transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-[#9b9ba1]">
                  {formatDate(log.date)}
                </td>
                <td className="px-4 py-3 text-sm text-[#333] font-medium">
                  {log.bank || "N/A"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold border bg-[#2b2d36] text-[#7553c0] border-[#7553c0]/30 uppercase tracking-wider">
                    {log.paymentMethod || "Bank"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#9b9ba1] font-mono">
                  {log.paidBy || "System"}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-[#333]">
                  {formatCurrency(log.amount)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-xs font-mono text-[#9b9ba1]"
              >
                No payment history recorded
              </td>
            </tr>
          )}
          <tr className=" border-t-2 border-[#34363f]">
            <td
              colSpan={4}
              className="px-4 py-3 text-right text-[10px] font-bold text-[#9b9ba1] uppercase tracking-widest font-mono"
            >
              Total Paid
            </td>
            <td className="px-4 py-3 text-right font-mono font-bold text-[#2ba672] text-base">
              {formatCurrency(totalPaid)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
