export type SalesRangeKey = "day" | "last_7" | "last_30" | "month";

function parseDate(date: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("invalid_date");
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("invalid_date");
  }
  return parsed;
}

export function shiftDate(date: string, days: number): string {
  const parsed = parseDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function resolveSalesRange(
  anchor: string,
  range: SalesRangeKey,
): { from: string; to: string } {
  const parsed = parseDate(anchor);
  if (range === "day") return { from: anchor, to: anchor };
  if (range === "last_7") return { from: shiftDate(anchor, -6), to: anchor };
  if (range === "last_30") return { from: shiftDate(anchor, -29), to: anchor };
  return {
    from: `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-01`,
    to: anchor,
  };
}
