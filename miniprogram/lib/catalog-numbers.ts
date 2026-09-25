/** Chilean numeric notation is independent of the interface language. */
export function parseCatalogNumber(
  value: string,
  kind: "price" | "quantity",
): number | undefined | null {
  if (value === "") return undefined;
  const pattern =
    kind === "price"
      ? /^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:\.\d{3})+)$/
      : /^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:\.\d{3})+)(?:,\d{1,3})?$/;
  if (!pattern.test(value)) return null;
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  const maximum = kind === "price" ? 999_999_999_999 : 1_000_000_000_000;
  return Number.isFinite(parsed) && parsed <= maximum ? parsed : null;
}

/** Keep canonical historical precision visible; never silently round stored values. */
export function formatCatalogNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const [coefficient = "", exponentText] = String(value).split("e");
  let decimal = coefficient;
  if (exponentText !== undefined) {
    const negative = coefficient.startsWith("-");
    const unsigned = negative ? coefficient.slice(1) : coefficient;
    const [integer = "", fraction = ""] = unsigned.split(".");
    const digits = integer + fraction;
    const point = integer.length + Number(exponentText);
    decimal =
      (negative ? "-" : "") +
      (point <= 0
        ? `0.${"0".repeat(-point)}${digits}`
        : point >= digits.length
          ? digits + "0".repeat(point - digits.length)
          : `${digits.slice(0, point)}.${digits.slice(point)}`);
  }
  const [whole = "", fraction] = decimal.split(".");
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (fraction ? `,${fraction}` : "");
}

export function parseUnchangedCatalogNumber(
  value: string,
  kind: "price" | "quantity",
  original?: number | null,
) {
  return original != null && value === formatCatalogNumber(original)
    ? original
    : parseCatalogNumber(value, kind);
}
