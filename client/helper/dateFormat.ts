export function formatDate(dateData: Date) {
  const date = new Date(dateData);
  const formatted = date.toLocaleString();
  return formatted;
}
