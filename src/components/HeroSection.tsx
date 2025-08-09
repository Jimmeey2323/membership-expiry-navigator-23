
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Sparkles, Zap, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="relative animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-orange-500/10 rounded-3xl blur-3xl" />
      <Card className="relative premium-card p-12 rounded-3xl border-2 shadow-2xl bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-3xl blur-xl opacity-40 animate-pulse" />
              <div className="relative p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white rounded-3xl shadow-2xl">
                <Building2 className="h-12 w-12" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Membership Expirations & Churn Tracker
            </h1>
            <p className="text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-4xl mx-auto">
              Advanced analytics platform for comprehensive member lifecycle management and churn prevention
            </p>
            
            <div className="flex justify-center items-center gap-6 mt-8">
              <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-6 py-3 rounded-full text-lg font-semibold">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                Real-time Analytics
              </div>
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-6 py-3 rounded-full text-lg font-semibold">
                <Sparkles className="h-5 w-5" />
                Premium Intelligence
              </div>
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-6 py-3 rounded-full text-lg font-semibold">
                <TrendingUp className="h-5 w-5" />
                Churn Prevention
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
