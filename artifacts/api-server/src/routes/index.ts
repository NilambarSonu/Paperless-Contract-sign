import { Router, type IRouter } from "express";
import { requireAuth } from "../app.js";
import healthRouter from "./health.js";
import contractsRouter from "./contracts.js";
import uploadRouter from "./upload.js";
import signingRouter from "./signing.js";
import dashboardRouter from "./dashboard.js";
import settingsRouter from "./settings.js";

const router: IRouter = Router();

// Public — no auth required
router.use(healthRouter);
router.use(signingRouter);         // /sign/:token — token is the security mechanism

// Protected — require Clerk session
router.use(requireAuth);
router.use(uploadRouter);
router.use(contractsRouter);
router.use(dashboardRouter);
router.use(settingsRouter);

export default router;
