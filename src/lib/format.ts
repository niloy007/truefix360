export function splitPersonName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim().replace(/\s+/g, " ");
  const index = trimmed.indexOf(" ");
  if (index === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, index),
    lastName: trimmed.slice(index + 1),
  };
}

export function formatReference(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${String(sequence).padStart(6, "0")}`;
}

export function isReferenceFormat(value: string, prefix: string): boolean {
  return new RegExp(`^${prefix}-\\d{4}-\\d{6}$`).test(value);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  return value.trim().replace(/[^\d+]/g, "");
}

export function normalizeZip(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeState(value: string): string {
  return value.trim().toUpperCase();
}

export function summarizeText(value: string, max = 180): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date) + " UTC";
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return "just now";
  if (abs < hour) {
    const n = Math.round(abs / minute);
    return diffMs >= 0 ? `${n} minute${n === 1 ? "" : "s"} ago` : `in ${n} minute${n === 1 ? "" : "s"}`;
  }
  if (abs < day) {
    const n = Math.round(abs / hour);
    return diffMs >= 0 ? `${n} hour${n === 1 ? "" : "s"} ago` : `in ${n} hour${n === 1 ? "" : "s"}`;
  }
  const n = Math.round(abs / day);
  return diffMs >= 0 ? `${n} day${n === 1 ? "" : "s"} ago` : `in ${n} day${n === 1 ? "" : "s"}`;
}

export function utcDayBounds(date = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatPropertyLine(property: {
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
} | null | undefined): string {
  if (!property) return "—";
  const cityState = [property.city, property.state].filter(Boolean).join(", ");
  return [property.address1, cityState, property.zip].filter(Boolean).join(" · ") || "—";
}

export function sanitizeSearchTerm(value: string): string {
  return value.replace(/[%_,()]/g, " ").trim().slice(0, 80);
}

export function hashToken(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}
