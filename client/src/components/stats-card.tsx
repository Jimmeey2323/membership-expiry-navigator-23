import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(
      "hover-elevate transition-all duration-300 border-0 bg-white dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-1 backdrop-blur-xl relative overflow-hidden",
      className
    )}>
      {/* Glossy shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {title}
            </span>
            <span className="text-4xl font-bold tabular-nums bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">{value}</span>
            {subtitle && (
              <span className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</span>
            )}
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold mt-1",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
              </span>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl hover:shadow-2xl transition-shadow">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
