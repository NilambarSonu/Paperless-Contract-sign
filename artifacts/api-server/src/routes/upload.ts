import { Router, type IRouter } from "express";
import multer from "multer";
import { join, extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const uploadsDir = join(process.cwd(), "uploads", "contracts");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
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

router.post("/contracts/upload-file", upload.single("file"), (req, res): void => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const baseUrl = process.env["REPLIT_DOMAINS"]
    ? `https://${process.env["REPLIT_DOMAINS"].split(",")[0]}`
    : `http://localhost:${process.env["PORT"] ?? 8080}`;

  const fileUrl = `${baseUrl}/api/contract-files/${req.file.filename}`;

  req.log.info({ filename: req.file.filename, originalname: req.file.originalname }, "Contract file uploaded");

  res.json({
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

export default router;
