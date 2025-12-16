import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useState } from "react";
import { STUDIOS } from "@/lib/constants";

interface AnalyticsData {
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedThisMonth: number;
    avgResolutionTime: number;
    slaComplianceRate: number;
    customerSatisfaction: number;
  };
  trends: {
    date: string;
    created: number;
    resolved: number;
  }[];
  byCategory: {
    name: string;
    count: number;
    percentage: number;
  }[];
  byStudio: {
    name: string;
    open: number;
    resolved: number;
  }[];
  byPriority: {
    name: string;
    value: number;
    color: string;
  }[];
  teamPerformance: {
    team: string;
    ticketsHandled: number;
    avgResolutionTime: number;
    slaCompliance: number;
  }[];
  resolutionTimes: {
    range: string;
    count: number;
  }[];
}

const COLORS = ["#7c3aed", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#6b7280"];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [studioFilter, setStudioFilter] = useState("all");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", { timeRange, studio: studioFilter }],
  });

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  const defaultData: AnalyticsData = {
    overview: {
      totalTickets: 0,
      openTickets: 0,
      resolvedThisMonth: 0,
      avgResolutionTime: 0,
      slaComplianceRate: 0,
      customerSatisfaction: 0,
    },
    trends: [],
    byCategory: [],
    byStudio: [],
    byPriority: [],
    teamPerformance: [],
    resolutionTimes: [],
  };

  const data = analytics || defaultData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36" data-testid="select-time-range">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={studioFilter} onValueChange={setStudioFilter}>
            <SelectTrigger className="w-48" data-testid="select-studio-filter">
              <SelectValue placeholder="All studios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Studios</SelectItem>
              {STUDIOS.map((studio) => (
                <SelectItem key={studio.id} value={studio.id}>
                  {studio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Tickets"
          value={data.overview.totalTickets}
          icon={BarChart3}
          trend={12}
        />
        <MetricCard
          title="Open Tickets"
          value={data.overview.openTickets}
          icon={Clock}
          trend={-5}
        />
        <MetricCard
          title="Resolved (Month)"
          value={data.overview.resolvedThisMonth}
          icon={CheckCircle}
          trend={8}
        />
        <MetricCard
          title="Avg Resolution"
          value={`${data.overview.avgResolutionTime}h`}
          icon={Target}
          trend={-15}
          trendPositive={false}
        />
        <MetricCard
          title="SLA Compliance"
          value={`${data.overview.slaComplianceRate}%`}
          icon={CheckCircle}
          trend={3}
        />
        <MetricCard
          title="Satisfaction"
          value={`${data.overview.customerSatisfaction}/5`}
          icon={Users}
          trend={2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ticket Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.trends.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="#3b82f6"
                      fill="#3b82f680"
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke="#22c55e"
                      fill="#22c55e80"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="No trend data available" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.byCategory.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byCategory.slice(0, 6)} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="No category data available" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {data.byPriority.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.byPriority}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {data.byPriority.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="No priority data" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              By Studio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.byStudio.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byStudio}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="open" name="Open" fill="#f97316" />
                    <Bar dataKey="resolved" name="Resolved" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="No studio data available" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.teamPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Team</th>
                    <th className="text-right py-3 px-4 font-medium">
                      Tickets Handled
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Avg Resolution (hrs)
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      SLA Compliance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.teamPerformance.map((team, index) => (
                    <tr
                      key={team.team}
                      className={index % 2 === 0 ? "bg-muted/50" : ""}
                    >
                      <td className="py-3 px-4 font-medium">{team.team}</td>
                      <td className="py-3 px-4 text-right">
                        {team.ticketsHandled}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {team.avgResolutionTime}h
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={
                            team.slaCompliance >= 90
                              ? "default"
                              : team.slaCompliance >= 70
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {team.slaCompliance}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No team performance data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendPositive?: boolean;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
}: MetricCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const trendColor = trendPositive
    ? isPositiveTrend
      ? "text-green-600"
      : "text-red-600"
    : isPositiveTrend
      ? "text-red-600"
      : "text-green-600";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
              {isPositiveTrend ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-5 w-5 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
