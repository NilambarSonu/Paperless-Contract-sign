import { Router, type IRouter } from "express";
import { eq, desc, and, like, or } from "drizzle-orm";
import { db, contractsTable, auditLogsTable } from "@workspace/db";
import {
  CreateContractBody,
  GetContractParams,
  DeleteContractParams,
  GenerateSigningLinkParams,
  GenerateSigningLinkBody,
  ListContractsQueryParams,
  DownloadSignedPdfParams,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { sendSigningLinkEmail } from "../lib/email.js";

const router: IRouter = Router();

function getBaseUrl(): string {
  if (process.env["RENDER_EXTERNAL_URL"]) return process.env["RENDER_EXTERNAL_URL"];
  if (process.env["FRONTEND_URL"]) return process.env["FRONTEND_URL"];
  if (process.env["REPLIT_DOMAINS"]) return `https://${process.env["REPLIT_DOMAINS"].split(",")[0]}`;
  return `http://localhost:${process.env["PORT"] ?? 8080}`;
}

function serializeContract(c: typeof contractsTable.$inferSelect) {
  return {
    ...c,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    signedAt: c.signedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

// ── List contracts ──────────────────────────────────────────────────────────
router.get("/contracts", async (req, res): Promise<void> => {
  const parsed = ListContractsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { status, search } = parsed.data;
  let query = db.select().from(contractsTable).$dynamic();
  const conditions = [];

  if (status && status !== "all") conditions.push(eq(contractsTable.status, status));
  if (search) {
    conditions.push(or(
      like(contractsTable.title, `%${search}%`),
      like(contractsTable.signerName, `%${search}%`),
      like(contractsTable.signerEmail, `%${search}%`),
    ));
  }
  if (conditions.length > 0) query = query.where(and(...conditions));

  const contracts = await query.orderBy(desc(contractsTable.createdAt));
  res.json(contracts.map(serializeContract));
});

// ── Create contract ─────────────────────────────────────────────────────────
router.post("/contracts", async (req, res): Promise<void> => {
  const parsed = CreateContractBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { title, signerEmail, signerName, signerCompany, originalFileUrl, customFields, expiresInDays } = parsed.data;

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays ?? 7));

  const [contract] = await db.insert(contractsTable).values({
    title, signerEmail, signerName,
    signerCompany: signerCompany ?? null,
    originalFileUrl: originalFileUrl ?? null,
    customFields: customFields ?? null,
    token, status: "pending", expiresAt,
  }).returning();

  // Log creation
  await db.insert(auditLogsTable).values({
    contractId: contract.id,
    type: "contract_created",
    contractTitle: contract.title,
    signerName: contract.signerName,
    metadata: "{}",
  });

  req.log.info({ contractId: contract.id }, "Contract created");
  res.status(201).json(serializeContract(contract));
});

// ── Get single contract ─────────────────────────────────────────────────────
router.get("/contracts/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetContractParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, params.data.id));
  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }
  res.json(serializeContract(contract));
});

// ── Delete contract ─────────────────────────────────────────────────────────
router.delete("/contracts/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteContractParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [deleted] = await db.delete(contractsTable).where(eq(contractsTable.id, params.data.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Contract not found" }); return; }
  res.sendStatus(204);
});

// ── Generate signing link + email signer ────────────────────────────────────
router.post("/contracts/:id/generate-link", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GenerateSigningLinkParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const body = GenerateSigningLinkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, params.data.id));
  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }

  const expiresInDays = body.data.expiresInDays ?? 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await db.update(contractsTable).set({ expiresAt }).where(eq(contractsTable.id, params.data.id));

  const signingUrl = `${getBaseUrl()}/sign/${contract.token}`;

  // Log link generation
  await db.insert(auditLogsTable).values({
    contractId: contract.id,
    type: "link_generated",
    contractTitle: contract.title,
    signerName: contract.signerName,
    metadata: JSON.stringify({ signingUrl }),
  });

  // Send email to signer (non-blocking — doesn't fail the request)
  sendSigningLinkEmail({
    to: contract.signerEmail,
    signerName: contract.signerName,
    contractTitle: contract.title,
    signingUrl,
    expiresAt: expiresAt.toISOString(),
  }).catch(() => {/* already logged inside */});

  req.log.info({ contractId: contract.id, signingUrl }, "Signing link generated");

  res.json({ signingUrl, token: contract.token, expiresAt: expiresAt.toISOString() });
});

// ── Download signed PDF ─────────────────────────────────────────────────────
router.get("/contracts/:id/download", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DownloadSignedPdfParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, params.data.id));
  if (!contract || !contract.signedPdfUrl) { res.status(404).json({ error: "Signed PDF not available" }); return; }

  res.json({
    downloadUrl: contract.signedPdfUrl,
    filename: `${contract.title.replace(/\s+/g, "_")}_signed.pdf`,
  });
});

export default router;
