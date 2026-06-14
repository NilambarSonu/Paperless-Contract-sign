import nodemailer from "nodemailer";
import { Resend } from "resend";
import { logger } from "./logger.js";

const resend = process.env["RESEND_API_KEY"] ? new Resend(process.env["RESEND_API_KEY"]) : null;

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = parseInt(process.env["SMTP_PORT"] ?? "587", 10);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback: log only (no real sending)
  return null;
}

export interface SendSigningLinkEmailOpts {
  to: string;
  signerName: string;
  contractTitle: string;
  signingUrl: string;
  expiresAt: string;
  fromName?: string;
  fromEmail?: string;
}

export async function sendSigningLinkEmail(opts: SendSigningLinkEmailOpts): Promise<boolean> {
  const transport = createTransport();
  const fromEmail = opts.fromEmail ?? process.env["SMTP_USER"] ?? "noreply@saathisign.app";
  const fromName = opts.fromName ?? "Saathi Sign";

  const expiryDate = new Date(opts.expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(16,110,190,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#106EBE,#0FFCBF);-webkit-background-clip:text;color:#106EBE;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
              SAATHI SIGN
            </div>
            <div style="color:#7BA8C9;font-size:13px;margin-top:6px;">Secure E-Signature Platform</div>
            <div style="height:3px;background:linear-gradient(90deg,#106EBE,#0FFCBF);border-radius:2px;margin-top:20px;"></div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="color:#0A1628;font-size:24px;font-weight:700;margin:0 0 8px;">Document Ready to Sign</p>
            <p style="color:#5A7A9A;font-size:15px;margin:0 0 28px;">Hi ${opts.signerName}, you have a contract waiting for your signature.</p>

            <div style="background:#F0F7FF;border:1px solid #D0E7FF;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <p style="color:#5A7A9A;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Contract</p>
              <p style="color:#0A1628;font-size:18px;font-weight:700;margin:0 0 12px;">${opts.contractTitle}</p>
              <p style="color:#5A7A9A;font-size:13px;margin:0;">Expires: <strong style="color:#106EBE;">${expiryDate}</strong></p>
            </div>

            <p style="color:#5A7A9A;font-size:14px;line-height:1.6;margin:0 0 28px;">
              Click the button below to review and sign your contract. The process takes less than 2 minutes. You will need to allow camera access for identity verification.
            </p>

            <div style="text-align:center;margin-bottom:28px;">
              <a href="${opts.signingUrl}" style="display:inline-block;background:linear-gradient(135deg,#106EBE,#0d5fa3);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">
                Review &amp; Sign Contract →
              </a>
            </div>

            <div style="background:#F8FFF9;border:1px solid #C0F5E0;border-radius:10px;padding:16px 20px;">
              <p style="color:#5A7A9A;font-size:12px;margin:0 0 6px;">Or copy this link:</p>
              <p style="color:#106EBE;font-size:13px;word-break:break-all;margin:0;font-family:monospace;">${opts.signingUrl}</p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E8EEF4;padding:24px 40px;text-align:center;">
            <p style="color:#9BB0C5;font-size:12px;margin:0 0 4px;">This email was sent by Saathi Sign on behalf of the contract sender.</p>
            <p style="color:#9BB0C5;font-size:12px;margin:0;">If you did not expect this, you can safely ignore it.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  if (resend) {
    try {
      // For unverified domains on Resend, you MUST send from "onboarding@resend.dev"
      // If the user hasn't set a custom SMTP_USER, we default to the Resend testing email
      const resendFromEmail = opts.fromEmail || process.env["SMTP_USER"] || "onboarding@resend.dev";
      
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${resendFromEmail}>`,
        to: opts.to,
        subject: `Action Required: Sign "${opts.contractTitle}"`,
        html,
      });
      
      if (error) {
        logger.error({ error, to: opts.to }, "Resend API returned an error");
        return false;
      }
      
      logger.info({ to: opts.to, id: data?.id }, "Signing link email sent via Resend");
      return true;
    } catch (err) {
      logger.error({ err, to: opts.to }, "Failed to send signing link email via Resend");
      return false;
    }
  }

  if (!transport) {
    logger.info(
      { to: opts.to, contractTitle: opts.contractTitle, signingUrl: opts.signingUrl },
      "Email skipped — neither Resend API Key nor SMTP configured. Signing link logged here."
    );
    return false;
  }

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.to,
      subject: `Action Required: Sign "${opts.contractTitle}"`,
      html,
    });
    logger.info({ to: opts.to }, "Signing link email sent via SMTP");
    return true;
  } catch (err) {
    logger.error({ err, to: opts.to }, "Failed to send signing link email via SMTP");
    return false;
  }
}

export interface SendSignedConfirmationOpts {
  to: string;
  signerName: string;
  contractTitle: string;
  signedPdfUrl?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface SendRejectionEmailOpts {
  to: string;
  contractTitle: string;
  rejectorName: string;
  reason: string;
  fromName?: string;
  fromEmail?: string;
}

export async function sendRejectionEmail(opts: SendRejectionEmailOpts): Promise<boolean> {
  const transport = createTransport();
  const fromEmail = opts.fromEmail ?? process.env["SMTP_USER"] ?? "noreply@saathisign.app";
  const fromName = opts.fromName ?? "Saathi Sign";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(16,110,190,0.08);">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <div style="color:#0FFCBF;font-size:22px;font-weight:800;letter-spacing:-0.5px;">SAATHI SIGN</div>
            <div style="color:#7BA8C9;font-size:13px;margin-top:6px;">Secure E-Signature Platform</div>
            <div style="height:3px;background:linear-gradient(90deg,#106EBE,#0FFCBF);border-radius:2px;margin-top:20px;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:60px;height:60px;background:#FFF0F0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">&#10007;</div>
            </div>
            <p style="color:#0A1628;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Contract Rejected</p>
            <p style="color:#5A7A9A;text-align:center;margin:0 0 28px;">Your client has reviewed the contract and requested changes.</p>

            <div style="background:#F0F7FF;border:1px solid #D0E7FF;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
              <p style="color:#5A7A9A;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Contract</p>
              <p style="color:#0A1628;font-size:17px;font-weight:700;margin:0;">${opts.contractTitle}</p>
            </div>

            <div style="background:#F0F7FF;border:1px solid #D0E7FF;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
              <p style="color:#5A7A9A;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Rejected by</p>
              <p style="color:#0A1628;font-size:15px;font-weight:600;margin:0;">${opts.rejectorName}</p>
            </div>

            <div style="background:#FFF8F0;border:1px solid #FFD9A8;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="color:#5A7A9A;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Feedback / Reason</p>
              <p style="color:#0A1628;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">${opts.reason}</p>
            </div>

            <p style="color:#9BB0C5;font-size:13px;line-height:1.6;">Please review the feedback and send a revised contract when ready.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E8EEF4;padding:24px 40px;text-align:center;">
            <p style="color:#9BB0C5;font-size:12px;margin:0;">Sent via Saathi Sign — Secure E-Signature Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  if (resend) {
    try {
      const resendFromEmail = opts.fromEmail || process.env["SMTP_USER"] || "onboarding@resend.dev";
      
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${resendFromEmail}>`,
        to: opts.to,
        subject: `Contract Rejected: "${opts.contractTitle}" — Client Feedback`,
        html,
      });
      
      if (error) {
        logger.error({ error, to: opts.to }, "Resend API returned an error");
        return false;
      }
      
      logger.info({ to: opts.to, id: data?.id }, "Rejection email sent via Resend");
      return true;
    } catch (err) {
      logger.error({ err, to: opts.to }, "Failed to send rejection email via Resend");
      return false;
    }
  }

  if (!transport) {
    logger.info({ to: opts.to, contractTitle: opts.contractTitle, reason: opts.reason }, "Rejection email skipped — neither Resend API Key nor SMTP configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.to,
      subject: `Contract Rejected: "${opts.contractTitle}" — Client Feedback`,
      html,
    });
    logger.info({ to: opts.to }, "Rejection email sent via SMTP");
    return true;
  } catch (err) {
    logger.error({ err, to: opts.to }, "Failed to send rejection email via SMTP");
    return false;
  }
}

