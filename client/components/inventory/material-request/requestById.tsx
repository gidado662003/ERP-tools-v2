"use client";
import React, { useState } from "react";
import {
  MaterialRequest,
  PopulatedMaterialRequest,
} from "@/lib/material-request/material-requestType";
import { materialRequestAPI } from "@/lib/material-request/material-requestApi";
import { Button } from "@/components/ui/button";

// ── Reject Modal
function RejectModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (comment: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-[#e3e3e8] rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a2e]">
            Reject Request
          </h2>
          <p className="text-xs text-[#9999aa] mt-0.5">
            Provide a reason for rejection (optional)
          </p>
        </div>

        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full text-sm px-3 py-2 bg-[#f9f9fc] border border-[#d4d4e0] rounded-md outline-none focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] resize-none placeholder:text-[#c0c0cc] text-[#1a1a2e]"
        />

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm rounded-md border border-[#e3e3e8] text-[#6b6b80] hover:bg-[#f6f6f8] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment)}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component
function RequestById({ data }: { data: PopulatedMaterialRequest }) {
  const [status, setStatus] = useState(data.status);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await materialRequestAPI.approveRequestStatus(data._id);
      setStatus("APPROVED");
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (comment: string) => {
    try {
      setLoading(true);
      await materialRequestAPI.rejectRequestStatus(data._id, comment);
      setStatus("REJECTED");
      setShowRejectModal(false);
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    try {
      setLoading(true);
      await materialRequestAPI.dispatchRequestStatus(data._id);
      setStatus("DISPATCHED");
    } catch (error) {
      console.error("Error dispatching request:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<
    MaterialRequest["status"],
    { label: string; bg: string; text: string; border: string }
  > = {
    PENDING: {
      label: "Pending",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    APPROVED: {
      label: "Approved",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    DISPATCHED: {
      label: "Dispatched",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  const badge = statusConfig[status] ?? statusConfig.PENDING;

  return (
    <>
      {showRejectModal && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
          loading={loading}
        />
      )}

      <div className=" space-y-3 min-h-screen">
        {/* HEADER */}
        <div className="bg-white border border-[#e3e3e8] rounded-lg px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-[#1a1a2e]">
              {data.requestNumber}
            </h1>
            <p className="text-xs text-[#9999aa] mt-0.5">
              Created: {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        </div>

        {(status === "PENDING" || status === "APPROVED") && (
          <div className="bg-white border border-[#e3e3e8] rounded-lg px-5 py-3 flex items-center gap-2.5 flex-wrap">
            {status === "PENDING" && (
              <>
                <Button
                  disabled={loading}
                  onClick={handleApprove}
                  className="px-3.5 py-1.5 rounded-md bg-[#3b5bdb] text-white text-xs font-medium hover:bg-[#3451c7] disabled:opacity-50 transition-colors"
                >
                  Approve
                </Button>
                <Button
                  disabled={loading}
                  onClick={() => setShowRejectModal(true)}
                  className="px-3.5 py-1.5 rounded-md border border-[#e3e3e8] bg-white text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Reject
                </Button>
              </>
            )}

            {status === "APPROVED" && (
              <Button
                disabled={loading}
                onClick={handleDispatch}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                Mark as Dispatched
              </Button>
            )}

            {loading && (
              <span className="text-xs text-[#9999aa] ml-1">Updating...</span>
            )}
          </div>
        )}

        {/* REQUESTED BY */}
        <div className="bg-white border border-[#e3e3e8] rounded-lg px-5 py-4">
          <p className="text-[10px] font-semibold tracking-widest text-[#9999aa] uppercase mb-3">
            Requested By
          </p>
          <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
            <span className="text-[#9999aa] text-xs">Name</span>
            <span className="text-[#1a1a2e] text-xs font-medium">
              {data.requestedBy?.name}
            </span>
            <span className="text-[#9999aa] text-xs">Email</span>
            <span className="text-[#1a1a2e] text-xs">
              {data.requestedBy?.email}
            </span>
          </div>
        </div>

        {/* REASON */}
        <div className="bg-white border border-[#e3e3e8] rounded-lg px-5 py-4">
          <p className="text-[10px] font-semibold tracking-widest text-[#9999aa] uppercase mb-2">
            Reason
          </p>
          <p className="text-xs text-[#3a3a4a] leading-relaxed">
            {data.reason}
          </p>
        </div>

        {/* ITEMS */}
        <div className="bg-white border border-[#e3e3e8] rounded-lg px-5 py-4">
          <p className="text-[10px] font-semibold tracking-widest text-[#9999aa] uppercase mb-3">
            Items
          </p>

          <div className="space-y-2.5">
            {data.items.map((item) => {
              const pct = Math.min(
                100,
                Math.round((item.quantity / item?.inventory?.quantity) * 100),
              );

              return (
                <div
                  key={item.product._id}
                  className="border border-[#e8e8f0] rounded-md p-3.5 bg-[#f9f9fc]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold text-[#1a1a2e]">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-[#9999aa] mt-0.5">
                        Unit: {item.unit} · Location: {item.inventory.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-[#3b5bdb] leading-none">
                        {item.quantity}
                      </p>
                      <p className="text-[10px] text-[#9999aa] mt-0.5">
                        of {item.inventory.quantity} available
                      </p>
                    </div>
                  </div>

                  {/* utilization bar */}
                  <div className="h-1 rounded-full bg-[#e8e8f0] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3b5bdb] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default RequestById;
