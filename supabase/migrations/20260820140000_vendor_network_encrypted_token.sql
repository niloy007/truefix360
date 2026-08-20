-- Recoverable encrypted share tokens for Vendor Network admin copy/open.
-- Keeps token_hash as the validation mechanism. Existing rows remain valid.

alter table public.vendor_network_links
  add column if not exists encrypted_token text;

comment on column public.vendor_network_links.encrypted_token is
  'AES-256-GCM ciphertext (base64url:iv.ciphertext.tag) for admin-only URL recovery. Null for legacy hash-only links.';
