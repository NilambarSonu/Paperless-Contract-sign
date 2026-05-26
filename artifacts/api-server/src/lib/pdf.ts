import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

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
  const binary = Buffer.from(base64, "base64");
  return new Uint8Array(binary);
}

export async function generateSignedPdf(opts: SignedPdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryBlue = rgb(0.063, 0.431, 0.745);
  const mintGreen = rgb(0.059, 0.988, 0.749);
  const darkText = rgb(0.067, 0.122, 0.22);
  const mutedText = rgb(0.35, 0.42, 0.52);
  const white = rgb(1, 1, 1);
  const lightBg = rgb(0.94, 0.97, 0.99);

  // If original PDF bytes are provided, embed them
  if (opts.originalPdfBytes && opts.originalPdfBytes.length > 0) {
    try {
      const originalDoc = await PDFDocument.load(opts.originalPdfBytes);
      const copiedPages = await pdfDoc.copyPages(originalDoc, originalDoc.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    } catch {
      // If can't load original, just create signature page
    }
  }

  // ---- Signature & Audit Page ----
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Header gradient bar
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: primaryBlue });
  page.drawRectangle({ x: 0, y: height - 84, width, height: 4, color: mintGreen });

  // Logo area
  page.drawText("SAATHI SIGN", {
    x: 36,
    y: height - 50,
    size: 18,
    font: helveticaBold,
    color: white,
  });
  page.drawText("E-Signature Certificate", {
    x: 36,
    y: height - 68,
    size: 10,
    font: helveticaFont,
    color: rgb(0.8, 0.95, 1),
  });

  // Contract title section
  page.drawRectangle({ x: 0, y: height - 130, width, height: 46, color: lightBg });
  page.drawText("CONTRACT SIGNED SUCCESSFULLY", {
    x: 36,
    y: height - 107,
    size: 9,
    font: helveticaBold,
    color: primaryBlue,
  });
  page.drawText(opts.contractTitle, {
    x: 36,
    y: height - 122,
    size: 14,
    font: helveticaBold,
    color: darkText,
  });

  let y = height - 160;

  // Signer Details
  page.drawText("SIGNER INFORMATION", {
    x: 36,
    y,
    size: 8,
    font: helveticaBold,
    color: primaryBlue,
  });
  y -= 4;
  page.drawRectangle({ x: 36, y, width: width - 72, height: 1, color: primaryBlue });
  y -= 18;

  const infoRows = [
    ["Full Name", opts.signerName],
    ["Email", opts.signerEmail],
    ["Company", opts.signerCompany || "—"],
    ["Address", opts.signerAddress || "—"],
  ];

  for (const [label, value] of infoRows) {
    page.drawText(label + ":", { x: 36, y, size: 9, font: helveticaBold, color: mutedText });
    page.drawText(value, { x: 160, y, size: 9, font: helveticaFont, color: darkText });
    y -= 16;
  }

  y -= 12;

  // Verification Details
  page.drawText("VERIFICATION & AUDIT TRAIL", {
    x: 36,
    y,
    size: 8,
    font: helveticaBold,
    color: primaryBlue,
  });
  y -= 4;
  page.drawRectangle({ x: 36, y, width: width - 72, height: 1, color: primaryBlue });
  y -= 18;

  const auditRows = [
    ["Signed At", opts.timestamp],
    ["IP Address", opts.ipAddress || "Not captured"],
    ["Location", opts.locationString || "Not captured"],
    ["Coordinates", opts.latitude && opts.longitude ? `${opts.latitude.toFixed(4)}, ${opts.longitude.toFixed(4)}` : "Not captured"],
    ["Device/Browser", opts.deviceInfo || "Not captured"],
  ];

  for (const [label, value] of auditRows) {
    page.drawText(label + ":", { x: 36, y, size: 9, font: helveticaBold, color: mutedText });
    const truncated = value.length > 70 ? value.substring(0, 67) + "..." : value;
    page.drawText(truncated, { x: 160, y, size: 9, font: helveticaFont, color: darkText });
    y -= 16;
  }

  y -= 16;

  // Signature image
  if (opts.signatureDataUrl && opts.signatureDataUrl.startsWith("data:image")) {
    try {
      const sigBytes = dataUrlToBytes(opts.signatureDataUrl);
      const sigImage = opts.signatureDataUrl.includes("png")
        ? await pdfDoc.embedPng(sigBytes)
        : await pdfDoc.embedJpg(sigBytes);

      const sigBoxWidth = 240;
      const sigBoxHeight = 90;
      const sigX = 36;
      const sigY = y - sigBoxHeight - 10;

      page.drawRectangle({
        x: sigX - 4,
        y: sigY - 4,
        width: sigBoxWidth + 8,
        height: sigBoxHeight + 8,
        color: lightBg,
        borderColor: primaryBlue,
        borderWidth: 1,
      });

      page.drawImage(sigImage, { x: sigX, y: sigY, width: sigBoxWidth, height: sigBoxHeight });

      page.drawText("DIGITAL SIGNATURE", {
        x: sigX,
        y: sigY - 14,
        size: 7,
        font: helveticaBold,
        color: mutedText,
      });
      page.drawText(opts.signerName, {
        x: sigX,
        y: sigY - 24,
        size: 8,
        font: helveticaFont,
        color: darkText,
      });

      // Selfie
      if (opts.selfieDataUrl && opts.selfieDataUrl.startsWith("data:image")) {
        try {
          const selfieBytes = dataUrlToBytes(opts.selfieDataUrl);
          const selfieImage = opts.selfieDataUrl.includes("png")
            ? await pdfDoc.embedPng(selfieBytes)
            : await pdfDoc.embedJpg(selfieBytes);

          const selfieX = sigX + sigBoxWidth + 30;
          const selfieW = 100;
          const selfieH = sigBoxHeight;

          page.drawRectangle({
            x: selfieX - 4,
            y: sigY - 4,
            width: selfieW + 8,
            height: selfieH + 8,
            color: lightBg,
            borderColor: mintGreen,
            borderWidth: 2,
          });

          page.drawImage(selfieImage, { x: selfieX, y: sigY, width: selfieW, height: selfieH });
          page.drawText("IDENTITY SELFIE", {
            x: selfieX,
            y: sigY - 14,
            size: 7,
            font: helveticaBold,
            color: mutedText,
          });
        } catch {
          // skip selfie embed error
        }
      }

      y = sigY - 50;
    } catch {
      // skip signature embed error
    }
  }

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 60, color: rgb(0.04, 0.12, 0.22) });
  page.drawRectangle({ x: 0, y: 60, width, height: 2, color: mintGreen });
  page.drawText("This document has been electronically signed via Saathi Sign.", {
    x: 36,
    y: 40,
    size: 8,
    font: helveticaFont,
    color: rgb(0.7, 0.85, 0.95),
  });
  page.drawText("The signature, selfie, IP address, location, and device info are recorded as part of the legal audit trail.", {
    x: 36,
    y: 26,
    size: 7,
    font: helveticaFont,
    color: rgb(0.5, 0.65, 0.75),
  });
  page.drawText("saathisign.app", {
    x: 36,
    y: 12,
    size: 7,
    font: helveticaBold,
    color: mintGreen,
  });

  return pdfDoc.save();
}
