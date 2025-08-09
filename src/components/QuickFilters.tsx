import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Dumbbell,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Filter,
  Sparkles,
  Zap,
  Star,
  BarChart3,
  AlertTriangle
} from "lucide-react";

interface QuickFiltersProps {
  quickFilter: string;
  onQuickFilterChange: (filter: string) => void;
  membershipData: any[];
  availableLocations: string[];
}

export const QuickFilters = ({ 
  quickFilter, 
  onQuickFilterChange, 
  membershipData,
  availableLocations 
}: QuickFiltersProps) => {
  const activeMembers = membershipData.filter(m => m.status === 'Active');
  const expiredMembers = membershipData.filter(m => m.status === 'Expired');
  const membersWithSessions = membershipData.filter(m => m.sessionsLeft > 0);
  
  // Period filters
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  const recentMembers = membershipData.filter(m => new Date(m.orderDate) >= thirtyDaysAgo);
  const weeklyMembers = membershipData.filter(m => new Date(m.orderDate) >= sevenDaysAgo);
  const quarterlyMembers = membershipData.filter(m => new Date(m.orderDate) >= ninetyDaysAgo);
  const halfYearMembers = membershipData.filter(m => new Date(m.orderDate) >= sixMonthsAgo);
  
  const expiringThisMonth = membershipData.filter(m => {
    const endDate = new Date(m.endDate);
    return endDate >= now && endDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  });
  
  const expiringThisWeek = membershipData.filter(m => {
    const endDate = new Date(m.endDate);
    return endDate >= now && endDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  // High-value filters
  const premiumMembers = membershipData.filter(m => 
    m.membershipName && (m.membershipName.toLowerCase().includes('premium') || m.membershipName.toLowerCase().includes('unlimited'))
  );
  
  const lowSessionMembers = membershipData.filter(m => m.sessionsLeft <= 2 && m.sessionsLeft > 0);
  const highSessionMembers = membershipData.filter(m => m.sessionsLeft > 10);

  const filterGroups = [
    {
      title: "Status Filters",
      icon: Users,
      gradient: "from-blue-600 to-purple-600",
      filters: [
        { key: 'all', label: 'All Members', count: membershipData.length, icon: Users, color: "from-slate-600 to-slate-700" },
        { key: 'active', label: 'Active', count: activeMembers.length, icon: UserCheck, color: "from-emerald-600 to-teal-600" },
        { key: 'expired', label: 'Expired', count: expiredMembers.length, icon: UserX, color: "from-red-600 to-rose-600" },
        { key: 'sessions', label: 'With Sessions', count: membersWithSessions.length, icon: Dumbbell, color: "from-purple-600 to-pink-600" },
        { key: 'no-sessions', label: 'No Sessions', count: membershipData.length - membersWithSessions.length, icon: Clock, color: "from-amber-600 to-orange-600" }
      ]
    },
    {
      title: "Period Filters",
      icon: Calendar,
      gradient: "from-emerald-600 to-teal-600",
      filters: [
        { key: 'weekly', label: 'This Week', count: weeklyMembers.length, icon: Calendar, color: "from-green-600 to-emerald-600" },
        { key: 'recent', label: 'Last 30 Days', count: recentMembers.length, icon: TrendingUp, color: "from-blue-600 to-indigo-600" },
        { key: 'quarterly', label: 'Last 90 Days', count: quarterlyMembers.length, icon: BarChart3, color: "from-purple-600 to-violet-600" },
        { key: 'half-year', label: 'Last 6 Months', count: halfYearMembers.length, icon: Calendar, color: "from-cyan-600 to-blue-600" }
      ]
    },
    {
      title: "Expiration Alerts",
      icon: AlertTriangle,
      gradient: "from-red-600 to-orange-600",
      filters: [
        { key: 'expiring-week', label: 'Expiring This Week', count: expiringThisWeek.length, icon: AlertTriangle, color: "from-red-600 to-red-700" },
        { key: 'expiring', label: 'Expiring This Month', count: expiringThisMonth.length, icon: Clock, color: "from-yellow-600 to-amber-600" },
        { key: 'low-sessions', label: 'Low Sessions (≤2)', count: lowSessionMembers.length, icon: AlertTriangle, color: "from-orange-600 to-red-600" }
      ]
    },
    {
      title: "Member Value",
      icon: Star,
      gradient: "from-gold to-yellow-600",
      filters: [
        { key: 'premium', label: 'Premium Members', count: premiumMembers.length, icon: Star, color: "from-gold to-yellow-600" },
        { key: 'high-sessions', label: 'High Sessions (>10)', count: highSessionMembers.length, icon: Zap, color: "from-green-600 to-emerald-600" }
      ]
    },
    {
      title: "Location Filters",
      icon: MapPin,
      gradient: "from-purple-600 to-pink-600",
      filters: availableLocations.slice(0, 6).map((location, index) => ({
        key: `location-${location}`,
        label: location.split(',')[0] || location,
        count: membershipData.filter(member => member.location === location).length,
        icon: MapPin,
        color: [
          "from-violet-600 to-purple-600",
          "from-pink-600 to-rose-600", 
          "from-cyan-600 to-blue-600",
          "from-lime-600 to-green-600",
          "from-indigo-600 to-purple-600",
          "from-teal-600 to-cyan-600"
        ][index % 6]
      }))
    }
  ];

  const handleQuickFilterChange = (filterKey: string) => {
    // Add special handling for new filters
    switch (filterKey) {
      case 'expiring-week':
        onQuickFilterChange('expiring-week');
        break;
      case 'quarterly':
        onQuickFilterChange('quarterly');
        break;
      case 'half-year':
        onQuickFilterChange('half-year');
        break;
      case 'premium':
        onQuickFilterChange('premium');
        break;
      case 'low-sessions':
        onQuickFilterChange('low-sessions');
        break;
      case 'high-sessions':
        onQuickFilterChange('high-sessions');
        break;
      default:
        onQuickFilterChange(filterKey);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {filterGroups.map((group, groupIndex) => (
        <Card key={group.title} className="premium-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${group.gradient} shadow-lg`}>
              <group.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                {group.title}
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-muted-foreground/30 to-transparent rounded-full mt-1" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {group.filters.map((filter, index) => (
              <Button
                key={filter.key}
                variant={quickFilter === filter.key ? "default" : "outline"}
                onClick={() => handleQuickFilterChange(filter.key)}
                className={`group relative h-auto py-4 px-6 flex items-center gap-3 transition-all duration-300 border-2 font-semibold ${
                  quickFilter === filter.key 
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-xl scale-105 border-transparent` 
                    : 'border-border bg-card hover:bg-muted hover:scale-105 hover:shadow-lg backdrop-blur-sm'
                }`}
              >
                {/* Premium glow effect for active buttons */}
                {quickFilter === filter.key && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${filter.color} opacity-20 blur-xl`} />
                )}
                
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  quickFilter === filter.key 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-r ${filter.color} group-hover:scale-110`
                }`}>
                  <filter.icon className={`h-4 w-4 ${
                    quickFilter === filter.key ? 'text-white' : 'text-white'
                  }`} />
                </div>
                
                <span className="relative z-10 font-bold tracking-wide">
                  {filter.label}
                </span>
                
                <Badge 
                  variant={quickFilter === filter.key ? "secondary" : "outline"}
                  className={`relative z-10 ml-1 transition-all duration-300 font-bold ${
                    quickFilter === filter.key 
                      ? 'bg-white/20 text-white border-white/30 shadow-sm' 
                      : 'bg-muted border-border'
                  }`}
                >
                  {filter.count}
                  {quickFilter === filter.key && <Star className="h-3 w-3 ml-1 text-yellow-300" />}
                </Badge>
                
                {/* Floating decoration */}
                {quickFilter === filter.key && (
                  <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                )}
              </Button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
