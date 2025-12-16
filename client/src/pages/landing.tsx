import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, BarChart3, Users, Clock, Shield, Zap, ArrowRight, CheckCircle, Star, TrendingUp, Globe, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

export default function Landing() {
  const features = [
    {
      icon: Ticket,
      title: "Centralized Feedback",
      description: "Single source of truth for all customer issues across all studios",
      gradient: "from-purple-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Smart Routing",
      description: "Automatic assignment based on category, priority, and location",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Clock,
      title: "SLA Tracking",
      description: "Automated reminders and escalations ensure timely resolution",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Generate actionable insights and identify trends across all touchpoints",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Organize teams and track performance across studios with real-time collaboration",
      gradient: "from-purple-600 to-indigo-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Role-based access control with audit trails and compliance features",
      gradient: "from-red-500 to-rose-500",
    },
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Guarantee", icon: TrendingUp },
    { number: "50+", label: "Global Studios", icon: Globe },
    { number: "24/7", label: "Support Coverage", icon: Clock },
    { number: "Enterprise", label: "Grade Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{
      background: `linear-gradient(135deg, 
        #005dd8 0%, 
        #0066ff 25%, 
        #e8e8e8 50%, 
        #f5f5f5 75%, 
        #ffffff 100%)`
    }}>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20"
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex h-12 w-12 items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Physique 57" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">Physique 57</span>
              <p className="text-sm text-gray-600">Enterprise Platform</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={async () => {
                    try {
                      console.log('Attempting Google OAuth...');
                      const { data, error } = await supabase.auth.signInWithOAuth({ 
                        provider: 'google', 
                        options: { redirectTo: window.location.origin } 
                      });
                      if (error) {
                        console.error('Google OAuth error:', error);
                        alert(`Google sign-in error: ${error.message}`);
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                      alert(`Unexpected error: ${err}`);
                    }
                  }}
                  className="bg-[#005dd8] hover:bg-[#0052c4] text-white font-medium px-6 py-2 rounded-lg shadow-lg"
                  data-testid="button-login"
                >
                  Sign In with Google
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const email = prompt('Email:');
                      const password = prompt('Password:');
                      if (email && password) {
                        console.log('Attempting email sign-in...');
                        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                        if (error) {
                          console.log('Sign-in failed, trying sign-up...');
                          const { error: signUpError } = await supabase.auth.signUp({ email, password });
                          if (signUpError) {
                            console.error('Sign-up error:', signUpError);
                            alert('Error: ' + signUpError.message);
                          } else {
                            alert('Check your email for confirmation link!');
                          }
                        } else {
                          console.log('Sign-in successful:', data);
                          window.location.reload();
                        }
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                      alert(`Unexpected error: ${err}`);
                    }
                  }}
                  className="border-[#005dd8] text-[#005dd8] hover:bg-[#005dd8] hover:text-white font-medium px-6 py-2 rounded-lg"
                  data-testid="button-email-login"
                >
                  Email Sign In
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-24 text-center relative">
          <motion.div 
            className="mx-auto max-w-5xl space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                Enterprise-Grade
                <br />
                <span className="bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                  Feedback Management
                </span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Streamline customer feedback, automate ticket routing, and deliver exceptional experiences 
              across all Physique 57 studios with our cutting-edge platform.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-6 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl border-0 text-lg"
                  data-testid="button-get-started" 
                  onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-[#005dd8] text-[#005dd8] hover:bg-[#005dd8] hover:text-white font-semibold px-8 py-4 rounded-xl text-lg"
                  data-testid="button-learn-more" 
                  onClick={async () => {
                    const email = prompt('Email for quick signup:');
                    const password = prompt('Password (min 6 chars):');
                    if (email && password) {
                      const { error } = await supabase.auth.signUp({ email, password });
                      if (error) alert('Error: ' + error.message);
                      else alert('Check your email for confirmation!');
                    }
                  }}
                >
                  Quick Demo Access
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 opacity-20"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Ticket className="h-16 w-16 text-[#005dd8]" />
          </motion.div>
          
          <motion.div
            className="absolute top-40 right-16 opacity-20"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <BarChart3 className="h-20 w-20 text-[#0066ff]" />
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-16">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-[#005dd8] mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="block bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                Modern Enterprises
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Everything you need to manage customer feedback at scale with enterprise-grade reliability and security.
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <motion.div 
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-xl mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div 
            className="mx-auto max-w-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-white/10"></div>
              <CardContent className="p-12 text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Star className="h-12 w-12 text-yellow-300 mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Transform Your Customer Experience?
                  </h2>
                  <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                    Join hundreds of enterprise teams who trust our platform to deliver exceptional customer service at scale.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="bg-white text-[#005dd8] hover:bg-gray-100 font-bold px-10 py-4 rounded-xl shadow-lg text-lg"
                      data-testid="button-cta-signin"
                      onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                    >
                      Start Your Journey Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer 
        className="backdrop-blur-md bg-white/80 border-t border-white/20 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Physique 57" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-bold text-lg text-gray-900">Physique 57 India</span>
          </div>
          <p className="text-gray-600 mb-2">Enterprise-Grade Feedback Management Platform</p>
          <p className="text-sm text-gray-500">Empowering teams to deliver exceptional customer experiences worldwide.</p>
        </div>
      </motion.footer>
    </div>
  );
}

