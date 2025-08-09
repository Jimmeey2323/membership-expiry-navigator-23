
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, Calendar, Users, AlertTriangle, Calculator, BarChart3, FileSpreadsheet } from "lucide-react";
import { MembershipData } from "@/types/membership";

interface ChurnMetrics {
  month: string;
  startingMembers: number;
  newMembers: number;
  expiredMembers: number;
  endingMembers: number;
  churnRate: number;
  churnCount: number;
}

interface ChurnMetricsProps {
  membershipData: MembershipData[];
}

export const ChurnMetrics = ({ membershipData }: ChurnMetricsProps) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get memberships expiring/expired in current month
  const currentMonthData = membershipData.filter(member => {
    const endDate = new Date(member.endDate);
    return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
  });

  // Calculate month-on-month churn metrics
  const churnMetrics: ChurnMetrics[] = (() => {
    const metrics: ChurnMetrics[] = [];
    const months = [];

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', {
          month: 'long',
          year: 'numeric'
        }),
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      });
    }

    months.forEach((monthData, index) => {
      const monthStart = new Date(monthData.year, monthData.monthIndex, 1);
      const monthEnd = new Date(monthData.year, monthData.monthIndex + 1, 0);

      // Members active at start of month
      const startingMembers = membershipData.filter(member => {
        const endDate = new Date(member.endDate);
        const orderDate = new Date(member.orderDate);
        return orderDate < monthStart && endDate >= monthStart;
      }).length;

      // New members in this month
      const newMembers = membershipData.filter(member => {
        const orderDate = new Date(member.orderDate);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }).length;

      // Members who expired in this month
      const expiredMembers = membershipData.filter(member => {
        const endDate = new Date(member.endDate);
        return endDate >= monthStart && endDate <= monthEnd && member.status === 'Expired';
      }).length;

      // Active members at end of month
      const endingMembers = membershipData.filter(member => {
        const endDate = new Date(member.endDate);
        const orderDate = new Date(member.orderDate);
        return orderDate <= monthEnd && endDate > monthEnd;
      }).length;

      // Churn rate calculation: (Members Lost / Starting Members) * 100
      const churnRate = startingMembers > 0 ? expiredMembers / startingMembers * 100 : 0;
      metrics.push({
        month: monthData.month,
        startingMembers,
        newMembers,
        expiredMembers,
        endingMembers,
        churnRate: Number(churnRate.toFixed(2)),
        churnCount: expiredMembers
      });
    });
    return metrics;
  })();

  const currentMonthMetrics = churnMetrics[churnMetrics.length - 1];
  const previousMonthMetrics = churnMetrics[churnMetrics.length - 2];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Current Month Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">Current Churn Rate</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            {currentMonthMetrics?.churnRate || 0}%
          </p>
          <p className="text-sm text-muted-foreground">
            {currentMonthMetrics?.churnCount || 0} members lost this month
          </p>
        </Card>

        <Card className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">Expiring This Month</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {currentMonthData.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Members with end dates in current month
          </p>
        </Card>

        <Card className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">Starting Members</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {currentMonthMetrics?.startingMembers || 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Active at start of month
          </p>
        </Card>

        <Card className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">Churn Change</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {previousMonthMetrics ? `${((currentMonthMetrics?.churnRate || 0) - previousMonthMetrics.churnRate).toFixed(2)}%` : 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            vs previous month
          </p>
        </Card>
      </div>

      {/* Churn Calculation Explanation */}
      <Card className="premium-card">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Churn Rate Calculation
          </h3>
          <div className="bg-muted/50 p-6 rounded-xl border-2 border-border">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Formula Used:</h4>
              <div className="bg-card p-4 rounded-lg border border-border font-mono text-lg">
                <span className="text-red-600 dark:text-red-400 font-bold">Churn Rate = (Members Lost in Period / Starting Members) × 100</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h5 className="font-semibold text-foreground mb-2">Starting Members</h5>
                  <p className="text-sm text-muted-foreground">Members with active subscriptions at the beginning of the month</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {currentMonthMetrics?.startingMembers || 0}
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h5 className="font-semibold text-foreground mb-2">Members Lost</h5>
                  <p className="text-sm text-muted-foreground">Members whose subscriptions expired during the month</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-2">
                    {currentMonthMetrics?.expiredMembers || 0}
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h5 className="font-semibold text-foreground mb-2">Calculation</h5>
                  <p className="text-sm text-muted-foreground">
                    ({currentMonthMetrics?.expiredMembers || 0} ÷ {currentMonthMetrics?.startingMembers || 1}) × 100
                  </p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">
                    = {currentMonthMetrics?.churnRate || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="current-month" className="space-y-6">
        <Card className="p-2 premium-card">
          <TabsList className="grid w-full grid-cols-3 bg-muted gap-1 p-1">
            <TabsTrigger value="current-month" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
              <Calendar className="h-4 w-4 mr-2" />
              Current Month
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monthly Trends
            </TabsTrigger>
            <TabsTrigger value="detailed-list" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Detailed List
            </TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="current-month">
          <Card className="premium-card">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Current Month Expiring/Expired Members ({currentMonthData.length})
              </h3>
              <div className="table-premium rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted border-b-2 border-border">
                      <TableHead className="font-bold text-foreground">Member ID</TableHead>
                      <TableHead className="font-bold text-foreground">Name</TableHead>
                      <TableHead className="font-bold text-foreground">Email</TableHead>
                      <TableHead className="font-bold text-foreground">Membership</TableHead>
                      <TableHead className="font-bold text-foreground">End Date</TableHead>
                      <TableHead className="font-bold text-foreground">Status</TableHead>
                      <TableHead className="font-bold text-foreground">Sessions Left</TableHead>
                      <TableHead className="font-bold text-foreground">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMonthData.map(member => (
                      <TableRow key={member.uniqueId} className="table-row-premium border-b border-border">
                        <TableCell className="font-mono text-sm">{member.memberId}</TableCell>
                        <TableCell className="font-medium min-w-52">{member.firstName} {member.lastName}</TableCell>
                        <TableCell className="text-muted-foreground min-w-52">{member.email}</TableCell>
                        <TableCell className="text-muted-foreground min-w-52">{member.membershipName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{new Date(member.endDate).toLocaleDateString()}</span>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'Active' ? "default" : "destructive"} className="min-w-36 py-2">
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={member.sessionsLeft > 0 ? "secondary" : "destructive"} className="min-w-8 text-center">
                            {member.sessionsLeft}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="premium-card">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Month-on-Month Churn Analysis
              </h3>
              <div className="table-premium rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted border-b-2 border-border">
                      <TableHead className="font-bold text-foreground">Month</TableHead>
                      <TableHead className="font-bold text-foreground">Starting Members</TableHead>
                      <TableHead className="font-bold text-foreground">New Members</TableHead>
                      <TableHead className="font-bold text-foreground">Expired Members</TableHead>
                      <TableHead className="font-bold text-foreground">Ending Members</TableHead>
                      <TableHead className="font-bold text-foreground">Churn Rate</TableHead>
                      <TableHead className="font-bold text-foreground">Churn Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {churnMetrics.map((metric) => (
                      <TableRow key={metric.month} className="table-row-premium border-b border-border">
                        <TableCell className="font-medium">{metric.month}</TableCell>
                        <TableCell className="text-center">{metric.startingMembers}</TableCell>
                        <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">+{metric.newMembers}</TableCell>
                        <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">-{metric.expiredMembers}</TableCell>
                        <TableCell className="text-center">{metric.endingMembers}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={metric.churnRate > 10 ? "destructive" : metric.churnRate > 5 ? "secondary" : "default"} className="font-bold">
                            {metric.churnRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">{metric.churnCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="detailed-list">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="premium-card border-red-200 dark:border-red-800">
              <div className="p-6">
                <h4 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Expired This Month
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto professional-scrollbar">
                  {currentMonthData.filter(m => m.status === 'Expired').map(member => (
                    <div key={member.uniqueId} className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-foreground">
                          {member.firstName} {member.lastName}
                        </h5>
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Email:</strong> {member.email}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Membership:</strong> {member.membershipName}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>End Date:</strong> {new Date(member.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Sessions Left:</strong> {member.sessionsLeft}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="premium-card border-orange-200 dark:border-orange-800">
              <div className="p-6">
                <h4 className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Expiring This Month
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto professional-scrollbar">
                  {currentMonthData.filter(m => m.status === 'Active').map(member => (
                    <div key={member.uniqueId} className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-foreground">
                          {member.firstName} {member.lastName}
                        </h5>
                        <Badge className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">Expiring</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Email:</strong> {member.email}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Membership:</strong> {member.membershipName}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>End Date:</strong> {new Date(member.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Sessions Left:</strong> {member.sessionsLeft}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
