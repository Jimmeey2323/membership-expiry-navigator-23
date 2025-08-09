
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { googleSheetsService } from "@/services/googleSheets";
import { MembershipData } from "@/types/membership";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Dumbbell, 
  Search, 
  TrendingDown,
  BarChart3,
  Filter,
  Star,
  Zap,
  Target,
  Activity
} from "lucide-react";
import { QuickFilters } from "@/components/QuickFilters";
import { EnhancedDataTable } from "@/components/EnhancedDataTable";
import { MemberDetailModal } from "@/components/MemberDetailModal";
import { PremiumCharts } from "@/components/PremiumCharts";
import { ChurnMetrics } from "@/components/ChurnMetrics";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<MembershipData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: membershipData = [],
    isLoading,
    error,
    refetch
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

  // Apply filters globally
  const filteredData = useMemo(() => {
    let filtered = membershipData;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(member => 
        member.firstName?.toLowerCase().includes(term) ||
        member.lastName?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term) ||
        member.memberId?.toLowerCase().includes(term) ||
        member.membershipName?.toLowerCase().includes(term) ||
        member.location?.toLowerCase().includes(term)
      );
    }

    // Apply quick filters
    switch (quickFilter) {
      case 'active':
        filtered = filtered.filter(m => m.status === 'Active');
        break;
      case 'expired':
        filtered = filtered.filter(m => m.status === 'Expired');
        break;
      case 'sessions':
        filtered = filtered.filter(m => m.sessionsLeft > 0);
        break;
      case 'no-sessions':
        filtered = filtered.filter(m => m.sessionsLeft === 0);
        break;
      case 'recent':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.orderDate) >= thirtyDaysAgo);
        break;
      case 'weekly':
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.orderDate) >= sevenDaysAgo);
        break;
      case 'quarterly':
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.orderDate) >= ninetyDaysAgo);
        break;
      case 'half-year':
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.orderDate) >= sixMonthsAgo);
        break;
      case 'expiring':
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => {
          const endDate = new Date(m.endDate);
          return endDate >= now && endDate <= thirtyDaysFromNow;
        });
        break;
      case 'expiring-week':
        const nowWeek = new Date();
        const sevenDaysFromNow = new Date(nowWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => {
          const endDate = new Date(m.endDate);
          return endDate >= nowWeek && endDate <= sevenDaysFromNow;
        });
        break;
      case 'premium':
        filtered = filtered.filter(m => 
          m.membershipName && (m.membershipName.toLowerCase().includes('premium') || m.membershipName.toLowerCase().includes('unlimited'))
        );
        break;
      case 'low-sessions':
        filtered = filtered.filter(m => m.sessionsLeft <= 2 && m.sessionsLeft > 0);
        break;
      case 'high-sessions':
        filtered = filtered.filter(m => m.sessionsLeft > 10);
        break;
      default:
        // Location filters
        if (quickFilter.startsWith('location-')) {
          const location = quickFilter.replace('location-', '');
          filtered = filtered.filter(m => m.location === location);
        }
        break;
    }

    return filtered;
  }, [membershipData, searchTerm, quickFilter]);

  // Calculate metrics based on filtered data
  const metrics = useMemo(() => {
    const totalMembers = filteredData.length;
    const activeMembers = filteredData.filter(m => m.status === 'Active').length;
    const expiredMembers = filteredData.filter(m => m.status === 'Expired').length;
    const membersWithSessions = filteredData.filter(m => m.sessionsLeft > 0).length;
    
    // Calculate current month expiring members
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const expiringThisMonth = filteredData.filter(m => {
      const endDate = new Date(m.endDate);
      return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
    }).length;

    return {
      totalMembers,
      activeMembers,
      expiredMembers,
      membersWithSessions,
      expiringThisMonth
    };
  }, [filteredData]);

  const availableLocations = useMemo(() => {
    return [...new Set(membershipData.map(member => member.location))];
  }, [membershipData]);

  const handleRowClick = (member: MembershipData) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSave = (memberId: string, comments: string, notes: string, tags: string[]) => {
    // Update the member data locally
    console.log('Saving:', { memberId, comments, notes, tags });
    toast.success("Member data updated successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 max-w-sm mx-auto premium-card">
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Loading Dashboard</h2>
            <p className="text-muted-foreground">Fetching membership data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Membership Analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection />

      <div className="container mx-auto px-6 py-8 space-y-12">
        {/* Search Bar */}
        <Card className="premium-card p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search members by name, email, ID, membership type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base bg-background/50 border-2 focus:border-primary/50 rounded-xl shadow-sm"
            />
          </div>
        </Card>

        {/* Smart Filters */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Smart Filters
                <Star className="h-5 w-5 text-yellow-500 animate-pulse" />
              </h2>
              <p className="text-muted-foreground">Intelligent filtering for advanced data analysis</p>
            </div>
          </div>
          <QuickFilters
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            membershipData={membershipData}
            availableLocations={availableLocations}
          />
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Members</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalMembers}</p>
              </div>
            </div>
          </Card>

          <Card className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Members</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.activeMembers}</p>
              </div>
            </div>
          </Card>

          <Card className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg">
                <UserX className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Expired</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.expiredMembers}</p>
              </div>
            </div>
          </Card>

          <Card className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">With Sessions</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.membersWithSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="premium-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.expiringThisMonth}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <Card className="p-2 premium-card">
            <TabsList className="grid w-full grid-cols-3 bg-muted gap-1 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
                <BarChart3 className="h-4 w-4 mr-2" />
                Complete Member Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold">
                <Target className="h-4 w-4 mr-2" />
                Advanced Analytics
              </TabsTrigger>
              <TabsTrigger value="churn" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold">
                <TrendingDown className="h-4 w-4 mr-2" />
                Churn Analysis
              </TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value="overview" className="space-y-8">
            <EnhancedDataTable
              data={filteredData}
              onRowClick={handleRowClick}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <PremiumCharts membershipData={filteredData} />
          </TabsContent>

          <TabsContent value="churn" className="space-y-8">
            <ChurnMetrics membershipData={filteredData} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      <MemberDetailModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Index;
