# TrueFix360 production backend setup

This document is the manual checklist for connecting Supabase, Resend, WhatsApp Cloud API, and Hostinger. The application does not create those accounts for you.

Recommended production URL: `https://truefix360.com`

Do not commit `.env.local`.

## 1. Supabase

1. Create a Supabase project.
2. Apply the SQL in `supabase/migrations/20260817120000_init_platform.sql` (SQL editor or Supabase CLI).
3. Confirm storage buckets exist: `quote-attachments`, `vendor-documents`, `work-order-files` (private).
4. Auth URL configuration (Authentication → URL Configuration):
   - Production Site URL: `https://truefix360.com`
   - Additional Redirect URLs, one per line:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/reset-password`
     - `http://localhost:3000/auth/invite`
     - `https://truefix360.com/auth/callback`
     - `https://truefix360.com/reset-password`
     - `https://truefix360.com/auth/invite`
   - Also add the exact recovery `redirectTo` values if the dashboard uses strict matching (query strings included):
     - `http://localhost:3000/auth/callback?next=/reset-password`
     - `https://truefix360.com/auth/callback?next=/reset-password`
   - Password recovery uses `redirectTo` `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`. Locally that is `http://localhost:3000/auth/callback?next=/reset-password`. In production it is `https://truefix360.com/auth/callback?next=/reset-password`.
   - If `redirectTo` is missing from this allow list, Supabase falls back to the Site URL and the email opens `https://truefix360.com/#access_token=...` instead of the reset-password page.
   - Invitations use `redirectTo` `${NEXT_PUBLIC_SITE_URL}/auth/invite`.
   - Do not add wildcard `*` redirect URLs in production.
5. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable / anon key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY` (server only)
6. Create the first Auth user in the Supabase dashboard (email/password). Do not hard-code that email in source.
7. Assign the user to the internal organization:

```sql
insert into public.organization_memberships (organization_id, user_id, role, status)
values (
  'a0000000-0000-4000-8000-000000000001',
  '<auth user uuid>',
  'admin',
  'active'
);
```

8. Sign in at `/login` and confirm redirect to `/admin`.
9. Invite a test client and a test vendor from `/admin/users`.

Optional development seed (never production):

```bash
npx tsx scripts/seed-dev.ts --confirm
```

## 2. Resend

1. Create a Resend account.
2. Verify a sending domain. Recommended sender:
   `TrueFix360 <notifications@notify.truefix360.com>`
3. A sending subdomain such as `notify.truefix360.com` is configurable through `RESEND_FROM_EMAIL`.
4. Do not change DNS from this repository.
5. Set `RESEND_API_KEY` and keep `EMAIL_NOTIFICATIONS_ENABLED=true`.
6. Office recipients come from `NOTIFICATION_EMAIL_TO` (CSV):
   `office@truefix360.com,support@truefix360.com`

Until the domain is verified, submissions still save. Email deliveries are logged as failed or skipped.

## 3. WhatsApp Cloud API

Manual Meta steps:

1. Meta Business Portfolio
2. WhatsApp Business Account
3. Business phone number
4. Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
5. Access token → `WHATSAPP_ACCESS_TOKEN`
6. Graph version, for example `v21.0`
7. Recipients in E.164, CSV: `WHATSAPP_NOTIFY_TO=+15551234567`
8. Approved utility templates
9. Language code, default `en_US`

Suggested reusable template name: `truefix360_new_submission`

```text
New TrueFix360 {{1}}
Reference: {{2}}
From: {{3}}
Phone: {{4}}
Email: {{5}}
Location: {{6}}
Service/Topic: {{7}}
Priority: {{8}}
Details: {{9}}
Admin: {{10}}
```

Map env vars:

- `WHATSAPP_TEMPLATE_NEW_SUBMISSION`
- `WHATSAPP_TEMPLATE_NEW_SERVICE_REQUEST`
- `WHATSAPP_TEMPLATE_VENDOR_UPDATE`

Leave `WHATSAPP_NOTIFICATIONS_ENABLED=false` until templates are approved. Submissions must not fail if WhatsApp is off.

Never send passwords, reset links, tokens, W-9s, EINs, or insurance documents over WhatsApp.

## 4. Hostinger environment variables

Add every variable from `.env.example` in Hostinger. Production values:

```text
NEXT_PUBLIC_SITE_URL=https://truefix360.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=TrueFix360 <notifications@notify.truefix360.com>
NOTIFICATION_EMAIL_TO=office@truefix360.com,support@truefix360.com
EMAIL_NOTIFICATIONS_ENABLED=true
WHATSAPP_NOTIFICATIONS_ENABLED=false
WHATSAPP_GRAPH_VERSION=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_NOTIFY_TO=
WHATSAPP_TEMPLATE_NEW_SUBMISSION=
WHATSAPP_TEMPLATE_NEW_SERVICE_REQUEST=
WHATSAPP_TEMPLATE_VENDOR_UPDATE=
WHATSAPP_TEMPLATE_LANGUAGE_CODE=en_US
LOGIN_FIRST_USE_ALERTS_ENABLED=true
```

Server-only secrets must not use the `NEXT_PUBLIC_` prefix.

## 5. First-use test

1. Submit Contact, Quote, and Vendor Application on the public site.
2. Confirm reference numbers (`TFC-` / `TFQ-` / `TFV-`).
3. Confirm rows in Admin inboxes.
4. Confirm notification_deliveries rows.
5. Invite a client and vendor; complete first login.
6. Confirm a vendor cannot see client NTE / sell amount.
7. Confirm a client cannot see vendor estimate cost.
