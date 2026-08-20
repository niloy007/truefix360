export function normalizePhone(value: string | null | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeCompanyName(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(llc|inc|corp|co|ltd|pllc|pc)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddress(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|court|ct)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type DuplicateCandidate = {
  organizationId: string;
  companyName: string;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  matchType: "exact_phone" | "exact_email" | "fuzzy_name" | "fuzzy_address";
  strength: "exact" | "fuzzy";
};

export type DuplicateInput = {
  companyName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
};

export type ExistingVendorForMatch = {
  organizationId: string;
  companyName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phoneNormalized?: string | null;
  emailNormalized?: string | null;
};

export function findDuplicateCandidates(
  input: DuplicateInput,
  existing: ExistingVendorForMatch[],
): DuplicateCandidate[] {
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  const company = normalizeCompanyName(input.companyName);
  const address = normalizeAddress(input.address);
  const results: DuplicateCandidate[] = [];
  const seen = new Set<string>();

  const push = (candidate: DuplicateCandidate) => {
    const key = `${candidate.organizationId}:${candidate.matchType}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(candidate);
  };

  for (const row of existing) {
    const rowPhone = row.phoneNormalized || normalizePhone(row.phone);
    const rowEmail = row.emailNormalized || normalizeEmail(row.email);
    const rowCompany = normalizeCompanyName(row.companyName);
    const rowAddress = normalizeAddress(row.address);

    if (phone && rowPhone && phone === rowPhone) {
      push({
        organizationId: row.organizationId,
        companyName: row.companyName,
        city: row.city,
        state: row.state,
        phone: row.phone,
        email: row.email,
        matchType: "exact_phone",
        strength: "exact",
      });
      continue;
    }

    if (email && rowEmail && email === rowEmail) {
      push({
        organizationId: row.organizationId,
        companyName: row.companyName,
        city: row.city,
        state: row.state,
        phone: row.phone,
        email: row.email,
        matchType: "exact_email",
        strength: "exact",
      });
      continue;
    }

    if (company && rowCompany && (company === rowCompany || company.includes(rowCompany) || rowCompany.includes(company))) {
      const sameMarket =
        !input.state ||
        !row.state ||
        input.state.toLowerCase() === String(row.state).toLowerCase();
      if (sameMarket) {
        push({
          organizationId: row.organizationId,
          companyName: row.companyName,
          city: row.city,
          state: row.state,
          phone: row.phone,
          email: row.email,
          matchType: "fuzzy_name",
          strength: "fuzzy",
        });
        continue;
      }
    }

    if (address && rowAddress && address.length >= 8 && rowAddress.includes(address.slice(0, 12))) {
      push({
        organizationId: row.organizationId,
        companyName: row.companyName,
        city: row.city,
        state: row.state,
        phone: row.phone,
        email: row.email,
        matchType: "fuzzy_address",
        strength: "fuzzy",
      });
    }
  }

  return results.sort((a, b) => (a.strength === "exact" ? -1 : 1) - (b.strength === "exact" ? -1 : 1));
}

export function hasExactDuplicate(candidates: DuplicateCandidate[]): boolean {
  return candidates.some((item) => item.strength === "exact");
}
