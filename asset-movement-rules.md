# Asset Movement Flow Rules

This document defines the rules governing asset movements — which movements are available, what status transitions they trigger, and what validation constraints apply.

---

## Asset Statuses

| Status | Description |
|---|---|
| `IN_STOCK` | Asset is in the warehouse, unassigned and available |
| `ASSIGNED` | Asset is held by an employee or customer |
| `UNDER_MAINTENANCE` | Asset has been sent to a vendor for maintenance |
| `RETURNED` | Asset has been returned and is pending re-stocking |
| `RETIRED` | Asset has been permanently disposed of — no movements possible |

---

## Movement Types

### Assign
Assign an in-stock asset to an employee or customer.

- **Allowed when:** `IN_STOCK` or `RETURNED`
- **New status:** `ASSIGNED`
- **Requires holder:** Yes — Employee or Customer
- **Requires location:** Yes

---

### Return
Return an assigned asset back to the warehouse.

- **Allowed when:** `ASSIGNED`
- **New status:** `IN_STOCK`
- **Requires holder:** Yes — Warehouse
- **Requires location:** Yes

---

### Transfer
Move an assigned asset from one holder to another without returning it to stock first.

- **Allowed when:** `ASSIGNED`
- **New status:** `ASSIGNED` (unchanged)
- **Requires holder:** Yes — Employee or Customer
- **Requires location:** Yes
- **Extra rule:** New holder must differ from the current holder

---

### Relocate
Move an asset to a different physical location without changing its status or holder.

- **Allowed when:** any status except `RETIRED`
- **New status:** unchanged
- **Requires holder:** No
- **Requires location:** Yes — must differ from the current location

---

### Send for Maintenance
Send an asset to a vendor for repair or servicing.

- **Allowed when:** `IN_STOCK` or `ASSIGNED`
- **New status:** `UNDER_MAINTENANCE`
- **Requires holder:** Yes — Vendor
- **Requires location:** Yes

---

### Return from Maintenance
Receive an asset back from a vendor after maintenance is complete.

- **Allowed when:** `UNDER_MAINTENANCE`
- **New status:** `IN_STOCK`
- **Requires holder:** Yes — Warehouse
- **Requires location:** Yes

---

### Dispose
Permanently retire an asset from service. This action is **irreversible**.

- **Allowed when:** any status except `RETIRED`
- **New status:** `RETIRED`
- **Requires holder:** No
- **Requires location:** No
- **Extra rule:** Once disposed, the asset is locked — all movement types are permanently disabled

---

## Availability Matrix

Which movements are selectable based on current asset status:

| Movement | `IN_STOCK` | `ASSIGNED` | `UNDER_MAINTENANCE` | `RETURNED` | `RETIRED` |
|---|:---:|:---:|:---:|:---:|:---:|
| Assign | ✅ | ❌ | ❌ | ✅ | ❌ |
| Return | ❌ | ✅ | ❌ | ❌ | ❌ |
| Transfer | ❌ | ✅ | ❌ | ❌ | ❌ |
| Relocate | ✅ | ✅ | ✅ | ✅ | ❌ |
| Send for Maintenance | ✅ | ✅ | ❌ | ❌ | ❌ |
| Return from Maintenance | ❌ | ❌ | ✅ | ❌ | ❌ |
| Dispose | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## Status Transition Map

```
IN_STOCK ──────────────► ASSIGNED          (Assign)
IN_STOCK ──────────────► UNDER_MAINTENANCE (Send for Maintenance)
IN_STOCK ──────────────► RETIRED           (Dispose)

ASSIGNED ──────────────► IN_STOCK          (Return)
ASSIGNED ──────────────► ASSIGNED          (Transfer)
ASSIGNED ──────────────► UNDER_MAINTENANCE (Send for Maintenance)
ASSIGNED ──────────────► RETIRED           (Dispose)

UNDER_MAINTENANCE ─────► IN_STOCK          (Return from Maintenance)
UNDER_MAINTENANCE ─────► RETIRED           (Dispose)

RETURNED ──────────────► ASSIGNED          (Assign)
RETURNED ──────────────► RETIRED           (Dispose)

ANY (except RETIRED) ──► same status       (Relocate — no status change)
```

---

## Holder Types

| Holder Type | Used by |
|---|---|
| `EMPLOYEE` | Assign, Transfer |
| `CUSTOMER` | Assign, Transfer |
| `VENDOR` | Send for Maintenance |
| `WAREHOUSE` | Return, Return from Maintenance |

---

## Validation Rules Summary

| Rule | Applies to |
|---|---|
| New holder ≠ current holder | Transfer |
| New location ≠ current location | Relocate |
| Location is required | All except Dispose |
| Holder is required | All except Relocate and Dispose |
| Performed By is always required | All |
| Retired assets block all movements | All |
