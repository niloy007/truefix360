"use client";

import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/admin/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/format";
import { humanizeKey } from "@/lib/admin/status";
import {
  getVendorNetworkLinkUrlAction,
  regenerateVendorNetworkLinkAction,
  revokeVendorNetworkLinkAction,
} from "@/lib/vendors/actions";
import { shareLinkStatus } from "@/lib/vendors/share-link-status";

export type ShareLinkCardModel = {
  id: string;
  name: string;
  permission: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastAccessedAt: string | null;
  createdByName?: string | null;
  hasEncryptedToken: boolean;
  /** Recovered URL for active encrypted links only; never for network viewers. */
  shareUrl: string | null;
};

export function ShareLinkCard({ link, nowMs }: { link: ShareLinkCardModel; nowMs: number }) {
  const status = shareLinkStatus(link, nowMs);
  const isActive = status === "active";
  const canRecover = isActive && link.hasEncryptedToken;

  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(link.shareUrl);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<"regenerate" | "revoke" | null>(null);

  async function ensureUrl(): Promise<string | null> {
    if (url) return url;
    const result = await getVendorNetworkLinkUrlAction(link.id);
    if (!result.ok || !result.url) {
      setError(result.ok ? "URL unavailable." : result.error);
      return null;
    }
    setUrl(result.url);
    setError(null);
    return result.url;
  }

  function copyLink() {
    startTransition(async () => {
      const value = await ensureUrl();
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        setError("Unable to copy link.");
      }
    });
  }

  function openLink() {
    startTransition(async () => {
      const value = await ensureUrl();
      if (!value) return;
      window.open(value, "_blank", "noopener,noreferrer");
    });
  }

  function onConfirm() {
    if (!confirm) return;
    const action = confirm;
    setConfirm(null);
    startTransition(async () => {
      if (action === "revoke") {
        const result = await revokeVendorNetworkLinkAction(link.id);
        if (!result.ok) setError(result.error);
        return;
      }
      const result = await regenerateVendorNetworkLinkAction(link.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(result.url ?? null);
      setError(null);
      if (result.url) {
        try {
          await navigator.clipboard.writeText(result.url);
          setCopied(true);
        } catch {
          /* ignore */
        }
      }
    });
  }

  return (
    <article className="max-w-full min-w-0 border border-line bg-white p-4">
      <div className="flex max-w-full min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold text-ink">{link.name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {humanizeKey(link.permission)} · Authenticated users only
          </p>
        </div>
        <StatusBadge value={status} />
      </div>

      <div className="mt-4 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Share Link</p>
        {canRecover ? (
          <>
            {url ? (
              <p className="mt-1 break-all text-sm text-ink">{url}</p>
            ) : (
              <p className="mt-1 text-sm text-amber-900">
                Encrypted token is stored, but the share URL could not be recovered. Confirm{" "}
                <code className="text-xs">VENDOR_NETWORK_TOKEN_ENCRYPTION_KEY</code> matches the key
                used when this link was created.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || !canRecover}
                onClick={copyLink}
                className="inline-flex h-9 items-center bg-ink px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {copied ? "Link copied." : "Copy Link"}
              </button>
              <button
                type="button"
                disabled={pending || !canRecover}
                onClick={openLink}
                className="inline-flex h-9 items-center border border-line px-3 text-sm font-semibold disabled:opacity-60"
              >
                Open
              </button>
            </div>
          </>
        ) : isActive && !link.hasEncryptedToken ? (
          <div className="mt-2 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">Share link unavailable for copying</p>
            <p className="mt-1 text-amber-900/90">
              This link was created before reusable link storage was enabled. The original URL still
              works for recipients who have it. Regenerate to create a new copyable link.
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">
            {status === "revoked"
              ? "This link has been revoked. Copy and Open are disabled."
              : status === "expired"
                ? "This link has expired. Copy and Open are disabled."
                : "Share URL is not available."}
          </p>
        )}
      </div>

      <dl className="mt-4 grid gap-1 text-sm text-muted sm:grid-cols-2">
        <div>
          <dt className="inline">Created:</dt>{" "}
          <dd className="inline text-ink">{formatDate(link.createdAt)}</dd>
        </div>
        <div>
          <dt className="inline">Expires:</dt>{" "}
          <dd className="inline text-ink">
            {link.expiresAt ? formatDate(link.expiresAt) : "Never"}
          </dd>
        </div>
        <div>
          <dt className="inline">Last used:</dt>{" "}
          <dd className="inline text-ink">
            {link.lastAccessedAt ? formatDate(link.lastAccessedAt) : "—"}
          </dd>
        </div>
        <div>
          <dt className="inline">Created by:</dt>{" "}
          <dd className="inline text-ink">{link.createdByName || "—"}</dd>
        </div>
      </dl>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex max-w-full flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        {isActive ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirm("regenerate")}
            className="inline-flex h-9 items-center border border-line px-3 text-sm font-semibold hover:border-brand disabled:opacity-60"
          >
            Regenerate Link
          </button>
        ) : (
          <span />
        )}
        {isActive ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirm("revoke")}
            className="inline-flex h-9 items-center border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            Revoke
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirm === "regenerate"}
        title="Regenerate Vendor Network Link?"
        body="The previous URL will stop working immediately. Anyone using the old link will need the new URL."
        confirmLabel="Regenerate Link"
        tone="default"
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={confirm === "revoke"}
        title="Revoke Vendor Network Link?"
        body="Users with this link will immediately lose access."
        confirmLabel="Revoke"
        tone="danger"
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirm}
      />
    </article>
  );
}
