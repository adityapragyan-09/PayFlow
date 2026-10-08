export const DEFAULT_CURRENCY = String(import.meta.env.VITE_DEFAULT_CURRENCY || "INR")
  .trim()
  .toUpperCase();

const LOCALE_BY_CURRENCY = {
  INR: "en-IN",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-IE",
};

export function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  const numeric = Number(amount);
  const value = Number.isFinite(numeric) ? numeric : 0;
  const code = typeof currency === "string" && /^[A-Z]{3}$/.test(currency.trim().toUpperCase())
    ? currency.trim().toUpperCase()
    : DEFAULT_CURRENCY;
  const locale = LOCALE_BY_CURRENCY[code] || "en-IN";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
