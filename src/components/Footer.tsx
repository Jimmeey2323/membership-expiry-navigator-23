
import { Heart, Code, Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-border mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0">
          <div className="flex items-center gap-2 text-center">
            <span className="text-slate-300">A project by</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full border border-blue-500/30">
              <Code className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-white">Jimmeey Gondaa</span>
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            </div>
            <span className="text-slate-300">for</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-full border border-red-500/30">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="font-bold text-white">Physique 57 India</span>
            </div>
          </div>
          <div className="text-slate-400 md:ml-4">
            • All rights reserved - 2025
          </div>
        </div>
        <div className="text-center mt-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto" />
        </div>
      </div>
    </footer>
  );
};
