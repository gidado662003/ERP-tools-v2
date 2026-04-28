export type MovementType =
  | "ASSIGN"
  | "RETURN"
  | "TRANSFER"
  | "RELOCATE"
  | "MAINTENANCE_OUT"
  | "MAINTENANCE_RETURN"
  | "DISPOSE";

export const MOVEMENT_META: Record<
  MovementType,
  { label: string; description: string; color: string; bg: string }
> = {
  ASSIGN: {
    label: "Assign",
    description: "Assign to an employee or customer",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  RETURN: {
    label: "Return",
    description: "Return asset to store",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  TRANSFER: {
    label: "Transfer",
    description: "Transfer to another holder",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
  },
  RELOCATE: {
    label: "Relocate",
    description: "Move to a different location",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  MAINTENANCE_OUT: {
    label: "Send for Maintenance",
    description: "Send to vendor for maintenance",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
  },
  MAINTENANCE_RETURN: {
    label: "Return from Maintenance",
    description: "Receive back from maintenance",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
  },
  DISPOSE: {
    label: "Dispose",
    description: "Permanently retire this asset",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
};

export const STATUS_COLORS: Record<string, string> = {
  IN_STOCK: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-800 border-amber-200",
  RETIRED: "bg-slate-100 text-slate-600 border-slate-200",
  RETURNED: "bg-teal-100 text-teal-800 border-teal-200",
};

export const allowedHolderTypes: Record<MovementType, string[]> = {
  ASSIGN: ["EMPLOYEE", "CUSTOMER"],
  RETURN: ["STORE"],
  TRANSFER: ["EMPLOYEE", "CUSTOMER"],
  MAINTENANCE_OUT: ["VENDOR"],
  MAINTENANCE_RETURN: ["STORE"],
  RELOCATE: [],
  DISPOSE: [],
};

export function getRemainingStatus(
  movementType: MovementType,
  currentStatus?: string,
) {
  const remainingStatus: Record<MovementType, string> = {
    ASSIGN: "ASSIGNED",
    RETURN: "IN_STOCK",
    TRANSFER: "ASSIGNED",
    MAINTENANCE_OUT: "UNDER_MAINTENANCE",
    MAINTENANCE_RETURN: "IN_STOCK",
    RELOCATE: currentStatus ?? "",
    DISPOSE: "RETIRED",
  };
  return remainingStatus[movementType] ?? "";
}

export function isAllowedMovement(
  type: MovementType,
  assetStatus?: string,
  isAssetRetired?: boolean,
) {
  if (!assetStatus || isAssetRetired) return false;
  switch (type) {
    case "ASSIGN":
      return ["IN_STOCK", "RETURNED"].includes(assetStatus);
    case "RETURN":
      return assetStatus === "ASSIGNED";
    case "TRANSFER":
      return assetStatus === "ASSIGNED";
    case "RELOCATE":
      return assetStatus !== "RETIRED";
    case "MAINTENANCE_OUT":
      return ["IN_STOCK", "ASSIGNED"].includes(assetStatus);
    case "MAINTENANCE_RETURN":
      return assetStatus === "UNDER_MAINTENANCE";
    case "DISPOSE":
      return assetStatus !== "RETIRED";
    default:
      return false;
  }
}
