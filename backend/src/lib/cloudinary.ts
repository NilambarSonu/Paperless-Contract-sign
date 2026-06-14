/**
 * Cloudinary upload utility
 * Used to store contract PDFs and signed PDFs permanently in the cloud.
 * Replaces local disk storage (which is ephemeral on Render).
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const CLOUDINARY_CLOUD_NAME = process.env["CLOUDINARY_CLOUD_NAME"];
const CLOUDINARY_API_KEY = process.env["CLOUDINARY_API_KEY"];
const CLOUDINARY_API_SECRET = process.env["CLOUDINARY_API_SECRET"];

export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

/**
 * Upload a buffer (PDF or image) to Cloudinary.
 * Returns the secure URL of the uploaded file.
 *
 * @param buffer  - File contents as Buffer or Uint8Array
 * @param filename - Public ID to use in Cloudinary (without extension)
 * @param folder  - Cloudinary folder name (e.g. "contracts", "signed-pdfs")
 * @param resourceType - "raw" for PDFs, "image" for images
 */
export async function uploadToCloudinary(
  buffer: Buffer | Uint8Array,
  filename: string,
  folder: "contracts" | "signed-pdfs" | "selfies",
  resourceType: "raw" | "image" = "raw",
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `saathi-sign/${folder}/${filename}`;

  // Build signature string (sorted params, no url/resource_type)
  const paramsToSign = `folder=saathi-sign/${folder}&public_id=${filename}&timestamp=${timestamp}`;

  // Use native Web Crypto for HMAC-SHA1 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(CLOUDINARY_API_SECRET);
  const messageData = encoder.encode(paramsToSign);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const signature = Buffer.from(signatureBuffer).toString("hex");

  // Build multipart form data
  const formData = new FormData();
  formData.append("file", new Blob([buffer as any], { type: resourceType === "raw" ? "application/pdf" : "image/png" }), filename);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", `saathi-sign/${folder}`);
  formData.append("public_id", filename);
  formData.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json() as { secure_url: string };
  return result.secure_url;
}
