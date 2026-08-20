"use client";

import { useState, useTransition } from "react";
import {
  createVendorNetworkLinkAction,
  revokeVendorNetworkLinkAction,
} from "@/lib/vendors/actions";
import { shareLinkStatus } from "@/lib/vendors/share-link-status";

type ShareLinkRow = {
  id: string;
  name: string;
  permission: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastAccessedAt: string | null;
  createdByName?: string | null;
  hasEncryptedToken?: boolean;
  shareUrl?: string | null;
};

export function ShareNetworkModal({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: ShareLinkRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiration, setExpiration] = useState("30");
  const [nowMs] = useState(() => Date.now());

  if (!open) return null;

  function createLink(formData: FormData) {
    setError(null);
    setCreatedUrl(null);
    setCopied(false);
    startTransition(async () => {
      const result = await createVendorNetworkLinkAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCreatedUrl(result.url ?? null);
    });
  }

  function revoke(id: string) {
    startTransition(async () => {
      const result = await revokeVendorNetworkLinkAction(id);
      if (!result.ok) setError(result.error);
      else onClose();
    });
  }

  async function copyUrl() {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-network-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-line bg-white shadow-lg"
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="share-network-title" className="font-heading text-xl font-semibold">
              Share Vendor Network
            </h2>
            <p className="mt-1 text-sm text-muted">
              Generate an authenticated share link. Recipients must sign in to TrueFix360.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-muted hover:text-ink">
            Close
          </button>
        </div>

        <div className="space-y-5 p-5">
          {error ? (
            <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {createdUrl ? (
            <div className="border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">Vendor Network link created.</p>
              <p className="mt-2 break-all text-sm text-ink">{createdUrl}</p>
              <p className="mt-1 text-xs text-muted">
                This link stays available to copy later from the Share Links tab.
              </p>
              <button
                type="button"
                onClick={copyUrl}
                className="mt-3 h-10 bg-ink px-4 text-sm font-semibold text-white"
              >
                {copied ? "Link copied." : "Copy Link"}
              </button>
            </div>
          ) : (
            <form action={createLink} className="grid gap-3">
              <label className="text-sm font-medium">
                Link Name
                <input
                  name="name"
                  required
                  className="input-field mt-1"
                  placeholder="Vendor Sourcing Network"
                />
              </label>
              <label className="text-sm font-medium">
                Permission
                <select name="permission" className="input-field mt-1" defaultValue="viewer">
                  <option value="viewer">Viewer — view only</option>
                  <option value="contributor">Contributor — view + submit</option>
                  <option value="manager">Manager — view + submit</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Expiration
                <select
                  name="expiration"
                  className="input-field mt-1"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="never">Never</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              {expiration === "custom" ? (
                <label className="text-sm font-medium">
                  Custom expiration
                  <input name="customExpiresAt" type="datetime-local" required className="input-field mt-1" />
                </label>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="h-11 bg-brand text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Creating..." : "Create Share Link"}
              </button>
            </form>
          )}

          <div>
            <h3 className="font-heading text-base font-semibold">Existing links</h3>
            <ul className="mt-3 divide-y divide-line border border-line text-sm">
              {links.length === 0 ? (
                <li className="px-3 py-4 text-muted">No share links yet.</li>
              ) : (
                links.map((link) => {
                  const status = shareLinkStatus(link, nowMs);
                  return (
                    <li key={link.id} className="flex flex-wrap items-start justify-between gap-3 px-3 py-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{link.name}</p>
                        <p className="text-muted">
                          {link.permission} · {status}
                          {link.createdByName ? ` · by ${link.createdByName}` : ""}
                        </p>
                        <p className="text-xs text-muted">
                          Created {new Date(link.createdAt).toLocaleDateString()}
                          {link.expiresAt
                            ? ` · Expires ${new Date(link.expiresAt).toLocaleDateString()}`
                            : " · Never expires"}
                          {link.lastAccessedAt
                            ? ` · Last access ${new Date(link.lastAccessedAt).toLocaleDateString()}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Manage Copy / Open / Regenerate from the Share Links tab.
                        </p>
                      </div>
                      {status === "active" ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => revoke(link.id)}
                          className="border border-red-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-700"
                        >
                          Revoke
                        </button>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
