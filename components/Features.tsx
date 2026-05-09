"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    id: "tracking",
    title: "Optical Motion Capture",
    tagline: "Vision-based tracking",
    desc: "Real-time 3D skeletal tracking using standard 2D camera feeds. Our vision engine extracts biomechanical data points without wearable sensors.",
    data: ["60 FPS", "LATENCY < 15MS", "98.4% ACCURACY"],
    color: "#c8e86e"
  },
  {
    id: "analytics",
    title: "Predictive Fatigue Index",
    tagline: "Neural load monitoring",
    desc: "Movement pattern analysis to forecast exhaustion and injury risk. Monitor training loads with medical-grade precision.",
    data: ["AI DRIVEN", "RISK_PREDICTION: ACTIVE", "FATIGUE_SCORE: LIVE"],
    color: "#60a5fa"
  },
  {
    id: "tactical",
    title: "Tactical Spacing Engine",
    tagline: "Positional intelligence",
    desc: "Dynamic formation analysis and heatmaps. Visualize team structure, player density, and defensive gaps in real-time.",
    data: ["FORMATION: 4-3-3", "GAP_DETECTION: ON", "DENSITY_MAP: LIVE"],
    color: "#fb923c"
  },
  {
    id: "logs",
    title: "Match Intelligence",
    tagline: "Automated event tagging",
    desc: "Semantic understanding of match events. Automatically tag sprints, jumps, and maneuvers for instant review.",
    data: ["EVENT_TAGGING: AUTO", "REPLAY_GEN: FAST", "LOG_DB: SYNCED"],
    color: "#2dd4bf"
  }
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrollPos = -rect.top;
      const viewportHeight = window.innerHeight;
      
      const progress = (scrollPos + viewportHeight / 2) / sectionHeight;
      let index = Math.floor(progress * features.length);
      index = Math.min(features.length - 1, Math.max(0, index));
      
      setActiveIndex(index);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[400vh] bg-white dark:bg-[#0a0f0a] py-24 px-6 md:px-12 lg:px-16 transition-colors duration-300"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left: Content Area */}
          <div className="flex flex-col gap-12">
            <div className="space-y-4">
              <motion.span 
                key={features[activeIndex].id + "-tag"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold"
                style={{ color: features[activeIndex].color }}
              >
                {features[activeIndex].tagline}
              </motion.span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black dark:text-white leading-[0.9]">
                {features[activeIndex].title}
              </h2>
            </div>

            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl font-light leading-relaxed h-[100px]">
              {features[activeIndex].desc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features[activeIndex].data.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-mono">STATUS_{i+1}</span>
                  <span className="text-xs font-mono font-bold text-gray-200">{item}</span>
                </div>
              ))}
            </div>

            {/* Pagination Indicators */}
            <div className="flex gap-2 mt-4">
              {features.map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ 
                    width: i === activeIndex ? '40px' : '12px',
                    backgroundColor: i === activeIndex ? features[activeIndex].color : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: Visualizer Area */}
          <div className="relative aspect-square md:aspect-video lg:aspect-square bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)]"></div>
             
             <AnimatePresence mode="wait">
                <motion.div
                  key={features[activeIndex].id}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 p-8 flex flex-col justify-center items-center"
                >
                  {/* Mock Visualizer Elements based on index */}
                  {activeIndex === 0 && (
                    <svg className="w-64 h-64 text-[#c8e86e]" viewBox="0 0 100 100">
                      <motion.circle cx="50" cy="20" r="3" fill="currentColor" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                      <line x1="50" y1="20" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="50" y1="30" x2="30" y2="45" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="50" y1="30" x2="70" y2="45" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="50" y1="50" x2="35" y2="85" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="50" y1="50" x2="65" y2="85" stroke="currentColor" strokeWidth="1.5" />
                      <motion.circle cx="30" cy="45" r="2" fill="white" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                      <motion.circle cx="70" cy="45" r="2" fill="white" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    </svg>
                  )}
                  
                  {activeIndex === 1 && (
                    <div className="w-full max-w-sm space-y-6">
                       <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-blue-400" />
                       </div>
                       <div className="flex justify-between text-[10px] font-mono text-gray-400">
                          <span>FATIGUE_INDEX</span>
                          <span className="text-blue-400">82.4%</span>
                       </div>
                       <div className="grid grid-cols-8 gap-1 h-20 items-end">
                          {[40, 70, 50, 90, 60, 80, 55, 75].map((h, i) => (
                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="bg-blue-400/20 border-t-2 border-blue-400" />
                          ))}
                       </div>
                    </div>
                  )}

                  {activeIndex === 2 && (
                    <div className="relative w-64 h-64 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                       <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-32 h-32 bg-orange-500/30 rounded-full blur-3xl"
                       />
                       <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4 p-4 opacity-30">
                          {Array.from({length: 16}).map((_, i) => (
                            <div key={i} className="border border-white/10 rounded-sm"></div>
                          ))}
                       </div>
                       <div className="relative text-[10px] font-mono text-orange-400">HEATMAP_ACTIVE</div>
                    </div>
                  )}

                  {activeIndex === 3 && (
                    <div className="w-full max-w-sm space-y-3 font-mono text-[10px]">
                       {[1, 2, 3, 4, 5].map((i) => (
                         <motion.div 
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex justify-between p-2 bg-white/5 border border-white/10 rounded"
                         >
                           <span className="text-emerald-400">#LOG_{i*100}</span>
                           <span className="text-gray-500">EVENT: SPRINT_DETECTED</span>
                           <span className="text-gray-300">CONF: 99%</span>
                         </motion.div>
                       ))}
                    </div>
                  )}
                </motion.div>
             </AnimatePresence>

             {/* HUD elements */}
             <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Live_Stream_01</span>
             </div>
             <div className="absolute bottom-6 right-6 text-[10px] font-mono text-gray-500">
                SYSTEM_STABLE: 100%
             </div>
          </div>

        </div>

      </div>
    </section>
  );
}
