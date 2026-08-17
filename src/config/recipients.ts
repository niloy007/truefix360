const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

export function parseEmailList(value: string | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of value.split(",")) {
    const email = part.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }
  return result;
}

export function parsePhoneList(value: string | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of value.split(",")) {
    const phone = part.trim();
    if (!E164_PATTERN.test(phone) || seen.has(phone)) continue;
    seen.add(phone);
    result.push(phone);
  }
  return result;
}