export async function sendSignedConfirmationEmail(opts: SendSignedConfirmationOpts): Promise<boolean> {
  const transport = createTransport();
  const fromEmail = opts.fromEmail ?? process.env["SMTP_USER"] ?? "noreply@saathisign.app";
  const fromName = opts.fromName ?? "Saathi Sign";

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <div style="color:#0FFCBF;font-size:22px;font-weight:800;">SAATHI SIGN</div>
            <div style="height:3px;background:linear-gradient(90deg,#106EBE,#0FFCBF);margin-top:20px;border-radius:2px;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:60px;height:60px;background:#E8FFF6;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">&#10003;</div>
            </div>
            <p style="color:#0A1628;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Contract Signed!</p>
            <p style="color:#5A7A9A;text-align:center;margin:0 0 24px;">Hi ${opts.signerName}, your signature has been recorded.</p>
            <p style="color:#0A1628;font-size:16px;font-weight:600;margin:0 0 8px;">${opts.contractTitle}</p>
            ${opts.signedPdfUrl ? `<p style="margin:20px 0;text-align:center;"><a href="${opts.signedPdfUrl}" style="display:inline-block;background:#106EBE;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;">Download Signed PDF</a></p>` : ""}
            <p style="color:#9BB0C5;font-size:13px;">Your signature, selfie, IP address, location, and device info have been recorded as part of the legal audit trail.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  if (resend) {
    try {
      const resendFromEmail = opts.fromEmail || process.env["SMTP_USER"] || "onboarding@resend.dev";
      
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${resendFromEmail}>`,
        to: opts.to,
        subject: `Signed: "${opts.contractTitle}" — Your copy is ready`,
        html,
      });
      
      if (error) {
        logger.error({ error, to: opts.to }, "Resend API returned an error");
        return false;
      }
      
      logger.info({ to: opts.to, id: data?.id }, "Confirmation email sent via Resend");
      return true;
    } catch (err) {
      logger.error({ err, to: opts.to }, "Failed to send confirmation email via Resend");
      return false;
    }
  }

  if (!transport) {
    logger.info({ to: opts.to, contractTitle: opts.contractTitle }, "Confirmation email skipped — neither Resend API Key nor SMTP configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.to,
      subject: `Signed: "${opts.contractTitle}" — Your copy is ready`,
      html,
    });
    logger.info({ to: opts.to }, "Confirmation email sent via SMTP");
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send confirmation email via SMTP");
    return false;
  }
}
