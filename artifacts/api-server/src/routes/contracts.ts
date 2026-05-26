import { Router, type IRouter } from "express";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { db, contractsTable } from "@workspace/db";
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

const router: IRouter = Router();

router.get("/contracts", async (req, res): Promise<void> => {
  const parsed = ListContractsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, search } = parsed.data;

  let query = db.select().from(contractsTable).$dynamic();

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(contractsTable.status, status));
  }
  if (search) {
    conditions.push(
      or(
        like(contractsTable.title, `%${search}%`),
        like(contractsTable.signerName, `%${search}%`),
        like(contractsTable.signerEmail, `%${search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const contracts = await query.orderBy(desc(contractsTable.createdAt));

  const mapped = contracts.map((c) => ({
    ...c,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    signedAt: c.signedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(mapped);
});

router.post("/contracts", async (req, res): Promise<void> => {
  const parsed = CreateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, signerEmail, signerName, signerCompany, originalFileUrl, customFields, expiresInDays } = parsed.data;

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays ?? 7));

  const [contract] = await db
    .insert(contractsTable)
    .values({
      title,
      signerEmail,
      signerName,
      signerCompany: signerCompany ?? null,
      originalFileUrl: originalFileUrl ?? null,
      customFields: customFields ?? null,
      token,
      status: "pending",
      expiresAt,
    })
    .returning();

  req.log.info({ contractId: contract.id }, "Contract created");

  res.status(201).json({
    ...contract,
    expiresAt: contract.expiresAt?.toISOString() ?? null,
    signedAt: contract.signedAt?.toISOString() ?? null,
    createdAt: contract.createdAt.toISOString(),
  });
});

router.get("/contracts/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetContractParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, params.data.id));

  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  res.json({
    ...contract,
    expiresAt: contract.expiresAt?.toISOString() ?? null,
    signedAt: contract.signedAt?.toISOString() ?? null,
    createdAt: contract.createdAt.toISOString(),
  });
});

router.delete("/contracts/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteContractParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(contractsTable)
    .where(eq(contractsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/contracts/:id/generate-link", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GenerateSigningLinkParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = GenerateSigningLinkBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, params.data.id));

  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  const expiresInDays = body.data.expiresInDays ?? 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await db
    .update(contractsTable)
    .set({ expiresAt })
    .where(eq(contractsTable.id, params.data.id));

  const baseUrl = process.env["REPLIT_DOMAINS"]
    ? `https://${process.env["REPLIT_DOMAINS"].split(",")[0]}`
    : `http://localhost:${process.env["PORT"] ?? 3000}`;

  const signingUrl = `${baseUrl}/sign/${contract.token}`;

  req.log.info({ contractId: contract.id, signingUrl }, "Signing link generated");

  res.json({
    signingUrl,
    token: contract.token,
    expiresAt: expiresAt.toISOString(),
  });
});

router.get("/contracts/:id/download", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DownloadSignedPdfParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, params.data.id));

  if (!contract || !contract.signedPdfUrl) {
    res.status(404).json({ error: "Signed PDF not available" });
    return;
  }

  res.json({
    downloadUrl: contract.signedPdfUrl,
    filename: `${contract.title.replace(/\s+/g, "_")}_signed.pdf`,
  });
});

export default router;
