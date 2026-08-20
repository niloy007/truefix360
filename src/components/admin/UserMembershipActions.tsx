"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { APP_ROLES } from "@/config/platform";
import { humanizeKey } from "@/lib/admin/status";
import {
  cancelInvitationAction,
  changeUserRoleAction,
  removeUserAccessAction,
  resendInvitationAction,
} from "@/lib/admin/user-actions";

type UserMembershipActionsProps = {
  membershipId: string;
  userId: string;
  displayName: string;
  status: string;
  role: string;
  isCurrentUser: boolean;
  canRemove: boolean;
};

export function UserMembershipActions({
  membershipId,
  displayName,
  status,
  role,
  isCurrentUser,
  canRemove,
}: UserMembershipActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"cancel" | "remove" | null>(null);
  const [roleEditor, setRoleEditor] = useState(false);
  const [nextRole, setNextRole] = useState(role);

  function run(action: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setMessage(result.message ?? "Done.");
      setConfirm(null);
      setMenuOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="relative text-sm">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex h-9 items-center border border-line px-3 text-xs font-semibold uppercase tracking-wide"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        Actions
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[12rem] border border-line bg-white py-1 shadow-md"
        >
          {status === "invited" ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left hover:bg-cream"
              onClick={() => run(() => resendInvitationAction(membershipId))}
              disabled={pending}
            >
              Resend Invitation
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left hover:bg-cream"
            onClick={() => {
              setRoleEditor(true);
              setMenuOpen(false);
            }}
          >
            Change Role
          </button>
          {status === "invited" ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-red-700 hover:bg-red-50"
              onClick={() => {
                setConfirm("cancel");
                setMenuOpen(false);
              }}
              disabled={isCurrentUser}
            >
              Cancel Invitation
            </button>
          ) : null}
          {status === "active" ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                setConfirm("remove");
                setMenuOpen(false);
              }}
              disabled={!canRemove || isCurrentUser}
              title={
                isCurrentUser
                  ? "You cannot remove your own account."
                  : !canRemove
                    ? "At least one active administrator must remain."
                    : undefined
              }
            >
              Remove User
            </button>
          ) : null}
        </div>
      ) : null}

      {roleEditor ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 border border-line bg-cream p-2">
          <select
            value={nextRole}
            onChange={(e) => setNextRole(e.target.value)}
            className="input-field h-9 py-0 text-sm"
          >
            {APP_ROLES.map((item) => (
              <option key={item} value={item}>
                {humanizeKey(item)}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || nextRole === role}
            className="h-9 bg-ink px-3 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50"
            onClick={() => {
              const formData = new FormData();
              formData.set("role", nextRole);
              run(() => changeUserRoleAction(membershipId, formData));
              setRoleEditor(false);
            }}
          >
            Save role
          </button>
          <button
            type="button"
            className="h-9 border border-line px-3 text-xs font-semibold uppercase tracking-wide"
            onClick={() => setRoleEditor(false)}
          >
            Cancel
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-2 text-xs text-emerald-800">{message}</p> : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirm === "cancel"}
        title="Remove invited user?"
        body={`This will cancel ${displayName}'s TrueFix360 access and remove the pending membership.`}
        confirmLabel="Remove User"
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => run(() => cancelInvitationAction(membershipId))}
      />
      <ConfirmDialog
        open={confirm === "remove"}
        title={`Remove ${displayName}?`}
        body={`${displayName} will no longer be able to access TrueFix360. Historical business records will remain.`}
        confirmLabel="Remove User"
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => run(() => removeUserAccessAction(membershipId))}
      />
    </div>
  );
}
