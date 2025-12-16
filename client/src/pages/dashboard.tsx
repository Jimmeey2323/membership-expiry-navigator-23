import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { TicketCard } from "@/components/ticket-card";
import { EmptyState } from "@/components/empty-state";
import { DashboardSkeleton, TicketCardSkeleton } from "@/components/loading-skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { Ticket as TicketType } from "@shared/schema";

interface DashboardStats {
  totalOpen: number;
  totalNew: number;
  resolvedToday: number;
  slaBreached: number;
  avgResolutionHours: number;
  byStatus: { name: string; value: number; color: string }[];
  byPriority: { name: string; value: number; color: string }[];
  byCategory: { name: string; count: number }[];
}

const statusColors: Record<string, string> = {
  new: "#3b82f6",
  assigned: "#7c3aed",
  in_progress: "#f59e0b",
  pending_customer: "#f97316",
  resolved: "#10b981",
  closed: "#6b7280",
  reopened: "#ef4444",
};

const priorityColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentTickets, isLoading: ticketsLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/tickets", { limit: 5, sort: "createdAt", order: "desc" }],
  });

  const { data: urgentTickets, isLoading: urgentLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/tickets", { priority: "critical,high", status: "new,assigned,in_progress", limit: 5 }],
  });

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  const defaultStats: DashboardStats = {
    totalOpen: 0,
    totalNew: 0,
    resolvedToday: 0,
    slaBreached: 0,
    avgResolutionHours: 0,
    byStatus: [],
    byPriority: [],
    byCategory: [],
  };

  const displayStats: DashboardStats = {
    totalOpen: stats?.totalOpen ?? 0,
    totalNew: stats?.totalNew ?? 0,
    resolvedToday: stats?.resolvedToday ?? 0,
    slaBreached: stats?.slaBreached ?? 0,
    avgResolutionHours: stats?.avgResolutionHours ?? 0,
    byStatus: stats?.byStatus ?? [],
    byPriority: stats?.byPriority ?? [],
    byCategory: stats?.byCategory ?? [],
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Overview of ticket activity and performance metrics
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-500 dark:to-purple-600 shadow-lg hover:shadow-purple-500/30 transition-all font-semibold" data-testid="button-new-ticket-dashboard">
          <Link href="/tickets/new">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Open Tickets"
          value={displayStats.totalOpen}
          subtitle="Across all studios"
          icon={Ticket}
        />
        <StatsCard
          title="New Today"
          value={displayStats.totalNew}
          subtitle="Awaiting assignment"
          icon={Clock}
        />
        <StatsCard
          title="Resolved Today"
          value={displayStats.resolvedToday}
          subtitle="Successfully closed"
          icon={CheckCircle}
        />
        <StatsCard
          title="SLA Breached"
          value={displayStats.slaBreached}
          subtitle="Requires attention"
          icon={AlertTriangle}
          className={displayStats.slaBreached > 0 ? "border-red-500/50" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-white dark:from-slate-900 dark:to-slate-800 shadow-lg relative overflow-hidden">
          {/* Glossy shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3 relative z-10">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">Recent Tickets</CardTitle>
            <Button variant="ghost" size="sm" asChild data-testid="link-view-all-tickets">
              <Link href="/tickets">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticketsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <TicketCardSkeleton key={i} />
                ))}
              </>
            ) : recentTickets && recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <EmptyState
                icon={Ticket}
                title="No tickets yet"
                description="Create your first ticket to get started"
                action={{
                  label: "Create Ticket",
                  onClick: () => window.location.href = "/tickets/new",
                }}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 bg-white dark:from-slate-900 dark:to-slate-800 shadow-lg relative overflow-hidden">
            {/* Glossy shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">By Status</CardTitle>
            </CardHeader>
            <CardContent>
              {displayStats.byStatus.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayStats.byStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {displayStats.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || statusColors[entry.name] || "#6b7280"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {displayStats.byStatus.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color || statusColors[item.name] || "#6b7280" }}
                    />
                    <span className="text-muted-foreground capitalize">{item.name.replace("_", " ")}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white dark:from-slate-900 dark:to-slate-800 shadow-lg relative overflow-hidden">
            {/* Glossy shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">By Priority</CardTitle>
            </CardHeader>
            <CardContent>
              {displayStats.byPriority.length > 0 ? (
                <div className="space-y-3">
                  {displayStats.byPriority.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color || priorityColors[item.name] || "#6b7280" }}
                      />
                      <span className="text-sm capitalize flex-1">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-white dark:from-slate-900 dark:to-slate-800 shadow-lg relative overflow-hidden">
          {/* Glossy shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3 relative z-10">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Urgent Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentLoading ? (
              <>
                {[1, 2].map((i) => (
                  <TicketCardSkeleton key={i} />
                ))}
              </>
            ) : urgentTickets && urgentTickets.length > 0 ? (
              urgentTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <div className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No urgent tickets requiring attention
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white dark:from-slate-900 dark:to-slate-800 shadow-lg relative overflow-hidden">
          {/* Glossy shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayStats.byCategory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayStats.byCategory.slice(0, 5)} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
