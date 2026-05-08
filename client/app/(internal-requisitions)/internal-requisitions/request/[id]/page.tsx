"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { InternalRequisition } from "@/lib/internalRequestTypes";
import { internalRequestAPI } from "@/lib/internalRequestApi";
import { formatCurrency } from "@/helper/currencyFormat";
import { formatDate } from "@/helper/dateFormat";
import {
  ArrowLeft,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  History,
  CreditCard,
  UserCircle,
  ListChecks,
  Info,
  Check,
  Building2,
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

// ─── Status config ────────────────────────────────────────────────────────────
type StatusKey = "fullyPaid" | "outstanding" | "rejected" | "pending";

const STATUS: Record<
  StatusKey,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    Icon: React.ElementType;
  }
> = {
  fullyPaid: {
    bg: "#EAF3DE",
    text: "#3B6D11",
    border: "#63992244",
    label: "FULLY PAID",
    Icon: CheckCircle2,
  },
  outstanding: {
    bg: "#FAEEDA",
    text: "#854F0B",
    border: "#BA751744",
    label: "OUTSTANDING",
    Icon: AlertTriangle,
  },
  rejected: {
    bg: "#FCEBEB",
    text: "#A32D2D",
    border: "#E24B4A44",
    label: "REJECTED",
    Icon: XCircle,
  },
  pending: {
    bg: "#E6F1FB",
    text: "#185FA5",
    border: "#378ADD44",
    label: "PENDING",
    Icon: Clock,
  },
};

