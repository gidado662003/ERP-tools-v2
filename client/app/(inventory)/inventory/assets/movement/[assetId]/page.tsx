// app/assets/[id]/movements/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inventoryAPI } from "@/lib/inventoryApi";
import { laravelAuthAPI } from "@/lib/laravelAPI";
import EmployeeCombobox from "@/components/employees/EmployeeCombobox";
import LocationSelect from "@/components/inventory/locationList";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeDTO } from "@/lib/inventoryTypes";
import {
  MovementType,
  MOVEMENT_META,
  STATUS_COLORS,
  allowedHolderTypes,
  getRemainingStatus,
  isAllowedMovement,
} from "./movementRules";

// ── Types ────────────────────────────────────────────────────────────────────

type Asset = {
  _id: string;
  serialNumber: string;
  status: string;
  location: string;
  condition: string;
  ownership: string;
  product: { _id: string; name: string; category: string };
  holder?: { _id: string; name: string };
  holderType?: string;
};

type Vendor = {
  _id: string;
  name: string;
  contactInfo: { email: string; phone: string; address: string };
};

type Customer = {
  id: number | string;
  clients: string;
  address?: string;
  customer_email?: string;
  [key: string]: unknown;
};

type HolderType = "EMPLOYEE" | "CUSTOMER" | "VENDOR" | "STORE";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      {msg}
    </p>
  );
}

