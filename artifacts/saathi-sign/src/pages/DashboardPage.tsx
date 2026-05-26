import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats, useListContracts } from "@workspace/api-client-react";
import { FileText, Clock, CheckCircle, Calendar, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: contracts, isLoading: contractsLoading } = useListContracts();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Contracts" value={stats?.totalContracts} icon={FileText} loading={statsLoading} />
          <StatCard title="Pending" value={stats?.pendingContracts} icon={Clock} loading={statsLoading} />
          <StatCard title="Signed" value={stats?.signedContracts} icon={CheckCircle} loading={statsLoading} />
          <StatCard title="Signed This Month" value={stats?.signedThisMonth} icon={Calendar} loading={statsLoading} />
        </div>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : contracts?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                <FileText className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p>No contracts found.</p>
                <Link href="/dashboard/contracts/new">
                  <Button variant="link" className="mt-2 text-primary">Create your first contract</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Signer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts?.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">{contract.signerName}</div>
                        <div className="text-xs text-muted-foreground">{contract.signerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            contract.status === 'signed' ? 'bg-accent/10 text-accent border-accent/20' :
                            contract.status === 'pending' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(contract.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, loading }: { title: string, value?: number, icon: any, loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <h3 className="text-3xl font-bold text-foreground">{value || 0}</h3>
          )}
        </div>
        <div className="p-3 bg-primary/5 rounded-full">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
