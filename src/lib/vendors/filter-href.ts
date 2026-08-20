export type VendorFilterParams = {
  q?: string;
  state?: string;
  city?: string;
  trade?: string;
  status?: string;
  preferred?: string;
  shared?: string;
  availability?: string;
  tab?: string;
  view?: string;
};

/** Build vendors list URL while preserving active filters and view preference. */
export function buildVendorFilterHref(params: VendorFilterParams) {
  const sp = new URLSearchParams();
  sp.set("tab", params.tab ?? "all");
  for (const [key, value] of Object.entries(params)) {
    if (key === "tab") continue;
    if (value) sp.set(key, value);
  }
  return `/admin/vendors?${sp.toString()}`;
}