export default function NewMovementPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.assetId as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [formData, setFormData] = useState({
    type: "" as MovementType | "",
    toStatus: "",
    toLocation: "",
    toLocationId: "",
    toHolderType: "",

    toHolderId: "",

    toHolderSnapshot: { id: "", name: "", email: "" },
    reason: "",
    performedAt: new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchAssetData() {
      try {
        const data = await inventoryAPI.getAssetMovementsData(assetId);
        setAsset(data.asset);
        setVendors(data.vendors ?? []);
      } catch {
        toast.error("Failed to load asset data");
      } finally {
        setLoading(false);
      }
    }
    fetchAssetData();
  }, [assetId]);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data: EmployeeDTO[] =
          await laravelAuthAPI.getEmployees(employeeSearch);
        setEmployees(data);
      } catch {
        toast.error("Failed to load employees");
      }
    }
    fetchEmployees();
  }, [employeeSearch]);

  // (Laravel)
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const data: Customer[] =
          await laravelAuthAPI.getCustomers(customerSearch);
        setCustomers(data);
      } catch {
        toast.error("Failed to load customers");
      }
    }
    fetchCustomers();
  }, [customerSearch]);

  const isAssetRetired = asset?.status === "RETIRED";

  const holderTypesForSelected = formData.type
    ? (allowedHolderTypes[formData.type as MovementType] ?? [])
    : [];

  const holdersForType = (): Array<{
    id: string;
    name: string;
    sub?: string;
    address?: string;
  }> => {
    switch (formData.toHolderType as HolderType) {
      case "CUSTOMER":
        return customers.map((c) => ({
          id: String(c.id),
          name: c.clients,
          sub: c.customer_email,
          address: typeof c.address === "string" ? c.address : "",
        }));
      case "VENDOR":
        return vendors.map((v) => ({
          id: v._id,
          name: v.name,
        }));
      case "STORE":
        return [{ id: "store-1", name: "Main Store" }];
      default:
        return [];
    }
  };

  const needsHolder =
    formData.type && !["RELOCATE", "DISPOSE"].includes(formData.type);
  const needsLocation = formData.type && formData.type !== "DISPOSE";

  // ── Reset dependent fields when type changes ───────────────────────────────

  useEffect(() => {
    if (!formData.type) return;
    setFormData((prev) => ({
      ...prev,
      toStatus: getRemainingStatus(
        formData.type as MovementType,
        asset?.status,
      ),
      toHolderType: "",
      toHolderId: "",
      toHolderSnapshot: { id: "", name: "", email: "" },
      toLocationId: "",
      toLocation: formData.type === "RELOCATE" ? prev.toLocation : "",
    }));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.type) e.type = "Movement type is required";
    if (isAssetRetired) e.general = "Cannot move a retired asset";

    if (formData.type === "RELOCATE") {
      if (!formData.toLocation && !formData.toLocationId)
        e.toLocation = "Location is required";
      else if (formData.toLocation === asset?.location)
        e.toLocation = "Must differ from current location";
    }
    if (needsHolder) {
      if (!formData.toHolderType) e.toHolderType = "Holder type is required";
      if (!formData.toHolderId) {
        e.toHolderId = "Holder is required";
      }
    }
    if (needsLocation && !formData.toLocation && !formData.toLocationId) {
      e.toLocation = "Location is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        asset: assetId,
        type: formData.type,
        ...(formData.toStatus && { toStatus: formData.toStatus }),
        ...(formData.toHolderType && { toHolderType: formData.toHolderType }),
        ...(formData.toHolderId && {
          toHolderId: formData.toHolderId,
          toHolderSnapshot: formData.toHolderSnapshot,
        }),
        ...(formData.toLocation && { toLocation: formData.toLocation }),
        ...(formData.toLocationId && { toLocationId: formData.toLocationId }),
        ...(formData.reason && { reason: formData.reason }),
        ...(formData.performedAt && { performedAt: formData.performedAt }),
      };
      await inventoryAPI.createMovement(payload);
      toast.success("Movement recorded successfully");
      router.push(`/inventory/assets/${assetId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(
        axiosErr?.response?.data?.error ?? "Failed to record movement",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Generic field setter for simple string fields
  const set = (field: string) => (val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading asset data…</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500">Asset not found.</p>
      </div>
    );
  }

  const selectedMeta = formData.type
    ? MOVEMENT_META[formData.type as MovementType]
    : null;

  return (
    <div>
      <div className="mx-auto px-2 py-2 space-y-6">
        {/* ── Page title ── */}
        <div className="flex items-start gap-4">
          <div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {asset.product?.name}
            </p>
          </div>
        </div>

        {/* ── Asset context strip ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Asset State
            </p>
          </div>
          <div className="px-4 py-3 grid grid-cols-3 divide-x divide-slate-100">
            <div className="pr-4 flex items-start gap-2">
              <Package className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Serial Number</p>
                <p className="text-sm font-semibold text-slate-800 font-mono">
                  {asset.serialNumber}
                </p>
              </div>
            </div>
            <div className="px-4 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Location</p>
                <p className="text-sm font-semibold text-slate-800">
                  {asset.location || "—"}
                </p>
              </div>
            </div>
            <div className="pl-4 flex items-start gap-2">
              <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <StatusBadge status={asset.status} />
              </div>
            </div>
          </div>
          {asset.holder?.name && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500">
              Current holder:{" "}
              <span className="font-medium text-slate-700">
                {asset.holder.name}
              </span>
              {asset.holderType && (
                <span className="ml-1 text-slate-400">
                  ({asset.holderType.toLowerCase()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Retired warning ── */}
        {isAssetRetired && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            This asset is <strong>RETIRED</strong> and cannot be moved.
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Movement type grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Movement Type <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select the type of movement to record
              </p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {(Object.keys(MOVEMENT_META) as MovementType[]).map((type) => {
                const meta = MOVEMENT_META[type];
                const allowed = isAllowedMovement(
                  type,
                  asset?.status,
                  isAssetRetired,
                );
                const selected = formData.type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={!allowed || submitting}
                    onClick={() => set("type")(type)}
                    className={`
                      text-left px-3.5 py-3 rounded-lg border transition-all text-sm
                      ${selected ? `${meta.bg} ${meta.color} border-current ring-1 ring-current/20 font-medium` : ""}
                      ${!selected && allowed ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700" : ""}
                      ${!allowed ? "opacity-35 cursor-not-allowed border-slate-100 text-slate-400" : ""}
                    `}
                  >
                    <div className="font-medium leading-tight">
                      {meta.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${selected ? "opacity-80" : "text-slate-400"}`}
                    >
                      {meta.description}
                    </div>
                  </button>
                );
              })}
            </div>
            <FieldError msg={errors.type} />
          </div>

          {/* Details card — shown once type selected */}
          {formData.type && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div
                className={`px-5 py-3 border-b flex items-center gap-2 ${selectedMeta?.bg}`}
              >
                <CheckCircle2 className={`h-4 w-4 ${selectedMeta?.color}`} />
                <span
                  className={`text-sm font-semibold ${selectedMeta?.color}`}
                >
                  {selectedMeta?.label}
                </span>
                {formData.toStatus && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <StatusBadge status={formData.toStatus} />
                  </>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Movement time */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.performedAt}
                      onChange={(e) => set("performedAt")(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Location */}
                {needsLocation && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {formData.type === "RELOCATE"
                        ? "New Location"
                        : "Location"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {formData.toHolderType === "CUSTOMER" ? (
                      <Input
                        value={formData.toLocation}
                        placeholder={"Customer address will appear here"}
                        disabled
                        className={errors.toLocation ? "border-red-400" : ""}
                      />
                    ) : (
                      <div className="space-y-1.5">
                        <LocationSelect
                          label=""
                          placeholder={
                            formData.type === "RELOCATE"
                              ? `Current: ${asset.location}`
                              : "Search locations..."
                          }
                          allowedTypes={
                            formData.toHolderType === "STORE"
                              ? ["STORE"]
                              : formData.toHolderType === "VENDOR"
                                ? ["VENDOR_SITE"]
                                : undefined
                          }
                          onSelect={(location) => {
                            setFormData((prev) => ({
                              ...prev,
                              toLocationId: location?._id ?? "",
                              toLocation: location?.name ?? "",
                            }));
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.toLocation;
                              return n;
                            });
                          }}
                          disabled={submitting}
                        />
                        <Link
                          href="/inventory/locations/create"
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Create new location
                        </Link>
                      </div>
                    )}
                    <FieldError msg={errors.toLocation} />
                  </div>
                )}

                {/* Holder type + holder */}
                {needsHolder && holderTypesForSelected.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Holder Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.toHolderType}
                        onValueChange={(v) => {
                          setFormData((prev) => ({
                            ...prev,
                            toHolderType: v,
                            toHolderId: "",
                            toLocationId: "",
                            toLocation: "",
                            toHolderSnapshot: { id: "", name: "", email: "" },
                          }));
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.toHolderType;
                            return n;
                          });
                        }}
                        disabled={submitting}
                      >
                        <SelectTrigger
                          className={
                            errors.toHolderType ? "border-red-400" : ""
                          }
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {holderTypesForSelected.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t.charAt(0) + t.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError msg={errors.toHolderType} />
                    </div>

                    {formData.toHolderType && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Holder <span className="text-red-500">*</span>
                        </label>

                        {/* ── Employee → combobox ── */}
                        {formData.toHolderType === "EMPLOYEE" ? (
                          <EmployeeCombobox
                            employees={employees}
                            value={
                              employees.find(
                                (emp) => String(emp.id) === formData.toHolderId,
                              ) ?? null
                            }
                            onSelect={(emp) => {
                              setFormData((prev) => ({
                                ...prev,
                                toHolderId: String(emp.id),
                                toHolderSnapshot: {
                                  id: String(emp.id),
                                  name: emp.name,
                                  email: "",
                                },
                              }));
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.toHolderId;
                                return n;
                              });
                            }}
                            onSearch={setEmployeeSearch}
                            disabled={submitting}
                            hasError={!!errors.toHolderId}
                          />
                        ) : (
                          /* ── All other holder types → select ── */
                          <Select
                            value={formData.toHolderId}
                            onValueChange={(v) => {
                              const selected = holdersForType().find(
                                (h) => h.id === v,
                              );
                              setFormData((prev) => ({
                                ...prev,
                                toHolderId: v,
                                toHolderSnapshot: {
                                  id: v,
                                  name: selected?.name ?? "",
                                  email: selected?.sub ?? "",
                                },
                                toLocation:
                                  formData.toHolderType === "CUSTOMER"
                                    ? (selected?.address ?? "")
                                    : prev.toLocation,
                                toLocationId: "",
                              }));
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.toHolderId;
                                if (formData.toHolderType === "CUSTOMER") {
                                  delete n.toLocation;
                                }
                                return n;
                              });
                            }}
                            disabled={submitting}
                          >
                            <SelectTrigger
                              className={
                                errors.toHolderId ? "border-red-400" : ""
                              }
                            >
                              <SelectValue
                                placeholder={`Select ${formData.toHolderType.toLowerCase()}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {holdersForType().map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                  {item.sub && (
                                    <span className="text-slate-400 text-xs ml-1">
                                      {item.sub}
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        <FieldError msg={errors.toHolderId} />
                      </div>
                    )}
                  </div>
                )}

                {/* Dispose warning */}
                {formData.type === "DISPOSE" && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      This will permanently <strong>retire</strong> the asset.
                      No further movements will be possible.
                    </p>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Reason / Notes
                  </label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => set("reason")(e.target.value)}
                    placeholder="Add context or notes about this movement…"
                    rows={3}
                    disabled={submitting}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* General errors */}
          {errors.general && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="outline"
              type="button"
              asChild
              disabled={submitting}
            >
              <Link href={`/assets/${assetId}`}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isAssetRetired || !formData.type || submitting}
              className="min-w-[160px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording…
                </>
              ) : (
                "Record Movement"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
