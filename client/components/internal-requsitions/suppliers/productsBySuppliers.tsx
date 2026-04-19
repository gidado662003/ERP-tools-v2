import React from "react";

import { formatDate } from "@/helper/dateFormat";

function ProductsBySuppliers({ products }: { products: any[] }) {
  const totalAmount = products.reduce((s, p) => s + p.totalCost, 0);
  const totalReceived = products.reduce((s, p) => s + p.receivedQuantity, 0);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400">Total amount</p>
          <p className="text-sm font-medium text-gray-900">
            ₦{totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400">Total received</p>
          <p className="text-sm font-medium text-gray-900">
            {totalReceived.toLocaleString()} units
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {products.map((product, i) => (
          <div
            key={product._id ?? i}
            className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-medium text-blue-600">
              {product.productName.slice(0, 2).toUpperCase()}
            </div>

            <p className="flex-1 truncate text-sm font-medium capitalize text-gray-900">
              {product.productName}
            </p>

            <div className="flex shrink-0 items-center gap-5 text-right">
              <div>
                <p className="text-[11px] text-gray-400">Qty received</p>
                <p className="text-sm font-medium text-gray-900">
                  {product.receivedQuantity.toLocaleString()}
                </p>
              </div>
              <div className="h-6 w-px bg-gray-100" />
              <div>
                <p className="text-[11px] text-gray-400">Total cost</p>
                <p className="text-sm font-medium text-gray-900">
                  ₦{product.totalCost.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Date added</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(product.dateAdded)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsBySuppliers;
