"use client";

import { useState } from "react";
import { inventoryAPI } from "@/lib/inventoryApi";
import SuppliersList, {
  Supplier,
} from "../../internal-requsitions/SuppliersList";
import ProductSelect from "../../inventory/productList";

type FormState = {
  productName: string;
  type: "asset" | "inventory" | "";
  quantity: string;
  unit: string;
  supplier: Supplier | null;
  location: string;
  note: string;
};

const initialState: FormState = {
  productName: "",
  type: "",
  quantity: "",
  unit: "pcs",
  supplier: null,
  location: "",
  note: "",
};

function NewBatch({ onCancel }: { onCancel?: () => void }) {
  const [form, setForm] = useState<FormState>(initialState);
  console.log("🚀 ~ NewBatch ~ form:", form);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string | Supplier | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.productName || !form.type || !form.quantity) {
      setError("Product name, type, and quantity are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await inventoryAPI.createManualBatch({
        productName: form.productName,
        type: form.type,
        quantity: Number(form.quantity),
        unit: form.unit,
        supplier: form.supplier?._id ?? "",
        location: form.location,
        note: form.note,
      });
      setForm(initialState);
      onCancel?.();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-7">
        <div>
          <p className="text-sm font-medium text-foreground">
            New procurement batch
          </p>
          <p className="text-xs text-muted-foreground">
            Manual entry — no requisition required
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col gap-1.5">
          <ProductSelect
            label="Product name"
            placeholder="Search products..."
            onSelect={(product) => set("productName", product?.name ?? "")}
            onChangeValue={(product) => set("productName", product ?? "")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">
            Item type
          </label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          >
            <option value="">Select type...</option>
            <option value="asset">Asset</option>
            <option value="inventory">Stock</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">
            Unit
          </label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
          >
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="litres">litres</option>
            <option value="cartons">cartons</option>
            <option value="boxes">boxes</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">
            Supplier
          </label>
          <SuppliersList
            value={form.supplier}
            onSelect={(supplier) => set("supplier", supplier)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">
            Location
          </label>
          <input
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="e.g. Lagos Office"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-xs text-muted-foreground font-medium">
          Note{" "}
          <span className="font-normal text-muted-foreground/60">
            (optional)
          </span>
        </label>
        <textarea
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-y"
          rows={3}
          placeholder="e.g. Purchased directly from vendor"
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
        />
      </div>

      {error && <p className="text-xs text-destructive mb-4">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
        <button
          className="h-8 px-4 text-xs rounded-md border border-border bg-background hover:bg-muted"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="h-8 px-4 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create batch"}
        </button>
      </div>
    </div>
  );
}

export default NewBatch;
