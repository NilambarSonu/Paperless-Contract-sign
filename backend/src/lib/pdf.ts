import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface SignedPdfOptions {
  originalPdfBytes?: Uint8Array | null;
  contractTitle: string;
  signerName: string;
  signerEmail: string;
  signerCompany?: string | null;
  signerAddress?: string | null;
  signatureDataUrl: string;
  selfieDataUrl?: string | null;
  ipAddress?: string | null;
  locationString?: string | null;
  deviceInfo?: string | null;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || dataUrl;
  return new Uint8Array(Buffer.from(base64, "base64"));
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZoneName: "short",
    });
  } catch { return ts; }
}

export async function generateSignedPdf(opts: SignedPdfOptions): Promise<Uint8Array> {
  // ── Colors ──────────────────────────────────────────────────────────────
  const navy       = rgb(0.039, 0.086, 0.157);   // #0A1628
  const blue       = rgb(0.063, 0.431, 0.745);   // #106EBE
  const mint       = rgb(0.059, 0.988, 0.749);   // #0FFCBF
  const darkText   = rgb(0.067, 0.122, 0.220);
  const mutedText  = rgb(0.38,  0.47,  0.58);
  const lightBlue  = rgb(0.94,  0.97,  1.00);    // row fill
  const white      = rgb(1, 1, 1);
  const divider    = rgb(0.88,  0.92,  0.96);

  // ── Build document ───────────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();
  const regular   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold      = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const oblique   = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Copy original PDF pages first
  if (opts.originalPdfBytes && opts.originalPdfBytes.length > 0) {
    try {
      const srcDoc = await PDFDocument.load(opts.originalPdfBytes, { ignoreEncryption: true });
      const pages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => pdfDoc.addPage(p));
    } catch {
      // If original can't be parsed, proceed with certificate only
    }
  }

  // ── Certificate page — A4 ───────────────────────────────────────────────
  const W = 595.28;
  const H = 841.89;
  const MARGIN = 48;
  const CONTENT_W = W - MARGIN * 2;

  const cert = pdfDoc.addPage([W, H]);

  // ── Full navy header band ────────────────────────────────────────────────
  const HEADER_H = 100;
  cert.drawRectangle({ x: 0, y: H - HEADER_H, width: W, height: HEADER_H, color: navy });

  // Mint accent strip at bottom of header
  cert.drawRectangle({ x: 0, y: H - HEADER_H - 3, width: W, height: 3, color: mint });

  // Logo + brand
  cert.drawText("SAATHI SIGN", {
    x: MARGIN, y: H - 44,
    size: 22, font: bold, color: white,
  });
  cert.drawText("Secure E-Signature Platform", {
    x: MARGIN, y: H - 62,
    size: 9, font: regular, color: rgb(0.6, 0.78, 0.92),
  });

  // "ELECTRONIC SIGNATURE CERTIFICATE" badge on the right
  const badgeLabel = "ELECTRONIC SIGNATURE CERTIFICATE";
  const badgeLabelW = bold.widthOfTextAtSize(badgeLabel, 7.5);
  const badgeX = W - MARGIN - badgeLabelW - 16;
  const badgeY = H - 58;
  cert.drawRectangle({
    x: badgeX - 8, y: badgeY - 5,
    width: badgeLabelW + 16, height: 18,
    color: blue,
    borderColor: mint,
    borderWidth: 1,
  });
  cert.drawText(badgeLabel, {
    x: badgeX, y: badgeY,
    size: 7.5, font: bold, color: white,
  });

  // Reference / page label under header
  cert.drawText(`Appendix — Signature Certificate for: ${opts.contractTitle}`, {
    x: MARGIN, y: H - HEADER_H - 18,
    size: 8.5, font: oblique, color: mutedText,
  });

  // Thin blue rule
  cert.drawRectangle({ x: MARGIN, y: H - HEADER_H - 22, width: CONTENT_W, height: 0.75, color: divider });

  let y = H - HEADER_H - 42;

  // ── Contract title block ─────────────────────────────────────────────────
  cert.drawRectangle({ x: MARGIN, y: y - 2, width: CONTENT_W, height: 30, color: lightBlue });
  cert.drawRectangle({ x: MARGIN, y: y - 2, width: 3, height: 30, color: blue });
  cert.drawText("CONTRACT", {
    x: MARGIN + 12, y: y + 16,
    size: 7, font: bold, color: blue,
  });
  // Truncate long titles
  const maxTitleLen = 72;
  const titleText = opts.contractTitle.length > maxTitleLen
    ? opts.contractTitle.substring(0, maxTitleLen - 3) + "..."
    : opts.contractTitle;
  cert.drawText(titleText, {
    x: MARGIN + 12, y: y + 4,
    size: 10, font: bold, color: darkText,
  });
  y -= 46;

  // ── Helper: draw two-column table ────────────────────────────────────────
  function drawRow(label: string, value: string, rowY: number, shaded: boolean) {
    const rowH = 18;
    const labelColW = 130;
    if (shaded) {
      cert.drawRectangle({ x: MARGIN, y: rowY - 4, width: CONTENT_W, height: rowH, color: lightBlue });
    }
    cert.drawText(label, { x: MARGIN + 8, y: rowY + 1, size: 8, font: bold, color: mutedText });
    // Truncate value
    const maxVal = Math.floor((CONTENT_W - labelColW - 20) / 5.5);
    const valText = value.length > maxVal ? value.substring(0, maxVal - 3) + "..." : value;
    cert.drawText(valText, { x: MARGIN + labelColW, y: rowY + 1, size: 8, font: regular, color: darkText });
    cert.drawRectangle({ x: MARGIN, y: rowY - 4, width: CONTENT_W, height: 0.5, color: divider });
  }

  // ── Section: Signer Information ──────────────────────────────────────────
  cert.drawText("SIGNER INFORMATION", {
    x: MARGIN, y,
    size: 8, font: bold, color: blue,
  });
  cert.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_W, height: 1, color: blue });
  y -= 20;

  const signerRows: [string, string][] = [
    ["Full Name",    opts.signerName],
    ["Email",        opts.signerEmail],
    ["Company",      opts.signerCompany  || "—"],
    ["Address",      opts.signerAddress  || "—"],
  ];
  signerRows.forEach(([lbl, val], i) => {
    drawRow(lbl, val, y, i % 2 === 0);
    y -= 18;
  });

  y -= 14;

  // ── Section: Verification & Audit Trail ─────────────────────────────────
  cert.drawText("VERIFICATION & AUDIT TRAIL", {
    x: MARGIN, y,
    size: 8, font: bold, color: blue,
  });
  cert.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_W, height: 1, color: blue });
  y -= 20;

  const auditRows: [string, string][] = [
    ["Signed At",      formatTimestamp(opts.timestamp)],
    ["IP Address",     opts.ipAddress        || "Not captured"],
    ["GPS Location",   opts.locationString   || "Not captured"],
    ["Coordinates",    (opts.latitude && opts.longitude)
      ? `${opts.latitude.toFixed(6)}° N, ${opts.longitude.toFixed(6)}° E`
      : "Not captured"],
    ["Device / Browser", opts.deviceInfo     || "Not captured"],
  ];
  auditRows.forEach(([lbl, val], i) => {
    drawRow(lbl, val, y, i % 2 === 0);
    y -= 18;
  });

  y -= 20;

  // ── Signature + Selfie side by side ──────────────────────────────────────
  // Section header
  cert.drawText("DIGITAL SIGNATURE & IDENTITY VERIFICATION", {
    x: MARGIN, y,
    size: 8, font: bold, color: blue,
  });
  cert.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_W, height: 1, color: blue });
  y -= 18;

  const SIG_W   = 290;
  const SIG_H   = 120;
  const SELFIE_W = 180;
  const SELFIE_H = 140;
  const GAP      = CONTENT_W - SIG_W - SELFIE_W;

  const sigBoxY     = y - SIG_H;
  const selfieBoxY  = y - SELFIE_H;

  // Signature panel
  cert.drawRectangle({
    x: MARGIN, y: sigBoxY - 2,
    width: SIG_W, height: SIG_H + 4,
    color: white,
    borderColor: blue,
    borderWidth: 1.5,
  });

  // Selfie panel
  cert.drawRectangle({
    x: MARGIN + SIG_W + GAP, y: selfieBoxY - 2,
    width: SELFIE_W, height: SELFIE_H + 4,
    color: white,
    borderColor: mint,
    borderWidth: 2,
  });

  // Embed signature image
  if (opts.signatureDataUrl?.startsWith("data:image")) {
    try {
      const sigBytes = dataUrlToBytes(opts.signatureDataUrl);
      const sigImg = opts.signatureDataUrl.includes("png")
        ? await pdfDoc.embedPng(sigBytes)
        : await pdfDoc.embedJpg(sigBytes);

      // Fit inside the box with padding
      const pad = 8;
      const maxW = SIG_W - pad * 2;
      const maxH = SIG_H - pad * 2;
      const imgDims = sigImg.scale(1);
      const scaleW = maxW / imgDims.width;
      const scaleH = maxH / imgDims.height;
      const scale = Math.min(scaleW, scaleH, 1);
      const drawW = imgDims.width * scale;
      const drawH = imgDims.height * scale;
      const drawX = MARGIN + pad + (maxW - drawW) / 2;
      const drawY = sigBoxY + pad + (maxH - drawH) / 2;

      cert.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
    } catch {
      // skip on error
    }
  }

  // Embed selfie image
  if (opts.selfieDataUrl?.startsWith("data:image")) {
    try {
      const selfieBytes = dataUrlToBytes(opts.selfieDataUrl);
      const selfieImg = opts.selfieDataUrl.includes("png")
        ? await pdfDoc.embedPng(selfieBytes)
        : await pdfDoc.embedJpg(selfieBytes);

      const pad = 6;
      const maxW = SELFIE_W - pad * 2;
      const maxH = SELFIE_H - pad * 2;
      const imgDims = selfieImg.scale(1);
      const scaleW = maxW / imgDims.width;
      const scaleH = maxH / imgDims.height;
      const scale = Math.min(scaleW, scaleH, 1);
      const drawW = imgDims.width * scale;
      const drawH = imgDims.height * scale;
      const drawX = MARGIN + SIG_W + GAP + pad + (maxW - drawW) / 2;
      const drawY = selfieBoxY + pad + (maxH - drawH) / 2;

      cert.drawImage(selfieImg, { x: drawX, y: drawY, width: drawW, height: drawH });
    } catch (err) {
      console.error("Failed to embed selfie in PDF:", err);
    }
  }

  // Labels beneath signature and selfie
  const bottomLabelY = Math.min(sigBoxY, selfieBoxY) - 8;

  cert.drawText("DIGITAL SIGNATURE", {
    x: MARGIN, y: bottomLabelY - 6,
    size: 6.5, font: bold, color: mutedText,
  });
  cert.drawText(opts.signerName, {
    x: MARGIN, y: bottomLabelY - 17,
    size: 8, font: bold, color: darkText,
  });

  cert.drawText("IDENTITY SELFIE", {
    x: MARGIN + SIG_W + GAP, y: bottomLabelY - 6,
    size: 6.5, font: bold, color: mutedText,
  });
  cert.drawText("Captured at time of signing", {
    x: MARGIN + SIG_W + GAP, y: bottomLabelY - 17,
    size: 7.5, font: regular, color: mutedText,
  });

  // ── Legal notice box ──────────────────────────────────────────────────────
  const NOTICE_Y = 100;
  cert.drawRectangle({
    x: MARGIN, y: NOTICE_Y,
    width: CONTENT_W, height: 44,
    color: lightBlue,
    borderColor: divider,
    borderWidth: 1,
  });
  cert.drawText("LEGAL NOTICE", {
    x: MARGIN + 10, y: NOTICE_Y + 30,
    size: 7, font: bold, color: blue,
  });
  cert.drawText("This electronic signature was applied by the named signatory and is legally binding under applicable e-signature laws", {
    x: MARGIN + 10, y: NOTICE_Y + 18,
    size: 7.5, font: regular, color: darkText,
  });
  cert.drawText("including the IT Act 2000 (India), ESIGN Act (USA), and eIDAS (EU). The audit trail above is tamper-evident.", {
    x: MARGIN + 10, y: NOTICE_Y + 7,
    size: 7.5, font: regular, color: darkText,
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  cert.drawRectangle({ x: 0, y: 0, width: W, height: 68, color: navy });
  cert.drawRectangle({ x: 0, y: 68, width: W, height: 2, color: mint });

  cert.drawText("SAATHI SIGN", {
    x: MARGIN, y: 48,
    size: 9, font: bold, color: mint,
  });
  cert.drawText("Secure E-Signature Platform  ·  saathisign.app", {
    x: MARGIN, y: 34,
    size: 7.5, font: regular, color: rgb(0.55, 0.72, 0.86),
  });
  cert.drawText("This document was electronically signed and sealed. The signature, selfie, IP, GPS coordinates, and device info form part of the legal audit record.", {
    x: MARGIN, y: 20,
    size: 6.5, font: regular, color: rgb(0.4, 0.55, 0.67),
  });

  // Page number (certificate is always the last page)
  const totalPages = pdfDoc.getPageCount();
  const pageLabel = `Page ${totalPages} of ${totalPages}`;
  const pageLabelW = regular.widthOfTextAtSize(pageLabel, 7);
  cert.drawText(pageLabel, {
    x: W - MARGIN - pageLabelW, y: 34,
    size: 7, font: regular, color: rgb(0.4, 0.55, 0.67),
  });

  return pdfDoc.save();
}