function resolveKey(status: string, isFullyPaid: boolean): StatusKey {
  if (isFullyPaid) return "fullyPaid";
  return (status in STATUS ? status : "pending") as StatusKey;
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9.5px] font-mono font-bold text-[#b0adb8] uppercase tracking-[0.06em] mb-1">
      {children}
    </p>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-border/20 rounded-[12px] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardHead({
  icon: Icon,
  children,
  right,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0eef5] dark:border-border/10 bg-[#faf9fd] dark:bg-[#0e0c1a]">
      <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#80748d] uppercase tracking-[0.07em]">
        <Icon size={13} className="text-[#b0adb8]" />
        {children}
      </span>
      {right && (
        <span className="text-[10px] font-mono text-[#b0adb8]">{right}</span>
      )}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({
  status,
  isFullyPaid,
}: {
  status: string;
  isFullyPaid: boolean;
}) {
  const key = resolveKey(status, isFullyPaid);
  const cfg = STATUS[key];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold tracking-[0.06em] border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <cfg.Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── Amount chips row ─────────────────────────────────────────────────────────
function AmountChips({
  total,
  paid,
  remaining,
}: {
  total: number;
  paid: number;
  remaining: number;
}) {
  const chips = [
    { label: "Total Requested", val: formatCurrency(total), color: "#3B82F6" },
    { label: "Total Paid", val: formatCurrency(paid), color: "#3B6D11" },
    {
      label: "Remaining",
      val: formatCurrency(remaining),
      color: remaining > 0 ? "#854F0B" : "#3B6D11",
    },
  ];
  return (
    <div className="flex gap-px bg-[#e0dfe3] dark:bg-border/20 rounded-[10px] overflow-hidden shrink-0 border border-[#e0dfe3] dark:border-border/20">
      {chips.map(({ label, val, color }) => (
        <div
          key={label}
          className="bg-white dark:bg-[#141320] px-5 py-2.5 text-right"
        >
          <FieldLabel>{label}</FieldLabel>
          <p className="text-[15px] font-mono font-medium" style={{ color }}>
            {val}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function PaymentProgress({ pct }: { pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-[#b0adb8] uppercase tracking-[0.05em]">
          Payment progress
        </span>
        <span className="text-[10px] font-mono text-[#6c5fc7] font-medium">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-[5px] bg-[#f0edf8] dark:bg-border/20 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 100 ? "#639922" : "#6c5fc7",
          }}
        />
      </div>
    </div>
  );
}

// ─── Items table ──────────────────────────────────────────────────────────────
function ItemsTable({ request }: { request: InternalRequisition }) {
  return (
    <CardShell>
      <CardHead
        icon={ListChecks}
        right={`${request.items.length} line${request.items.length !== 1 ? "s" : ""}`}
      >
        Request items
      </CardHead>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f0eef5] dark:border-border/10">
            {[
              ["Description", "left"],
              ["Qty", "center"],
              ["Amount", "right"],
            ].map(([h, align]) => (
              <th
                key={h}
                className={`px-4 py-2.5 text-[9.5px] font-mono font-bold text-[#b0adb8] uppercase tracking-[0.06em] text-${align}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {request.items.map((item) => (
            <tr
              key={item._id}
              className="border-b border-[#f7f6fb] dark:border-border/5 hover:bg-[#faf9fd] dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-4 py-2.5 text-[13px] text-[#1d1c21] dark:text-foreground truncate max-w-[300px]">
                {item.description}
              </td>
              <td className="px-4 py-2.5 text-center font-mono text-[12px] text-[#80748d]">
                {item.quantity}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-[13px] font-medium text-[#1d1c21] dark:text-foreground">
                {formatCurrency(item.total)}
              </td>
            </tr>
          ))}
          <tr className="bg-[#faf9fd] dark:bg-[#141320] border-t border-[#e0dfe3] dark:border-border/20">
            <td
              colSpan={2}
              className="px-4 py-3 text-right text-[10px] font-mono font-bold text-[#b0adb8] uppercase tracking-[0.06em]"
            >
              Gross amount
            </td>
            <td className="px-4 py-3 text-right font-mono text-[15px] font-medium text-[#6c5fc7]">
              {formatCurrency(request.totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>
    </CardShell>
  );
}

// ─── Request details ──────────────────────────────────────────────────────────
function RequestMeta({ request }: { request: InternalRequisition }) {
  const fields = [
    { label: "Requested by", val: request.user.name, mono: false },
    { label: "Department", val: request.user.department, mono: false },
    { label: "Email", val: request.user.email, mono: true },
    { label: "Location", val: `${request.location} Office`, mono: false },
    { label: "Submitted", val: formatDate(request.requestedOn), mono: true },
    {
      label: "Category",
      val: request.category.replace("-", " "),
      mono: true,
      pill: true,
    },
  ];
  return (
    <CardShell>
      <CardHead icon={Info}>Request details</CardHead>
      <div className="grid grid-cols-2">
        {fields.map(({ label, val, mono, pill }, i) => (
          <div
            key={label}
            className={`px-4 py-3
              ${i % 2 === 0 ? "border-r border-[#f0eef5] dark:border-border/10" : ""}
              ${i < fields.length - 2 ? "border-b border-[#f0eef5] dark:border-border/10" : ""}
            `}
          >
            <FieldLabel>{label}</FieldLabel>
            {pill ? (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold uppercase tracking-wider"
                style={{
                  background: "#EEEDFE",
                  color: "#534AB7",
                  border: "0.5px solid #534AB755",
                }}
              >
                {val}
              </span>
            ) : (
              <p
                className={`text-[13px] text-[#1d1c21] dark:text-foreground ${mono ? "font-mono text-[12px]" : ""}`}
              >
                {val}
              </p>
            )}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── Attachments ──────────────────────────────────────────────────────────────
function Attachments({ attachments }: { attachments: string[] }) {
  if (!attachments.length) return null;
  return (
    <CardShell>
      <CardHead
        icon={ListChecks}
        right={`${attachments.length} file${attachments.length !== 1 ? "s" : ""}`}
      >
        Attachments
      </CardHead>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {attachments.map((file, idx) => {
            const ext = file.substring(file.lastIndexOf(".") + 1).toLowerCase();
            const isImg = ["png", "jpg", "jpeg"].includes(ext);
            return (
              <div
                key={idx}
                className="group relative rounded-[8px] overflow-hidden border border-[#e0dfe3] dark:border-border/20 bg-[#f5f3f0] dark:bg-[#0e0c1a]"
              >
                {isImg ? (
                  <img
                    src={`${FILE_BASE_URL}${file}`}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-32 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center p-3">
                    <p className="text-center text-[11px] font-mono text-[#80748d] break-all leading-relaxed">
                      {file.split("/").pop()}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 justify-between">
                  <span className="text-[10px] font-mono text-white/70">
                    #{idx + 1}
                  </span>
                  <a
                    href={`${FILE_BASE_URL}${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono font-bold bg-[#6c5fc7] text-white px-2 py-0.5 rounded-[4px]"
                  >
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CardShell>
  );
}

// ─── Payment ledger ───────────────────────────────────────────────────────────
function PaymentLedger({
  request,
  totalPaid,
}: {
  request: InternalRequisition;
  totalPaid: number;
}) {
  return (
    <CardShell>
      <CardHead
        icon={History}
        right={
          <span className="px-1.5 py-0.5 rounded-full bg-[#f0edf8] border border-[#e0dfe3] text-[9px] font-mono text-[#80748d]">
            {request.paymentHistory?.length || 0}
          </span>
        }
      >
        Payment ledger
      </CardHead>

      {request.paymentHistory.length === 0 ? (
        <p className="px-4 py-10 text-center text-[12px] font-mono text-[#b0adb8]">
          No payment history recorded
        </p>
      ) : (
        <>
          {request.paymentHistory.map((log, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#f7f6fb] dark:border-border/5 hover:bg-[#faf9fd] dark:hover:bg-white/[0.02] transition-colors last:border-0"
            >
              <div className="w-7 h-7 rounded-[7px] bg-[#EEEDFE] flex items-center justify-center shrink-0">
                <Building2 size={13} className="text-[#6c5fc7]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-[#1d1c21] dark:text-foreground">
                  {log.bank || "N/A"}
                  <span
                    className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[9.5px] font-mono font-bold uppercase tracking-wider align-middle"
                    style={{
                      background: "#EEEDFE",
                      color: "#534AB7",
                      border: "0.5px solid #534AB755",
                    }}
                  >
                    {log.paymentMethod || "Bank"}
                  </span>
                </p>
                <p className="text-[11px] font-mono text-[#b0adb8] mt-0.5">
                  {log.paidBy || "System"} · {formatDate(log.date)}
                </p>
              </div>
              <p className="text-[13px] font-mono font-medium text-[#3B6D11] whitespace-nowrap">
                {formatCurrency(log.amount)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#faf9fd] dark:bg-[#141320] border-t border-[#e0dfe3] dark:border-border/20">
            <span className="text-[10px] font-mono font-bold text-[#b0adb8] uppercase tracking-[0.06em]">
              Total paid
            </span>
            <span className="text-[14px] font-mono font-medium text-[#3B6D11]">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </>
      )}
    </CardShell>
  );
}

// ─── Finance sidebar ──────────────────────────────────────────────────────────
function FinancePanel({
  request,
  isSubmitting,
  selectedBank,
  setSelectedBank,
  paymentMethod,
  setPaymentMethod,
  manualAmount,
  setManualAmount,
  comment,
  setComment,
  amountRemaining,
  isPartialPay,
  onProcess,
  onDecline,
}: {
  request: InternalRequisition;
  isSubmitting: boolean;
  selectedBank: string;
  setSelectedBank: (v: string) => void;
  paymentMethod: "bank" | "cheque";
  setPaymentMethod: (v: "bank" | "cheque") => void;
  manualAmount: string | null;
  setManualAmount: (v: string | null) => void;
  comment: string;
  setComment: (v: string) => void;
  amountRemaining: number;
  isPartialPay: boolean;
  onProcess: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Beneficiary */}
      <CardShell>
        <CardHead icon={UserCircle}>Beneficiary</CardHead>
        <div className="px-4 py-3.5">
          <p className="text-[13px] font-medium text-[#1d1c21] dark:text-foreground mb-1 truncate">
            {request.accountToPay?.accountName}
          </p>
          <p className="text-[20px] font-mono font-medium text-[#6c5fc7] tracking-wide leading-none mb-1.5">
            {request.accountToPay?.accountNumber}
          </p>
          <p className="text-[11px] font-mono text-[#b0adb8]">
            {request.accountToPay?.bankName}
          </p>
        </div>
      </CardShell>

      {/* Actions */}
      <CardShell>
        <CardHead icon={CreditCard}>Finance actions</CardHead>
        <div className="p-4 flex flex-col gap-3.5">
          {/* Source account */}
          <div>
            <FieldLabel>Source account</FieldLabel>
            <div className="relative">
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full h-[34px] pl-3 pr-7 rounded-[7px] border border-[#e0dfe3] dark:border-border/20 bg-white dark:bg-[#141320] text-[12px] font-mono text-[#1d1c21] dark:text-foreground appearance-none focus:outline-none focus:border-[#6c5fc7] transition-colors"
              >
                <option value="">Select bank…</option>
                {COMPANY_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#80748d] text-[10px]">
                ▾
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <FieldLabel>Payment method</FieldLabel>
            <div className="flex gap-1.5">
              {(["bank", "cheque"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 h-[30px] rounded-[6px] text-[10px] font-mono font-bold uppercase tracking-[0.06em] border transition-colors
                    ${
                      paymentMethod === m
                        ? "bg-[#6c5fc7] text-white border-[#6c5fc7]"
                        : "bg-transparent text-[#80748d] border-[#e0dfe3] dark:border-border/20 hover:border-[#b0adb8]"
                    }`}
                >
                  {m === "bank" ? "Transfer" : "Cheque"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Amount</FieldLabel>
              <button
                type="button"
                onClick={() =>
                  setManualAmount(manualAmount === null ? "" : null)
                }
                className="text-[9.5px] font-mono font-bold text-[#6c5fc7] hover:underline uppercase tracking-[0.06em]"
              >
                {manualAmount === null ? "Manual →" : "Full Amount →"}
              </button>
            </div>
            {manualAmount !== null ? (
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-[34px] px-3 rounded-[7px] border border-[#e0dfe3] dark:border-border/20 bg-white dark:bg-[#141320] text-[13px] font-mono text-[#6c5fc7] focus:outline-none focus:border-[#6c5fc7] transition-colors placeholder:text-[#d4d0de]"
              />
            ) : (
              <div className="rounded-[7px] border border-[#e0dfe3] dark:border-border/20 px-3 py-2 bg-[#faf9fd] dark:bg-[#0e0c1a]">
                <p className="text-[17px] font-mono font-medium text-[#6c5fc7]">
                  {formatCurrency(amountRemaining)}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <FieldLabel>Notes / transaction ID</FieldLabel>
            <textarea
              placeholder="e.g. TXN-2024-00123…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-[7px] border border-[#e0dfe3] dark:border-border/20 bg-white dark:bg-[#141320] text-[12px] font-mono text-[#1d1c21] dark:text-foreground min-h-[64px] resize-none focus:outline-none focus:border-[#6c5fc7] transition-colors placeholder:text-[#d4d0de]"
            />
          </div>

          <div className="h-px bg-[#f0eef5] dark:bg-border/10" />

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <button
              disabled={isSubmitting}
              onClick={onProcess}
              className="w-full h-9 rounded-[7px] bg-[#3B6D11] text-white text-[10.5px] font-mono font-bold uppercase tracking-[0.07em] hover:bg-[#27500A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              {isPartialPay
                ? "Process partial payment"
                : "Process full payment"}
            </button>
            <button
              disabled={isSubmitting}
              onClick={onDecline}
              className="w-full h-[30px] rounded-[7px] border border-[#E24B4A44] text-[#A32D2D] text-[10px] font-mono font-bold uppercase tracking-[0.07em] bg-transparent hover:bg-[#FCEBEB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Decline requisition
            </button>
          </div>
        </div>
      </CardShell>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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

  const user = useAuthStore((s) => s.user);
  const isDev = process.env.NODE_ENV === "development";

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setRequest(await internalRequestAPI.dataById(id));
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
      <div className="min-h-screen bg-[#f7f6fb] dark:bg-[#0e0c1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={18} className="animate-spin text-[#6c5fc7]" />
          <p className="text-[11px] font-mono text-[#80748d] uppercase tracking-widest">
            Loading…
          </p>
        </div>
      </div>
    );

  if (!request)
    return (
      <div className="min-h-screen bg-[#f7f6fb] dark:bg-[#0e0c1a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <XCircle size={28} className="text-[#A32D2D] mx-auto" />
          <p className="text-[13px] font-mono text-[#1d1c21] dark:text-foreground">
            Requisition not found
          </p>
          <button
            onClick={() => router.push("/internal-requisitions")}
            className="text-[11px] font-mono text-[#6c5fc7] hover:underline"
          >
            ← Back to list
          </button>
        </div>
      </div>
    );

  const totalPaid = request.paymentHistory.reduce(
    (s, p) => s + (p.amount || 0),
    0,
  );
  const amountRemaining = request.amountRemaining;
  const amountToPay =
    manualAmount !== null ? Number(manualAmount) : amountRemaining;
  const isPartialPay = manualAmount !== null;
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
    if (!isDev && user?.department !== "Finance")
      return toast.error("You are not authorized to update this request");
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
        status === "rejected" ? "Request rejected" : "Request processed",
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
    <div className="min-h-screen  dark:bg-[#0e0c1a] font-sans">
      <div className="max-w-screen-xl mx-auto px-2 py-5 space-y-4">
        {/* Nav row */}
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-[#b0adb8]">
            Internal Requisitions{" "}
            <span className="text-[#80748d]">
              / {request.requisitionNumber}
            </span>
          </span>
        </div>

        {/* Hero card */}
        <div className="bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-border/20 rounded-[14px] px-5 py-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-medium text-[#1d1c21] dark:text-foreground tracking-[-0.02em] leading-snug mb-1.5">
                {request.title}
              </h1>
              <p className="text-[11px] font-mono text-[#b0adb8] tracking-wider mb-2">
                {request.requisitionNumber}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge
                  status={request.status}
                  isFullyPaid={isFullyPaid}
                />
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    background: "#EEEDFE",
                    color: "#534AB7",
                    border: "0.5px solid #534AB755",
                  }}
                >
                  {request.category.replace("-", " ")}
                </span>
              </div>
            </div>
            <AmountChips
              total={request.totalAmount}
              paid={totalPaid}
              remaining={amountRemaining}
            />
          </div>
          <PaymentProgress pct={paymentProgress} />
        </div>

        {/* Body */}
        <div
          className={`grid gap-4 ${canProcess ? "lg:grid-cols-[1fr_280px]" : "grid-cols-1"} items-start`}
        >
          <div className="flex flex-col gap-4">
            <ItemsTable request={request} />
            <RequestMeta request={request} />
            {request.attachments.length > 0 && (
              <Attachments attachments={request.attachments} />
            )}
            <PaymentLedger request={request} totalPaid={totalPaid} />
          </div>

          {canProcess && (
            <FinancePanel
              request={request}
              isSubmitting={isSubmitting}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              manualAmount={manualAmount}
              setManualAmount={setManualAmount}
              comment={comment}
              setComment={setComment}
              amountRemaining={amountRemaining}
              isPartialPay={isPartialPay}
              onProcess={() =>
                handleAction(isPartialPay ? "outstanding" : "approved")
              }
              onDecline={() => handleAction("rejected")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
