
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, Users, Calendar, BarChart3, Sparkles, Zap, Star, Target } from "lucide-react";

export const HeroSection = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900/30">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          {/* Main title with premium animations */}
          <div className={`space-y-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-3xl shadow-2xl animate-premium-glow">
                <div className="relative">
                  <TrendingDown className="h-12 w-12 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h1 className="text-elegant-heading text-5xl md:text-7xl lg:text-8xl font-black leading-none">
              Membership Expirations & 
              <span className="block bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-shimmer">
                Churn Tracker
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Advanced analytics and insights for membership retention, churn analysis, and business intelligence
            </p>
          </div>

          {/* Feature highlights */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="premium-card p-4 hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Member Tracking</h3>
                <p className="text-xs text-muted-foreground text-center">Real-time member status monitoring</p>
              </div>
            </Card>
            
            <Card className="premium-card p-4 hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Churn Analysis</h3>
                <p className="text-xs text-muted-foreground text-center">Advanced retention metrics</p>
              </div>
            </Card>
            
            <Card className="premium-card p-4 hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Smart Analytics</h3>
                <p className="text-xs text-muted-foreground text-center">Interactive data visualization</p>
              </div>
            </Card>
            
            <Card className="premium-card p-4 hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Smart Filters</h3>
                <p className="text-xs text-muted-foreground text-center">Intelligent data filtering</p>
              </div>
            </Card>
          </div>

          {/* Premium badge */}
          <div className={`flex justify-center transition-all duration-1000 delay-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold/10 to-yellow-500/10 border border-gold/30 rounded-full">
              <Star className="h-4 w-4 text-gold animate-pulse" />
              <span className="text-sm font-medium text-gold">Premium Business Intelligence Platform</span>
              <Zap className="h-4 w-4 text-gold animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
