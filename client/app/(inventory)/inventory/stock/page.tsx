export const dynamic = "force-dynamic";
import { inventoryAPI } from "@/lib/inventoryApi";
import { inventoryServerAPI } from "@/lib/inventory/inventoryApi.server";
import StockList from "@/components/inventory/stock/stockList";
export default async function InventoryItemListPage() {
  const inventoryData = await inventoryServerAPI.getInventory();
  return <StockList inventoryData={inventoryData} />;
}
