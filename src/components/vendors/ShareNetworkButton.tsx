"use client";

import { useState } from "react";
import { ShareNetworkModal } from "@/components/vendors/ShareNetworkModal";

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

export function ShareNetworkButton({ links }: { links: ShareLinkRow[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand"
      >
        Share Vendor Network
      </button>
      <ShareNetworkModal open={open} onClose={() => setOpen(false)} links={links} />
    </>
  );
}
