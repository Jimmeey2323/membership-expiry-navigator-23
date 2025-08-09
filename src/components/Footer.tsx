
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <div className="mt-16 animate-fade-in">
      <Card className="premium-card p-8 rounded-2xl border-2 shadow-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center">
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg flex items-center justify-center gap-2">
            A project by <span className="text-blue-600 dark:text-blue-400 font-bold">Jimmeey Gondaa</span> for 
            <span className="text-purple-600 dark:text-purple-400 font-bold">Physique 57 India</span>
            <Heart className="h-5 w-5 text-red-500 animate-pulse" />
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            All rights reserved - 2025
          </p>
        </div>
      </Card>
    </div>
  );
};
