import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats, useListContracts } from "@workspace/api-client-react";
import { FileText, Clock, CheckCircle, Calendar, Plus, ArrowRight, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useUser } from "@clerk/react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};

const statCards = [
  { key: "totalContracts",  label: "Total Contracts",    icon: FileText,     cardClass: "stat-card-blue",  iconBg: "bg-[#106EBE]/10", iconColor: "text-[#106EBE]" },
  { key: "pendingContracts",label: "Pending",             icon: Clock,        cardClass: "stat-card-light", iconBg: "bg-[#4da6e8]/10", iconColor: "text-[#4da6e8]" },
  { key: "signedContracts", label: "Signed",              icon: CheckCircle,  cardClass: "stat-card-mint",  iconBg: "bg-[#0FFCBF]/10", iconColor: "text-[#0dcca0]" },
  { key: "signedThisMonth", label: "Signed This Month",  icon: Calendar,     cardClass: "stat-card-navy",  iconBg: "bg-[#0A1628]/8",  iconColor: "text-[#0A1628]" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "signed") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0FFCBF]/12 text-[#0a9970] border border-[#0FFCBF]/25">
      <span className="w-1.5 h-1.5 rounded-full bg-[#0FFCBF]" />
      Signed
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#106EBE]/10 text-[#106EBE] border border-[#106EBE]/20">
      <span className="w-1.5 h-1.5 rounded-full bg-[#106EBE] animate-pulse" />
      Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {status}
    </span>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: contracts, isLoading: contractsLoading } = useListContracts();
  const { user } = useUser();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "there";

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-0.5">{greeting},</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A1628] capitalize">{firstName}</h1>
          </div>
          <Link href="/dashboard/contracts/new">
            <Button className="group bg-[#106EBE] hover:bg-[#0d5fa3] text-white shadow-sm hover:shadow-[0_4px_20px_rgba(16,110,190,0.35)] transition-all duration-300 rounded-xl h-10 px-5 font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Contract
              <ArrowRight className="w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon: Icon, cardClass, iconBg, iconColor }, i) => {
            const value = stats?.[key as keyof typeof stats] as number | undefined;
            return (
              <motion.div key={key} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Card className={`stat-card ${cardClass} border overflow-hidden pl-4 hover:shadow-md`}>
                  <CardContent className="p-5 pl-6 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 truncate">{label}</p>
                      {statsLoading
                        ? <Skeleton className="h-9 w-16" />
                        : <p className="font-mono text-3xl font-bold text-[#0A1628] leading-none">{value ?? 0}</p>
                      }
                    </div>
                    <div className={`shrink-0 w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Contracts Table */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base font-semibold text-[#0A1628]">Recent Contracts</CardTitle>
                <Link href="/dashboard/contracts">
                  <span className="text-xs text-[#106EBE] font-semibold hover:underline cursor-pointer">View all</span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {contractsLoading ? (
                <div className="space-y-0 divide-y">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : contracts?.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 bg-[#106EBE]/6 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-[#106EBE]/40" />
                  </div>
                  <p className="font-medium text-[#0A1628] mb-1">No contracts yet</p>
                  <p className="text-sm text-slate-400 mb-4">Create your first contract to get started.</p>
                  <Link href="/dashboard/contracts/new">
                    <Button size="sm" className="bg-[#106EBE] hover:bg-[#0d5fa3] text-white rounded-lg">
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      New Contract
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-6">Title</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signer</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(contracts) ? contracts : [])?.map((contract) => (
                      <TableRow key={contract.id} className="hover:bg-[#106EBE]/3 transition-colors border-b border-slate-50 group">
                        <TableCell className="font-medium text-[#0A1628] pl-6 py-4">
                          <span className="group-hover:text-[#106EBE] transition-colors">{contract.title}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-[#0A1628]">{contract.signerName}</div>
                          <div className="text-xs text-slate-400">{contract.signerEmail}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <StatusBadge status={contract.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-400 font-mono py-4">
                          {format(new Date(contract.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
