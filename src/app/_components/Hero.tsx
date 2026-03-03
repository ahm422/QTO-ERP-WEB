'use client';

import { motion, type Variants, type Easing } from 'framer-motion';
import { ArrowRight, CheckCircle, ExternalLink, Sparkles, Users, Clock, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Custom easing
const easeOutQuad: Easing = [0.25, 0.46, 0.45, 0.94];
const easeInOut: Easing = 'easeInOut';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easeOutQuad,
    },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Feature icon mapping
const featureIcons = [Clock, Users, Briefcase];

// Floating Card Component
const FloatingCard = ({ 
  icon: Icon, 
  label, 
  value, 
  delay, 
  position 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  delay: number;
  position: string;
}) => (
  <motion.div
    className={`absolute ${position} px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05, y: -5 }}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/70">{label}</p>
      </div>
    </div>
  </motion.div>
);

// Dashboard SVG Illustration
const DashboardIllustration = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffa500" />
        <stop offset="100%" stopColor="#ee7600" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EEB822" />
        <stop offset="100%" stopColor="#ffa500" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Main Dashboard Frame */}
    <motion.rect
      x="50" y="30" width="400" height="290" rx="16"
      fill="rgba(0,0,0,0.3)"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
    
    {/* Header */}
    <motion.rect
      x="50" y="30" width="400" height="50" rx="16"
      fill="url(#orangeGrad)"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    />
    <rect x="50" y="60" width="400" height="20" fill="url(#orangeGrad)" />
    
    {/* Window Dots */}
    <motion.circle cx="75" cy="55" r="6" fill="#ff5f57" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} />
    <motion.circle cx="95" cy="55" r="6" fill="#febc2e" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
    <motion.circle cx="115" cy="55" r="6" fill="#28c840" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
    
    {/* Stats Row */}
    <motion.rect x="70" y="100" width="100" height="60" rx="8" fill="rgba(255,165,0,0.15)" stroke="rgba(255,165,0,0.3)" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} />
    <motion.text x="85" y="130" fill="#ffa500" fontSize="16" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>98%</motion.text>
    <motion.text x="85" y="148" fill="rgba(255,255,255,0.6)" fontSize="10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>Attendance</motion.text>
    
    <motion.rect x="190" y="100" width="100" height="60" rx="8" fill="rgba(238,184,34,0.15)" stroke="rgba(238,184,34,0.3)" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} />
    <motion.text x="205" y="130" fill="#EEB822" fontSize="16" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>2.4k</motion.text>
    <motion.text x="205" y="148" fill="rgba(255,255,255,0.6)" fontSize="10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Employees</motion.text>
    
    <motion.rect x="310" y="100" width="120" height="60" rx="8" fill="rgba(255,165,0,0.15)" stroke="rgba(255,165,0,0.3)" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} />
    <motion.text x="325" y="130" fill="#ffa500" fontSize="16" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>156</motion.text>
    <motion.text x="325" y="148" fill="rgba(255,255,255,0.6)" fontSize="10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>Projects</motion.text>
    
    {/* Chart Area */}
    <motion.rect x="70" y="175" width="220" height="120" rx="8" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.1)" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }} />
    
    {/* Chart Line */}
    <motion.path
      d="M 90 270 L 120 250 L 150 260 L 180 230 L 210 240 L 240 200 L 270 210"
      stroke="url(#orangeGrad)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 1.3 }}
    />
    
    {/* Chart Fill */}
    <motion.path
      d="M 90 270 L 120 250 L 150 260 L 180 230 L 210 240 L 240 200 L 270 210 L 270 285 L 90 285 Z"
      fill="url(#orangeGrad)"
      fillOpacity="0.2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    />
    
    {/* Progress Bars */}
    <motion.rect x="310" y="175" width="120" height="120" rx="8" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.1)" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }} />
    
    <motion.rect x="325" y="195" width="90" height="6" rx="3" fill="rgba(255,255,255,0.1)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.4 }} style={{ originX: 0 }} />
    <motion.rect x="325" y="195" width="72" height="6" rx="3" fill="url(#orangeGrad)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.6 }} style={{ originX: 0 }} />
    <motion.text x="325" y="215" fill="rgba(255,255,255,0.6)" fontSize="9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>HR Tasks</motion.text>
    
    <motion.rect x="325" y="230" width="90" height="6" rx="3" fill="rgba(255,255,255,0.1)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5 }} style={{ originX: 0 }} />
    <motion.rect x="325" y="230" width="54" height="6" rx="3" fill="url(#accentGrad)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.7 }} style={{ originX: 0 }} />
    <motion.text x="325" y="250" fill="rgba(255,255,255,0.6)" fontSize="9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Projects</motion.text>
    
    <motion.rect x="325" y="265" width="90" height="6" rx="3" fill="rgba(255,255,255,0.1)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.6 }} style={{ originX: 0 }} />
    <motion.rect x="325" y="265" width="81" height="6" rx="3" fill="url(#orangeGrad)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.8 }} style={{ originX: 0 }} />
    <motion.text x="325" y="285" fill="rgba(255,255,255,0.6)" fontSize="9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>Attendance</motion.text>
    
    {/* Floating Orbs */}
    <motion.circle cx="30" cy="80" r="20" fill="url(#orangeGrad)" fillOpacity="0.3" filter="url(#glow)" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: easeInOut }} />
    <motion.circle cx="470" cy="280" r="15" fill="url(#accentGrad)" fillOpacity="0.3" filter="url(#glow)" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: easeInOut }} />
  </svg>
);

const Hero = () => {
  const benefits = [
    "Track time & attendance in real-time",
    "Manage your entire workforce lifecycle", 
    "Deliver projects on time, every time"
  ];

  return (
    <section 
      className="relative min-h-screen w-full overflow-hidden flex items-center"
      style={{ background: 'linear-gradient(316deg, #ffa500 0%, #ee7600 74%)' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-175 h-175 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: easeInOut }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-125 h-125 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 60%)' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: easeInOut }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column - Text Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeUpVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-white/20 text-white text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#EEB822]" />
                  The Modern ERP Platform
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 
                variants={fadeUpVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
              >
                The Modern ERP for{' '}
                <span className="text-black drop-shadow-sm">Growing Teams</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                variants={fadeUpVariants}
                className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Attendance, HR, and Project Management — unified in one powerful platform.
              </motion.p>

              {/* Benefits List */}
              <motion.ul 
                variants={fadeUpVariants}
                className="flex flex-col gap-3 mb-8 text-white/90 max-w-md mx-auto lg:mx-0"
              >
                {benefits.map((benefit, index) => (
                  <motion.li 
                    key={benefit} 
                    className="flex items-center gap-3 text-sm sm:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-[#EEB822]" />
                    </div>
                    {benefit}
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeUpVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
              >
                <Link 
                  href="/demo" 
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-lg shadow-xl shadow-black/20 hover:shadow-black/30 hover:scale-105 transition-all duration-300"
                >
                  Book a Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/pricing" 
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-black/20 border border-white/30 text-white font-semibold text-lg hover:bg-black/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  See Pricing
                </Link>
              </motion.div>

              {/* Product By Link */}
              <motion.a
                variants={fadeUpVariants}
                href="https://build-stellar-portfolios.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
              >
                A product by QTO Dev <ExternalLink className="h-4 w-4" />
              </motion.a>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              variants={scaleInVariants}
              initial="hidden"
              animate="visible"
              className="relative hidden lg:block"
            >
              {/* Glow Behind */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-87.5 h-87.5 rounded-full bg-white/10 blur-3xl" />
              </div>

              {/* Dashboard Illustration */}
              <motion.div
                className="relative z-10"
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: easeInOut }}
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/20 backdrop-blur-xl shadow-2xl shadow-black/20">
                  <DashboardIllustration />
                </div>

                {/* Floating Cards */}
                <FloatingCard 
                  icon={Clock} 
                  label="Time Saved" 
                  value="40hrs" 
                  delay={1.5}
                  position="-bottom-4 -left-8"
                />
                <FloatingCard 
                  icon={Users} 
                  label="Active Users" 
                  value="2.4k+" 
                  delay={1.7}
                  position="-top-4 -right-4"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;