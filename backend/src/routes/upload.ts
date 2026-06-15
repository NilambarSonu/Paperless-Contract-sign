import { Router, type IRouter } from "express";
import multer from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import { uploadToCloudinary, isCloudinaryConfigured } from "../lib/cloudinary.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const router: IRouter = Router();

// Fallback: local disk storage for development (Cloudinary not configured)
const uploadsDir = join(process.cwd(), "uploads", "contracts");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage so we can stream to Cloudinary in production
// Fall back to disk in dev
const storage = isCloudinaryConfigured()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, `${randomUUID()}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".doc"];
    const ext = extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

function getBaseUrl(): string {
  if (process.env["BACKEND_URL"]) return process.env["BACKEND_URL"];
  if (process.env["RENDER_EXTERNAL_URL"]) return "https://e-sign.nilambarsonu.me";
  if (process.env["REPLIT_DOMAINS"]) return `https://${process.env["REPLIT_DOMAINS"].split(",")[0]}`;
  return `http://localhost:${process.env["PORT"] ?? 8080}`;
}

router.post("/contracts/upload-file", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  let fileUrl: string;

  // ── Cloudinary (production) ───────────────────────────────────────────────
  if (isCloudinaryConfigured() && req.file.buffer) {
    try {
      const ext = extname(req.file.originalname).toLowerCase();
      const filename = `${randomUUID()}`;
      fileUrl = await uploadToCloudinary(req.file.buffer, filename, "contracts", "raw");
      req.log.info({ filename, originalname: req.file.originalname }, "Contract file uploaded to Cloudinary");
    } catch (err) {
      req.log.error({ err }, "Cloudinary upload failed");
      res.status(500).json({ error: "File upload failed — storage error" });
      return;
    }
  } else {
    // ── Local disk fallback (development) ────────────────────────────────────
    const filename = req.file.filename ?? `${randomUUID()}${extname(req.file.originalname)}`;
    fileUrl = `${getBaseUrl()}/api/contract-files/${filename}`;
    req.log.info({ filename, originalname: req.file.originalname }, "Contract file saved to disk");
  }

  res.json({
    fileUrl,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

export default router;
