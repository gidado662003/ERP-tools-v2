export function getDateRange({ label }: { label: string }) {
  const endDate = new Date();
  let startDate = new Date();

  switch (label) {
    case "7D":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "30D":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "90D":
      startDate.setDate(endDate.getDate() - 90);
      break;
    case "1Y":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case "All":
      startDate = new Date("2000-01-01");
      break;
    default:
      throw new Error("Invalid label");
  }

  return {
    startDate: startDate.toISOString().split("T")[0], // format YYYY-MM-DD
    endDate: endDate.toISOString().split("T")[0],
  };
}
