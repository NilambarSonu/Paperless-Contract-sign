# Saathi Sign

Premium freelancer contract & e-signature platform for sending contracts, collecting legally-trackable signatures, and generating professional signed PDFs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/saathi-sign run dev` — run the frontend (served via Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, wouter, react-hook-form, react-signature-canvas
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- PDF: pdf-lib (generates signed PDFs with signature, selfie, audit trail)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — DB tables: contracts, settings, auditLogs
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/pdf.ts` — PDF generation with pdf-lib
- `artifacts/saathi-sign/src/pages/` — Frontend pages
- `artifacts/saathi-sign/src/index.css` — Theme (blue #106EBE + mint #0FFCBF)

## Architecture decisions

- Contract-first: OpenAPI spec → codegen → typed hooks used by frontend
- PDFs saved to `artifacts/api-server/uploads/signed-pdfs/` and served statically at `/api/pdfs/`
- Signing links are UUID tokens stored in the contracts table with expiry timestamps
- In production, selfie/signature captured as base64 data URLs and embedded directly in the PDF
- No auth on client signing page — token is the security mechanism

## Product

- **Landing page**: Hero, features grid, how-it-works timeline, stats bar, CTA
- **Dashboard**: Stats cards, contracts table with search/filter, recent activity feed
- **New Contract**: Form to create contract and auto-generate signing link
- **Client Signing Page** (`/sign/:token`): 3-step wizard — selfie capture (webcam), form details, signature pad → generates signed PDF
- **Settings**: Business info, payment details (UPI, PayPal, Wise, bank, GST), notification preferences

## Color Palette

- Primary Blue: `#106EBE`
- Mint Accent: `#0FFCBF`
- Backgrounds: white / very light gray / dark navy for dark areas

## User preferences

- STRICT color palette: only #106EBE, #0FFCBF, white, very light gray — no other colors
- No emojis in the UI

## Gotchas

- `express.json({ limit: "50mb" })` — needed for base64 selfie + signature payloads
- After each OpenAPI spec change, re-run `pnpm --filter @workspace/api-spec run codegen`
- Signed PDFs stored on disk; in production use object storage (S3/Supabase)
- `useGetSigningPage` requires `queryKey` in options or TypeScript will fail

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
