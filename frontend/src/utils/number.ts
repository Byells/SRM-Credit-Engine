export function normalizeNumberString(input: string | number): string {
  const v = String(input ?? "");
  let t = v.trim();
  if (t === "") return "";
  // If contains both '.' and ',', assume '.' thousands and ',' decimal
  if (t.indexOf(".") !== -1 && t.indexOf(",") !== -1) {
    t = t.replace(/\./g, "").replace(/,/g, ".");
  } else if (t.indexOf(",") !== -1) {
    // assume comma decimal, remove dots
    t = t.replace(/\./g, "").replace(/,/g, ".");
  } else {
    // keep as-is; remove any non-digit except dot
    t = t.replace(/[^0-9.]/g, "");
  }
  // remove any non-digit or dot leftover
  t = t.replace(/[^0-9.]/g, "");
  return t;
}

export function toNumber(input: string | number): number {
  const s = normalizeNumberString(input);
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function formatCurrencyBR(input: string | number): string {
  const n = toNumber(input);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}
