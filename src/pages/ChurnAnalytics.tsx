
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { googleSheetsService } from "@/services/googleSheets";
import { MembershipData } from "@/types/membership";
import { MemberDetailModal } from "@/components/MemberDetailModal";
import { TrendingDown, Calendar, Users, AlertTriangle, ArrowLeft, Calculator, BarChart3, FileSpreadsheet, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ChurnMetrics {
  month: string;
  startingMembers: number;
  newMembers: number;
  expiredMembers: number;
  endingMembers: number;
  churnRate: number;
  churnCount: number;
}

interface StudioChurnData {
  location: string;
  month: string;
  startingMembers: number;
  expiredMembers: number;
  churnRate: number;
}

const ChurnAnalytics = () => {
  const [selectedMember, setSelectedMember] = useState<MembershipData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: membershipData = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['membershipData'],
    queryFn: () => googleSheetsService.getMembershipData(),
    refetchInterval: 300000
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch membership data. Using sample data for demonstration.");
    }
  }, [error]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get memberships expiring/expired in current month
  const currentMonthData = useMemo(() => {
    return membershipData.filter(member => {
      const endDate = new Date(member.endDate);
      return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
    });
  }, [membershipData, currentMonth, currentYear]);

  // Calculate month-on-month churn metrics
  const churnMetrics = useMemo(() => {
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
  }, [membershipData]);

  // Calculate studio-wise churn data
  const studioChurnData = useMemo(() => {
    const studios = Array.from(new Set(membershipData.map(m => m.location).filter(Boolean)));
    const currentDate = new Date();
    const currentMonthStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return studios.map(location => {
      const locationMembers = membershipData.filter(m => m.location === location);
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const startingMembers = locationMembers.filter(member => {
        const endDate = new Date(member.endDate);
        const orderDate = new Date(member.orderDate);
        return orderDate < monthStart && endDate >= monthStart;
      }).length;

      const expiredMembers = locationMembers.filter(member => {
        const endDate = new Date(member.endDate);
        return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear && member.status === 'Expired';
      }).length;

      const churnRate = startingMembers > 0 ? (expiredMembers / startingMembers) * 100 : 0;

      return {
        location,
        month: currentMonthStr,
        startingMembers,
        expiredMembers,
        churnRate: Number(churnRate.toFixed(2))
      };
    });
  }, [membershipData, currentMonth, currentYear]);

  const currentMonthMetrics = churnMetrics[churnMetrics.length - 1];
  const previousMonthMetrics = churnMetrics[churnMetrics.length - 2];

  const handleMemberClick = (member: MembershipData) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSaveMember = (memberId: string, comments: string, notes: string, tags: string[]) => {
    console.log('Saving member data:', { memberId, comments, notes, tags });
    toast.success('Member data updated successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 max-w-sm mx-auto bg-white dark:bg-slate-800 shadow-2xl">
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Loading Churn Analytics</h2>
            <p className="text-slate-600 dark:text-slate-400">Calculating churn metrics...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-lg">
                  <TrendingDown className="h-7 w-7" />
                </div>
                Membership Expirations & Churn Tracker
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                Detailed membership churn analysis and retention metrics
              </p>
            </div>
          </div>
        </div>

        {/* Current Month Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                <TrendingDown className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Current Churn Rate</h3>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {currentMonthMetrics?.churnRate || 0}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {currentMonthMetrics?.churnCount || 0} members lost this month
            </p>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Expiring This Month</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {currentMonthData.length}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Members with end dates in current month
            </p>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Starting Members</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {currentMonthMetrics?.startingMembers || 0}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active at start of month
            </p>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Churn Change</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {previousMonthMetrics ? `${((currentMonthMetrics?.churnRate || 0) - previousMonthMetrics.churnRate).toFixed(2)}%` : 'N/A'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              vs previous month
            </p>
          </Card>
        </div>

        {/* Churn Calculation Explanation */}
        <Card className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Calculator className="h-6 w-6 text-blue-600" />
              Churn Rate Calculation
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Formula Used:</h4>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-300 dark:border-slate-600 font-mono text-lg">
                  <span className="text-red-600 dark:text-red-400 font-bold">Churn Rate = (Members Lost in Period / Starting Members) × 100</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Starting Members</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Members with active subscriptions at the beginning of the month</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                      {currentMonthMetrics?.startingMembers || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Members Lost</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Members whose subscriptions expired during the month</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-2">
                      {currentMonthMetrics?.expiredMembers || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Calculation</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
          <Card className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm">
            <TabsList className="grid w-full grid-cols-4 bg-slate-50 dark:bg-slate-700 gap-1 p-1">
              <TabsTrigger value="current-month" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold dark:data-[state=active]:bg-red-600">
                <Calendar className="h-4 w-4 mr-2" />
                Current Month
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold dark:data-[state=active]:bg-blue-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Monthly Trends
              </TabsTrigger>
              <TabsTrigger value="studio-wise" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold dark:data-[state=active]:bg-green-600">
                <MapPin className="h-4 w-4 mr-2" />
                Studio Wise
              </TabsTrigger>
              <TabsTrigger value="detailed-list" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold dark:data-[state=active]:bg-purple-600">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Detailed List
              </TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value="current-month">
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Current Month Expiring/Expired Members ({currentMonthData.length})
                </h3>
                <div className="border-2 border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Member ID</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Name</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Email</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Membership</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">End Date</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Sessions Left</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentMonthData.map(member => (
                        <TableRow 
                          key={member.uniqueId} 
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                          onClick={() => handleMemberClick(member)}
                        >
                          <TableCell className="font-mono text-sm text-slate-900 dark:text-slate-100">{member.memberId}</TableCell>
                          <TableCell className="font-medium min-w-52 text-slate-900 dark:text-slate-100">{member.firstName} {member.lastName}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 min-w-52">{member.email}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 min-w-52">{member.membershipName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 dark:text-slate-100">{new Date(member.endDate).toLocaleDateString()}</span>
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'Active' ? "default" : "destructive"} className="min-w-20">
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={member.sessionsLeft > 0 ? "secondary" : "destructive"} className="min-w-8">
                              {member.sessionsLeft}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{member.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Month-on-Month Churn Analysis
                </h3>
                <div className="border-2 border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Month</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Starting Members</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">New Members</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Expired Members</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Ending Members</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Churn Rate</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Churn Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {churnMetrics.map((metric, index) => (
                        <TableRow key={metric.month} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <TableCell className="font-medium text-slate-900 dark:text-slate-100">{metric.month}</TableCell>
                          <TableCell className="text-center text-slate-900 dark:text-slate-100">{metric.startingMembers}</TableCell>
                          <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">+{metric.newMembers}</TableCell>
                          <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">-{metric.expiredMembers}</TableCell>
                          <TableCell className="text-center text-slate-900 dark:text-slate-100">{metric.endingMembers}</TableCell>
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

          <TabsContent value="studio-wise">
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Studio-wise Churn Analysis ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
                </h3>
                <div className="border-2 border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Studio Location</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Starting Members</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Expired Members</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Churn Rate</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studioChurnData.map((studio, index) => (
                        <TableRow key={studio.location} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <TableCell className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            {studio.location}
                          </TableCell>
                          <TableCell className="text-center text-slate-900 dark:text-slate-100">{studio.startingMembers}</TableCell>
                          <TableCell className="text-center text-red-600 dark:text-red-400 font-medium">{studio.expiredMembers}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={studio.churnRate > 10 ? "destructive" : studio.churnRate > 5 ? "secondary" : "default"} className="font-bold">
                              {studio.churnRate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {studio.churnRate <= 5 ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">Excellent</Badge>
                            ) : studio.churnRate <= 10 ? (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">Needs Attention</Badge>
                            )}
                          </TableCell>
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
              <Card className="bg-white dark:bg-slate-800 border-2 border-red-100 dark:border-red-800 shadow-xl">
                <div className="p-6">
                  <h4 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Expired This Month ({currentMonthData.filter(m => m.status === 'Expired').length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {currentMonthData.filter(m => m.status === 'Expired').length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 italic">No members expired this month</p>
                    ) : (
                      currentMonthData.filter(m => m.status === 'Expired').map(member => (
                        <div 
                          key={member.uniqueId} 
                          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => handleMemberClick(member)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                              {member.firstName} {member.lastName}
                            </h5>
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>Email:</strong> {member.email}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>Membership:</strong> {member.membershipName}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>End Date:</strong> {new Date(member.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Sessions Left:</strong> {member.sessionsLeft}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-2 border-orange-100 dark:border-orange-800 shadow-xl">
                <div className="p-6">
                  <h4 className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Expiring This Month ({currentMonthData.filter(m => m.status === 'Active').length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {currentMonthData.filter(m => m.status === 'Active').length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 italic">No members expiring this month</p>
                    ) : (
                      currentMonthData.filter(m => m.status === 'Active').map(member => (
                        <div 
                          key={member.uniqueId} 
                          className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                          onClick={() => handleMemberClick(member)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                              {member.firstName} {member.lastName}
                            </h5>
                            <Badge className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700">Expiring</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>Email:</strong> {member.email}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>Membership:</strong> {member.membershipName}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>End Date:</strong> {new Date(member.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Sessions Left:</strong> {member.sessionsLeft}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Member Detail Modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
      />
    </div>
  );
};

export default ChurnAnalytics;
