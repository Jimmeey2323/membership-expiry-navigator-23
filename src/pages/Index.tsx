import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/MetricCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { EnhancedDataTable } from "@/components/EnhancedDataTable";
import { PremiumCharts } from "@/components/PremiumCharts";
import { CollapsibleFilters } from "@/components/CollapsibleFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { googleSheetsService } from "@/services/googleSheets";
import { MembershipData, FilterOptions } from "@/types/membership";
import { Link } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Filter,
  Dumbbell,
  Activity,
  RefreshCw,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Crown,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    locations: [],
    membershipTypes: [],
    dateRange: { start: '', end: '' },
    sessionsRange: { min: 0, max: 100 }
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [localMembershipData, setLocalMembershipData] = useState<MembershipData[]>([]);

  const { data: membershipData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['membershipData'],
    queryFn: () => googleSheetsService.getMembershipData(),
    refetchInterval: 300000,
  });

  useEffect(() => {
    if (membershipData) {
      setLocalMembershipData(membershipData);
    }
  }, [membershipData]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch membership data. Using sample data for demonstration.");
    }
  }, [error]);

  const handleAnnotationUpdate = (memberId: string, comments: string, notes: string, tags: string[]) => {
    setLocalMembershipData(prev => 
      prev.map(member => 
        member.memberId === memberId 
          ? { ...member, comments, notes, tags }
          : member
      )
    );
    toast.success("Member annotations updated successfully!");
  };

  // Enhanced filter application with proper logic
  const applyAdvancedFilters = (data: MembershipData[]): MembershipData[] => {
    return data.filter(member => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(member.status)) {
        return false;
      }
      
      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes(member.location)) {
        return false;
      }
      
      // Membership type filter
      if (filters.membershipTypes.length > 0 && !filters.membershipTypes.includes(member.membershipName)) {
        return false;
      }
      
      // Sessions range filter
      if (member.sessionsLeft < filters.sessionsRange.min || member.sessionsLeft > filters.sessionsRange.max) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange.start) {
        const memberEndDate = new Date(member.endDate);
        const filterStartDate = new Date(filters.dateRange.start);
        if (memberEndDate < filterStartDate) {
          return false;
        }
      }
      
      if (filters.dateRange.end) {
        const memberEndDate = new Date(member.endDate);
        const filterEndDate = new Date(filters.dateRange.end);
        if (memberEndDate > filterEndDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Enhanced date parsing function
  const parseDate = (dateStr: string): Date => {
    if (!dateStr || dateStr === '-') return new Date(0);
    
    let cleanDateStr = dateStr.trim();
    
    if (cleanDateStr.includes(' ')) {
      cleanDateStr = cleanDateStr.split(' ')[0];
    }
    
    if (cleanDateStr.includes('/')) {
      const parts = cleanDateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    if (cleanDateStr.includes('-')) {
      const parsedDate = new Date(cleanDateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? new Date(0) : fallbackDate;
  };

  // Enhanced quick filter application
  const applyQuickFilters = (data: MembershipData[]): MembershipData[] => {
    if (quickFilter === 'all') return data;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    switch (quickFilter) {
      case 'active':
        return data.filter(member => member.status === 'Active');
      case 'expired':
        return data.filter(member => member.status === 'Expired');
      case 'frozen':
        return data.filter(member => member.frozen && member.frozen.toLowerCase() === 'true');
      case 'sessions':
        return data.filter(member => member.sessionsLeft > 0);
      case 'no-sessions':
        return data.filter(member => member.sessionsLeft === 0);
      case 'low-sessions':
        return data.filter(member => member.sessionsLeft > 0 && member.sessionsLeft <= 3);
      case 'medium-sessions':
        return data.filter(member => member.sessionsLeft >= 4 && member.sessionsLeft <= 10);
      case 'high-sessions':
        return data.filter(member => member.sessionsLeft > 10);
      case 'recent':
        return data.filter(member => parseDate(member.orderDate) >= thirtyDaysAgo);
      case 'weekly':
        return data.filter(member => parseDate(member.orderDate) >= sevenDaysAgo);
      case 'expiring-week':
        return data.filter(member => {
          const endDate = parseDate(member.endDate);
          return endDate >= now && endDate <= nextWeek && member.status === 'Active';
        });
      case 'expiring-month':
        return data.filter(member => {
          const endDate = parseDate(member.endDate);
          return endDate >= now && endDate <= nextMonth && member.status === 'Active';
        });
      case 'premium':
        return data.filter(member => 
          member.membershipName && 
          (member.membershipName.toLowerCase().includes('unlimited') || 
           member.membershipName.toLowerCase().includes('premium'))
        );
      case 'high-value':
        return data.filter(member => parseFloat(member.paid || '0') > 5000);
      case 'unpaid':
        return data.filter(member => 
          !member.paid || member.paid === '-' || parseFloat(member.paid || '0') === 0
        );
      default:
        // Handle location and membership type filters
        const availableLocations = [...new Set(localMembershipData.map(m => m.location).filter(Boolean))];
        const availableMembershipTypes = [...new Set(localMembershipData.map(m => m.membershipName).filter(Boolean))];
        
        if (availableLocations.includes(quickFilter)) {
          return data.filter(member => member.location === quickFilter);
        }
        if (availableMembershipTypes.includes(quickFilter)) {
          return data.filter(member => member.membershipName === quickFilter);
        }
        return data;
    }
  };

  // Combined filter application: advanced filters first, then quick filters
  const getFilteredData = (): MembershipData[] => {
    // First apply advanced filters
    let filteredData = applyAdvancedFilters(localMembershipData);
    
    // Then apply quick filters
    filteredData = applyQuickFilters(filteredData);
    
    return filteredData;
  };

  // Get filtered data for all components
  const filteredData = getFilteredData();
  
  // Calculate metrics based on filtered data
  const activeMembers = filteredData.filter(member => member.status === 'Active');
  const expiredMembers = filteredData.filter(member => member.status === 'Expired');
  const membersWithSessions = filteredData.filter(member => member.sessionsLeft > 0);
  const expiringMembers = filteredData.filter(member => {
    const endDate = parseDate(member.endDate);
    const now = new Date();
    return endDate >= now && endDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) && member.status === 'Active';
  });

  const availableLocations = [...new Set(localMembershipData.map(member => member.location).filter(l => l && l !== '-'))];
  const availableMembershipTypes = [...new Set(localMembershipData.map(member => member.membershipName))];

  const handleRefresh = () => {
    refetch();
    toast.success("Data refreshed successfully");
  };

  const handleFiltersReset = () => {
    setFilters({
      status: [],
      locations: [],
      membershipTypes: [],
      dateRange: { start: '', end: '' },
      sessionsRange: { min: 0, max: 100 }
    });
    setQuickFilter('all');
    toast.success("All filters cleared");
  };

  const hasActiveFilters = () => {
    return quickFilter !== 'all' || 
           filters.status.length > 0 || 
           filters.locations.length > 0 || 
           filters.membershipTypes.length > 0 ||
           filters.dateRange.start !== '' ||
           filters.dateRange.end !== '' ||
           filters.sessionsRange.min !== 0 ||
           filters.sessionsRange.max !== 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          <Card className="premium-card p-16 max-w-xl mx-auto shadow-2xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white rounded-full mx-auto w-fit shadow-2xl">
                <RefreshCw className="h-16 w-16 animate-spin" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                Loading Premium Dashboard
              </h2>
              <p className="text-xl text-slate-600 font-medium">
                Fetching advanced analytics & member insights...
              </p>
              
              <div className="space-y-4 mt-12">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="h-3 bg-gradient-to-r from-blue-200/40 via-purple-300/60 to-blue-200/40 rounded-full animate-pulse"
                    style={{ 
                      animationDelay: `${i * 300}ms`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10">
      {/* Full width container */}
      <div className="max-w-[1920px] mx-auto px-8 py-12 space-y-12">
        {/* Premium Header */}
        <div className="relative animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-orange-500/10 rounded-3xl blur-3xl" />
          <Card className="relative premium-card p-10 rounded-3xl border-2 shadow-2xl bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-3xl blur-xl opacity-40 animate-pulse" />
                    <div className="relative p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white rounded-3xl shadow-2xl">
                      <Building2 className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Premium Membership Analytics
                    </h1>
                    <p className="text-2xl text-slate-600 font-medium">
                      Advanced insights & comprehensive member management platform
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Live Data
                      </div>
                      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                        <Sparkles className="h-4 w-4" />
                        Premium Features
                      </div>
                      {hasActiveFilters() && (
                        <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
                          <Filter className="h-4 w-4" />
                          Filters Active ({filteredData.length} results)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link to="/churn-analytics">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="premium-card border-red-200 hover:bg-red-50 text-red-700 shadow-lg hover:shadow-xl font-semibold px-6"
                  >
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Churn Analytics
                  </Button>
                </Link>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="lg"
                  className="premium-card hover:bg-slate-50 shadow-lg hover:shadow-xl font-semibold px-6"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh Data
                </Button>
                <Button 
                  onClick={() => setIsFilterOpen(true)} 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 shadow-xl hover:shadow-2xl font-semibold px-8"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Advanced Filters
                </Button>
                {hasActiveFilters() && (
                  <Button 
                    onClick={handleFiltersReset}
                    variant="outline"
                    size="lg"
                    className="premium-card border-orange-200 hover:bg-orange-50 text-orange-700 shadow-lg hover:shadow-xl font-semibold px-6"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Collapsible Filters */}
        <div className="animate-slide-up">
          <CollapsibleFilters
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            membershipData={filteredData}
            availableLocations={availableLocations}
          />
        </div>

        {/* Premium Metrics Grid - Now uses filtered data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up">
          <MetricCard
            title="Total Members"
            value={filteredData.length}
            icon={Users}
            change="+12% from last month"
            trend="up"
            tooltip="Total number of registered members across all locations and membership types"
            drillDownData={[
              { label: 'This Month', value: 25 },
              { label: 'Last Month', value: 18 },
              { label: 'Active', value: activeMembers.length },
              { label: 'Inactive', value: expiredMembers.length }
            ]}
          />
          <MetricCard
            title="Active Members"
            value={activeMembers.length}
            icon={UserCheck}
            change="+5% from last month"
            trend="up"
            tooltip="Members with active subscriptions and valid access to facilities"
            drillDownData={[
              { label: 'New', value: 12 },
              { label: 'Renewed', value: 8 },
              { label: 'With Sessions', value: membersWithSessions.length },
              { label: 'Expiring Soon', value: expiringMembers.length }
            ]}
          />
          <MetricCard
            title="Expired Members"
            value={expiredMembers.length}
            icon={UserX}
            change="-8% from last month"
            trend="down"
            tooltip="Members whose subscriptions have expired and need renewal"
            drillDownData={[
              { label: 'This Week', value: 3 },
              { label: 'This Month', value: 8 },
              { label: 'Recoverable', value: 15 },
              { label: 'Lost', value: 5 }
            ]}
          />
          <MetricCard
            title="Total Sessions"
            value={filteredData.reduce((sum, member) => sum + member.sessionsLeft, 0)}
            icon={Dumbbell}
            change="+15% from last month"
            trend="up"
            tooltip="Total remaining sessions across all active memberships"
            drillDownData={[
              { label: 'Available', value: filteredData.reduce((sum, member) => sum + member.sessionsLeft, 0) },
              { label: 'Used This Month', value: 156 },
              { label: 'Avg per Member', value: Math.round(filteredData.reduce((sum, member) => sum + member.sessionsLeft, 0) / filteredData.length) || 0 },
              { label: 'Peak Usage', value: 45 }
            ]}
          />
        </div>

        {/* Premium Charts - Now uses filtered data */}
        <div className="animate-slide-up">
          <PremiumCharts data={filteredData} />
        </div>

        {/* Enhanced Interactive Data Tables */}
        <div className="animate-slide-up">
          <Tabs defaultValue="overview" className="space-y-8">
            <div className="relative">
              <Card className="premium-card p-4 shadow-lg">
                <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 gap-2 p-3 rounded-2xl">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl font-bold text-base py-4 rounded-xl transition-all duration-300 data-[state=active]:scale-105 hover:bg-white/80"
                  >
                    <Activity className="h-5 w-5 mr-2" />
                    All Members ({filteredData.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="active" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xl font-bold text-base py-4 rounded-xl transition-all duration-300 data-[state=active]:scale-105 hover:bg-white/80"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    Active ({activeMembers.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expired" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl font-bold text-base py-4 rounded-xl transition-all duration-300 data-[state=active]:scale-105 hover:bg-white/80"
                  >
                    <UserX className="h-5 w-5 mr-2" />
                    Expired ({expiredMembers.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="premium" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-xl font-bold text-base py-4 rounded-xl transition-all duration-300 data-[state=active]:scale-105 hover:bg-white/80"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Premium ({filteredData.filter(m => m.membershipName?.toLowerCase().includes('unlimited') || m.membershipName?.toLowerCase().includes('premium')).length})
                  </TabsTrigger>
                </TabsList>
              </Card>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <EnhancedDataTable 
                data={filteredData} 
                title="Complete Member Overview"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
              <EnhancedDataTable 
                data={activeMembers} 
                title="Active Members Dashboard"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>

            <TabsContent value="expired" className="space-y-6">
              <EnhancedDataTable 
                data={expiredMembers} 
                title="Expired Members - Renewal Opportunities"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>

            <TabsContent value="premium" className="space-y-6">
              <EnhancedDataTable 
                data={filteredData.filter(member => 
                  member.membershipName?.toLowerCase().includes('unlimited') || 
                  member.membershipName?.toLowerCase().includes('premium')
                )} 
                title="Premium & Unlimited Members"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>

        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            toast.success("Advanced filters applied successfully");
          }}
          availableLocations={availableLocations}
          availableMembershipTypes={availableMembershipTypes}
        />
      </div>
    </div>
  );
};

export default Index;
