export function formatCurrency(
  amount: number,
  currency = "NGN",
  locale = "en-NG",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
