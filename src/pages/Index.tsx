import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/MetricCard";
import { PremiumCharts } from "@/components/PremiumCharts";
import { EnhancedDataTable } from "@/components/EnhancedDataTable";
import { QuickFilters } from "@/components/QuickFilters";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { MemberDetailModal } from "@/components/MemberDetailModal";
import { googleSheetsService } from "@/services/googleSheets";
import { MembershipData } from "@/types/membership";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  Activity
} from "lucide-react";

const Index = () => {
  const [quickFilter, setQuickFilter] = useState('all');
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

  // Apply global filtering based on quickFilter
  const filteredData = useMemo(() => {
    if (!membershipData || quickFilter === 'all') return membershipData || [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return membershipData.filter(member => {
      switch (quickFilter) {
        case 'active':
          return member.status === 'Active';
        case 'expired':
          return member.status === 'Expired';
        case 'sessions':
          return member.sessionsLeft > 0;
        case 'no-sessions':
          return member.sessionsLeft === 0;
        case 'expiring-week':
          const endDate = new Date(member.endDate);
          return endDate >= now && endDate <= nextWeek && member.status === 'Active';
        case 'expiring-month':
          const endDateMonth = new Date(member.endDate);
          return endDateMonth >= now && endDateMonth <= nextMonth && member.status === 'Active';
        case 'low-sessions':
          return member.sessionsLeft > 0 && member.sessionsLeft <= 3;
        case 'medium-sessions':
          return member.sessionsLeft >= 4 && member.sessionsLeft <= 10;
        case 'high-sessions':
          return member.sessionsLeft > 10;
        case 'recent':
          return new Date(member.orderDate) >= thirtyDaysAgo;
        case 'weekly':
          return new Date(member.orderDate) >= sevenDaysAgo;
        case 'premium':
          return member.membershipName && 
            (member.membershipName.toLowerCase().includes('unlimited') || 
             member.membershipName.toLowerCase().includes('premium'));
        case 'high-value':
          return parseFloat(member.paid || '0') > 5000;
        case 'unpaid':
          return !member.paid || member.paid === '-' || parseFloat(member.paid || '0') === 0;
        default:
          if (quickFilter.startsWith('location-')) {
            const location = quickFilter.replace('location-', '');
            return member.location === location;
          }
          return true;
      }
    });
  }, [membershipData, quickFilter]);

  const handleMemberClick = (member: MembershipData) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSaveMember = (memberId: string, comments: string, notes: string, tags: string[]) => {
    // This would typically update the backend
    console.log('Saving member data:', { memberId, comments, notes, tags });
    toast.success('Member data updated successfully!');
  };

  // Calculate metrics based on filtered data
  const metrics = useMemo(() => {
    const total = filteredData.length;
    const active = filteredData.filter(m => m.status === 'Active').length;
    const expired = filteredData.filter(m => m.status === 'Expired').length;
    const totalSessions = filteredData.reduce((sum, m) => sum + m.sessionsLeft, 0);

    return { total, active, expired, totalSessions };
  }, [filteredData]);

  // Get available locations from filtered data
  const availableLocations = useMemo(() => {
    return Array.from(new Set(filteredData.map(m => m.location).filter(Boolean)));
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-pulse">
          <Users className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-4">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <HeroSection />
      
      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Metrics Overview - Updated to use filtered data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Members"
            value={metrics.total}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Active Members"
            value={metrics.active}
            icon={UserCheck}
            color="emerald"
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Expired Members"
            value={metrics.expired}
            icon={UserX}
            color="red"
            trend={{ value: 3, isPositive: false }}
          />
          <MetricCard
            title="Total Sessions"
            value={metrics.totalSessions}
            icon={Activity}
            color="purple"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Smart Filters */}
        <QuickFilters
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          membershipData={membershipData || []}
          availableLocations={availableLocations}
        />

        {/* Charts - Updated to use filtered data */}
        <PremiumCharts data={filteredData} />

        {/* Enhanced Data Table - Updated to use filtered data and handle clicks */}
        <EnhancedDataTable 
          data={filteredData}
          onMemberClick={handleMemberClick}
        />
      </div>

      <Footer />

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

export default Index;
