import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded contract files
const contractsDir = join(process.cwd(), "uploads", "contracts");
if (!existsSync(contractsDir)) mkdirSync(contractsDir, { recursive: true });
app.use("/api/contract-files", express.static(contractsDir));

// Serve signed PDFs
const pdfsDir = join(process.cwd(), "uploads", "signed-pdfs");
if (!existsSync(pdfsDir)) mkdirSync(pdfsDir, { recursive: true });
app.use("/api/pdfs", express.static(pdfsDir));

app.use("/api", router);

export default app;
