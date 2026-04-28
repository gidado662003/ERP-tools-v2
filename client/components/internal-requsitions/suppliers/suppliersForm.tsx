"use client";
import React, { useState } from "react";
import { inventoryAPI } from "@/lib/inventoryApi";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function SuppliersForm() {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleClear = () => {
    setSupplier({ name: "", email: "", phone: "", address: "" });
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await inventoryAPI.addSupplier({
        name: supplier.name,
        contactInfo: {
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
        },
      });
      handleClear();
      setSuccess(true);
    } catch (err) {
      console.error("Error adding supplier:", err);
      setError("Failed to add supplier. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white border border-[#e0dfe3] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="px-6 pt-5">
        <h2 className="text-[15px] font-semibold text-[#1d1c21] tracking-tight">
          Add New Supplier
        </h2>
        <p className="mt-1 text-[13px] text-[#80748d] leading-relaxed">
          Enter supplier details to add them to your inventory system.
        </p>
        <div className="mt-4 border-t border-[#e0dfe3]" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fff5f5] border border-[#f8d0d0] rounded-md text-[13px] text-[#c93a3a]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f0faf4] border border-[#c3e8d0] rounded-md text-[13px] text-[#2a7d4f]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Supplier added successfully.
            </div>
          )}

          {/* Supplier Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-[13px] font-medium text-[#3b3440]"
            >
              Supplier Name{" "}
              <span className="text-[#f55459] text-[12px]">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Syscodes Corporation"
              value={supplier.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              autoFocus
              className="h-9 w-full rounded-md border border-[#e0dfe3] bg-white px-3 text-[14px] text-[#1d1c21] placeholder:text-[#b0a8bb] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-medium text-[#3b3440]"
            >
              Email Address{" "}
              <span className="text-[#f55459] text-[12px]">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="contact@gmail.com"
              value={supplier.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-[#e0dfe3] bg-white px-3 text-[14px] text-[#1d1c21] placeholder:text-[#b0a8bb] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-[13px] font-medium text-[#3b3440]"
            >
              Phone Number <span className="text-[#f55459] text-[12px]">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+234 816 789 0000"
              value={supplier.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-[#e0dfe3] bg-white px-3 text-[14px] text-[#1d1c21] placeholder:text-[#b0a8bb] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="address"
              className="text-[13px] font-medium text-[#3b3440]"
            >
              Address <span className="text-[#f55459] text-[12px]">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              placeholder="Ikeja, Lagos..."
              value={supplier.address}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              rows={3}
              className="w-full resize-y rounded-md border border-[#e0dfe3] bg-white px-3 py-2 text-[14px] text-[#1d1c21] placeholder:text-[#b0a8bb] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-md bg-[#6c5fc7] text-[13px] font-medium text-white transition-colors hover:bg-[#5c4eb5] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding Supplier...
              </>
            ) : (
              "Add Supplier"
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="flex-1 h-9 rounded-md border border-[#e0dfe3] bg-white text-[13px] font-medium text-[#3b3440] transition-colors hover:bg-[#f6f6f7] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default SuppliersForm;
