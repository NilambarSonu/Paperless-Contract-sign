import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware.js";
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

// Clerk proxy MUST come before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({
  origin: process.env["FRONTEND_URL"]
    ? [process.env["FRONTEND_URL"], "http://localhost:5173", "http://localhost:3000"]
    : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Clerk middleware — resolves publishable key per host for multi-domain support
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

// Serve uploaded contract files
const contractsDir = join(process.cwd(), "uploads", "contracts");
if (!existsSync(contractsDir)) mkdirSync(contractsDir, { recursive: true });
app.use("/api/contract-files", express.static(contractsDir));

// Serve signed PDFs
const pdfsDir = join(process.cwd(), "uploads", "signed-pdfs");
if (!existsSync(pdfsDir)) mkdirSync(pdfsDir, { recursive: true });
app.use("/api/pdfs", express.static(pdfsDir));

// requireAuth middleware — used on protected routes
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

app.get("/api/healthz", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

// Serve frontend static files in production if they exist
const frontendDist = join(process.cwd(), "..", "frontend", "dist", "public");
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Catch-all route to serve the React SPA index.html for client-side routing
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(join(frontendDist, "index.html"));
  });
}

export default app;
