"use client";
import React, { useState } from "react";

function CreateCategoryModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (payload: { name: string; description: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = name.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-[#e3e3e8] rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a2e]">
            Create Category
          </h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#6b6b80]">
              Name <span className="text-[#3b5bdb]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name..."
              className="w-full text-sm px-3 py-2 bg-[#f9f9fc] border border-[#d4d4e0] rounded-md outline-none focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] placeholder:text-[#c0c0cc] text-[#1a1a2e]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#6b6b80]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description..."
              rows={3}
              className="w-full text-sm px-3 py-2 bg-[#f9f9fc] border border-[#d4d4e0] rounded-md outline-none focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] resize-none placeholder:text-[#c0c0cc] text-[#1a1a2e]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm rounded-md border border-[#e3e3e8] text-[#6b6b80] hover:bg-[#f6f6f8] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({ name: name.trim(), description: description.trim() })
            }
            disabled={loading || !canSubmit}
            className="flex-1 px-4 py-2 text-sm rounded-md bg-[#3b5bdb] text-white hover:bg-[#3451c7] disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "Creating..." : "Confirm Creation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCategoryModal;
