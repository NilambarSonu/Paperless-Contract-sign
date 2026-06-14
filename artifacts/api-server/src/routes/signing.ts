import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, contractsTable, auditLogsTable, settingsTable } from "@workspace/db";
import { GetSigningPageParams, SubmitSignatureParams, SubmitSignatureBody } from "@workspace/api-zod";
import { generateSignedPdf } from "../lib/pdf.js";
import { sendSignedConfirmationEmail, sendRejectionEmail } from "../lib/email.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { z } from "zod";

const router: IRouter = Router();

function getBaseUrl(): string {
  return process.env["REPLIT_DOMAINS"]
    ? `https://${process.env["REPLIT_DOMAINS"].split(",")[0]}`
    : `http://localhost:${process.env["PORT"] ?? 8080}`;
}

async function getAuthorEmail(): Promise<string | null> {
  const [settings] = await db.select().from(settingsTable).limit(1);
  if (!settings) return null;
  return settings.notifyEmail || settings.businessEmail || null;
}

router.get("/sign/:token", async (req, res): Promise<void> => {
  const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const params = GetSigningPageParams.safeParse({ token: rawToken });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.token, params.data.token));
  if (!contract) { res.status(404).json({ error: "Invalid signing link" }); return; }

  if (contract.expiresAt && contract.expiresAt < new Date()) {
    await db.update(contractsTable).set({ status: "expired" }).where(eq(contractsTable.id, contract.id));
    res.status(410).json({ error: "This signing link has expired" });
    return;
  }

  if (contract.status === "signed") {
    res.status(400).json({ error: "This contract has already been signed" });
    return;
  }

  if (contract.status === "rejected") {
    res.status(400).json({ error: "This contract has been rejected by the client" });
    return;
  }

  res.json({
    contractId: contract.id,
    title: contract.title,
    signerName: contract.signerName,
    signerEmail: contract.signerEmail,
    signerCompany: contract.signerCompany ?? null,
    originalFileUrl: contract.originalFileUrl ?? null,
    customFields: contract.customFields ?? null,
    expiresAt: contract.expiresAt?.toISOString() ?? null,
  });
});

// ── Reject contract ──────────────────────────────────────────────────────────
const RejectBody = z.object({
  reason: z.string().min(1, "Reason is required").max(2000),
  rejectorName: z.string().optional(),
});

router.post("/sign/:token/reject", async (req, res): Promise<void> => {
  const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

  const body = RejectBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Reason is required" }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.token, rawToken));
  if (!contract) { res.status(404).json({ error: "Invalid signing link" }); return; }

  if (contract.status === "signed") {
    res.status(400).json({ error: "This contract has already been signed" });
    return;
  }
  if (contract.status === "rejected") {
    res.status(400).json({ error: "This contract has already been rejected" });
    return;
  }

  await db.update(contractsTable).set({
    status: "rejected",
    rejectionReason: body.data.reason,
    rejectedAt: new Date(),
  }).where(eq(contractsTable.id, contract.id));

  await db.insert(auditLogsTable).values({
    contractId: contract.id,
    type: "contract_rejected",
    contractTitle: contract.title,
    signerName: body.data.rejectorName ?? contract.signerName,
    metadata: JSON.stringify({ reason: body.data.reason }),
  });

  // Email author
  const authorEmail = await getAuthorEmail();
  if (authorEmail) {
    sendRejectionEmail({
      to: authorEmail,
      contractTitle: contract.title,
      rejectorName: body.data.rejectorName ?? contract.signerName,
      reason: body.data.reason,
    }).catch(() => {});
  }

  req.log.info({ contractId: contract.id }, "Contract rejected");
  res.json({ success: true, message: "Rejection recorded and feedback sent to the author." });
});

// ── Submit signature ─────────────────────────────────────────────────────────
router.post("/sign/:token/submit", async (req, res): Promise<void> => {
  const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const params = SubmitSignatureParams.safeParse({ token: rawToken });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const body = SubmitSignatureBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.token, params.data.token));
  if (!contract) { res.status(404).json({ error: "Invalid signing link" }); return; }

  if (contract.expiresAt && contract.expiresAt < new Date()) {
    res.status(410).json({ error: "This signing link has expired" });
    return;
  }
  if (contract.status === "signed") {
    res.status(400).json({ error: "This contract has already been signed" });
    return;
  }

  const {
    signerName, signerEmail, signerCompany, signerAddress,
    signatureDataUrl, selfieDataUrl, ipAddress,
    latitude, longitude, locationString, deviceInfo, timestamp,
  } = body.data;

  // Generate signed PDF
  let signedPdfUrl: string | null = null;
  try {
    const pdfBytes = await generateSignedPdf({
      contractTitle: contract.title,
      signerName, signerEmail, signerCompany, signerAddress,
      signatureDataUrl, selfieDataUrl, ipAddress,
      latitude, longitude, locationString, deviceInfo,
      timestamp: timestamp || new Date().toISOString(),
    });

    const uploadsDir = join(process.cwd(), "uploads", "signed-pdfs");
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

    const filename = `${contract.token}_signed.pdf`;
    await writeFile(join(uploadsDir, filename), pdfBytes);
    signedPdfUrl = `${getBaseUrl()}/api/pdfs/${filename}`;
  } catch (err) {
    req.log.error({ err }, "Failed to generate signed PDF");
  }

  const signedAt = new Date();

  await db.update(contractsTable).set({
    status: "signed",
    signerName, signerEmail,
    signerCompany: signerCompany ?? null,
    signerAddress: signerAddress ?? null,
    signatureDataUrl,
    selfieUrl: selfieDataUrl ?? null,
    signerIp: ipAddress ?? null,
    signerLocation: locationString ?? null,
    signerDevice: deviceInfo ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    signedAt,
    signedPdfUrl,
  }).where(eq(contractsTable.id, contract.id));

  await db.insert(auditLogsTable).values({
    contractId: contract.id,
    type: "contract_signed",
    contractTitle: contract.title,
    signerName,
    metadata: JSON.stringify({ ipAddress, locationString, deviceInfo, timestamp }),
  });

  // Email signed PDF to signer
  const emailOpts = { signerName, contractTitle: contract.title, signedPdfUrl: signedPdfUrl ?? undefined };
  sendSignedConfirmationEmail({ to: signerEmail, ...emailOpts }).catch(() => {});

  // Email signed PDF to author (from settings)
  const authorEmail = await getAuthorEmail();
  if (authorEmail && authorEmail !== signerEmail) {
    sendSignedConfirmationEmail({
      to: authorEmail,
      signerName: `${signerName} (author copy)`,
      contractTitle: contract.title,
      signedPdfUrl: signedPdfUrl ?? undefined,
    }).catch(() => {});
  }

  req.log.info({ contractId: contract.id, signerEmail }, "Contract signed");
  res.json({
    success: true,
    signedPdfUrl: signedPdfUrl ?? "",
    contractId: contract.id,
    message: "Contract signed successfully.",
  });
});

export default router;
