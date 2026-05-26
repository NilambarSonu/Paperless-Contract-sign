import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contractsRouter from "./contracts";
import signingRouter from "./signing";
import dashboardRouter from "./dashboard";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contractsRouter);
router.use(signingRouter);
router.use(dashboardRouter);
router.use(settingsRouter);

export default router;
