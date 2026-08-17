# Manual security tests

Run these after Supabase is connected. Do not use production data.

## Client A vs Client B

1. Create two client organizations and one user in each.
2. Create a property and service request for Client A.
3. Sign in as Client B.
4. Client B must not see Client A requests, properties, estimates, or files, including by guessing `/portal/client/requests/{id}`.

## Vendor A vs Vendor B

1. Offer a work order to Vendor A only.
2. Sign in as Vendor B.
3. Vendor B must not see Vendor A assignments, estimates, or documents.

## Vendor vs client financials

Vendor work order payloads and `/portal/vendor/assignments/{id}` must not show:

- client NTE
- client sell amount
- internal notes
- markup / margin

## Client vs vendor cost

`/portal/client/estimates/{id}` must show only the client-facing amount and scope. Vendor `amount` must not appear.

## Public

Anonymous visitors cannot read `contact_submissions`, `quote_requests`, or `vendor_applications` through the Supabase anon key. Public writes go through `/api/forms/*` only.

## Unauthenticated

`/admin`, `/portal/client`, and `/portal/vendor` redirect to `/login`.
