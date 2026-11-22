const numberFormat = new Intl.NumberFormat("en-US");
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Denver",
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/**
 * "Nov 14, 2026", or "–" for a missing/invalid date. The database returns
 * UTC timestamps without a zone ("2025-08-22 18:47:06"), which `new Date`
 * would read as local time, so mark them as UTC first.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "–";
  const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(value)
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "–" : dateFormat.format(date);
}
