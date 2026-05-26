import { Router, type IRouter } from "express";
import { eq, sql, desc, and, gte } from "drizzle-orm";
import { db, contractsTable, auditLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [statsResult] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      signed: sql<number>`count(*) filter (where status = 'signed')::int`,
      expired: sql<number>`count(*) filter (where status = 'expired')::int`,
    })
    .from(contractsTable);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractsTable)
    .where(and(eq(contractsTable.status, "signed"), gte(contractsTable.signedAt, startOfMonth)));

  res.json({
    totalContracts: statsResult?.total ?? 0,
    pendingContracts: statsResult?.pending ?? 0,
    signedContracts: statsResult?.signed ?? 0,
    expiredContracts: statsResult?.expired ?? 0,
    signedThisMonth: monthResult?.count ?? 0,
    avgSigningTimeHours: null,
  });
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const logs = await db
    .select()
    .from(auditLogsTable)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(20);

  res.json(
    logs.map((l) => ({
      id: l.id,
      type: l.type,
      contractTitle: l.contractTitle,
      signerName: l.signerName,
      timestamp: l.createdAt.toISOString(),
    }))
  );
});

export default router;
