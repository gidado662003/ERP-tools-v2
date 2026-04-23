import { inventoryAPI } from "@/lib/inventoryApi";
import StockList from "@/components/inventory/stock/stockList";
export default async function InventoryItemListPage() {
  const inventoryData = await inventoryAPI.getInventory();
  return <StockList inventoryData={inventoryData} />;
}
