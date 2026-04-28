"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { locationApi } from "@/lib/location/locationApi";
import { LocationCategory, LocationType } from "@/lib/location/locationType";

const LOCATION_TYPES: LocationType[] = [
  "STORE",
  "CUSTOMER_SITE",
  "NOC",
  "POP",
  "VENDOR_SITE",
];

const CATEGORY_BY_LOCATION_TYPE: Record<LocationType, LocationCategory> = {
  STORE: "other",
  CUSTOMER_SITE: "cpe",
  NOC: "noc",
  POP: "pop",
  VENDOR_SITE: "other",
};

function CreateLocationForm() {
  const [formData, setFormData] = useState({
    name: "",
    type: "STORE" as LocationType,
    defaultCategory: "other" as LocationCategory,
    address: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryDisplayValue = () => {
    if (formData.type === "STORE" && formData.defaultCategory === "other") {
      return "STORE";
    }
    return formData.defaultCategory.toUpperCase();
  };

  const onChangeField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => {
      if (name === "type") {
        const nextType = value as LocationType;
        return {
          ...prev,
          type: nextType,
          defaultCategory: CATEGORY_BY_LOCATION_TYPE[nextType],
        };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const onClear = () => {
    setFormData({
      name: "",
      type: "STORE",
      defaultCategory: CATEGORY_BY_LOCATION_TYPE.STORE,
      address: "",
      isActive: true,
    });
    setError("");
    setSuccess(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await locationApi.createLocation(formData);
      setSuccess(true);
      onClear();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create location");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white border border-[#e0dfe3] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-6 pt-5">
        <h2 className="text-[15px] font-semibold text-[#1d1c21] tracking-tight">
          Create Location
        </h2>
        <p className="mt-1 text-[13px] text-[#80748d] leading-relaxed">
          Add a structured location and assign the category used for asset updates.
        </p>
        <div className="mt-4 border-t border-[#e0dfe3]" />
      </div>

      <form onSubmit={onSubmit}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fff5f5] border border-[#f8d0d0] rounded-md text-[13px] text-[#c93a3a]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f0faf4] border border-[#c3e8d0] rounded-md text-[13px] text-[#2a7d4f]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Location created successfully.
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#3b3440]">
              Location Name <span className="text-[#f55459] text-[12px]">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Main Store"
              value={formData.name}
              onChange={onChangeField}
              required
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-[#e0dfe3] bg-white px-3 text-[14px] text-[#1d1c21] placeholder:text-[#b0a8bb] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#3b3440]">
                Location Type <span className="text-[#f55459] text-[12px]">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={onChangeField}
                required
                disabled={isSubmitting}
                className="h-9 w-full rounded-md border border-[#e0dfe3] bg-white px-3 text-[14px] text-[#1d1c21] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
              >
                {LOCATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#3b3440]">
                Default Category{" "}
                <span className="text-[#f55459] text-[12px]">*</span>
              </label>
              <input
                value={getCategoryDisplayValue()}
                readOnly
                disabled
                className="h-9 w-full rounded-md border border-[#e0dfe3] bg-[#f6f6f7] px-3 text-[14px] text-[#1d1c21] outline-none disabled:text-[#80748d] disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-[#80748d]">
                Category is auto-set from location type.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#3b3440]">Address</label>
            <textarea
              name="address"
              rows={3}
              placeholder="18, Oluwaleyimu Street, Ikeja"
              value={formData.address}
              onChange={onChangeField}
              disabled={isSubmitting}
              className="w-full resize-y rounded-md border border-[#e0dfe3] bg-white px-3 py-2 text-[14px] text-[#1d1c21] placeholder:text-[#b0a8bb] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/12 disabled:bg-[#f6f6f7] disabled:text-[#80748d] disabled:cursor-not-allowed"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#3b3440]">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onChangeField}
              disabled={isSubmitting}
            />
            Active location
          </label>
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-md bg-[#6c5fc7] text-[13px] font-medium text-white transition-colors hover:bg-[#5c4eb5] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Location"
            )}
          </button>
          <button
            type="button"
            onClick={onClear}
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

export default CreateLocationForm;
