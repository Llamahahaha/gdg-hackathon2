"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';
import TacticalBackground from './TacticalBackground';
import { Activity, Zap, Target, Hexagon } from 'lucide-react';

export default function Hero() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <section className="relative h-screen w-full bg-charcoal" />;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-charcoal">
      <TacticalBackground />

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col px-6 md:px-12 lg:px-16 justify-center">
        <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Tactical Intelligence Active</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white font-orbitron leading-none">
              Field<span className="text-cyan-500">Theory</span> <span className="text-3xl align-top bg-cyan-500/20 text-cyan-400 px-2 rounded">AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-xl leading-tight">
              Real-Time Tactical Intelligence Powered by <span className="text-white font-medium">Spatio-Temporal Graph Analytics</span>.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-cyan-500 text-black px-8 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:scale-105 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                Launch Intelligence Suite
              </button>
              <button className="liquid-glass border border-white/10 text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:bg-white/10">
                Documentation
              </button>
            </div>
          </div>

          {/* Right Column: Metric Panels */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { label: "Formation Entropy", type: "wave", status: "MONITORING", icon: Activity, color: "text-cyan-500" },
              { label: "Tactical Stability", type: "bars", status: "OPTIMIZING", icon: Zap, color: "text-blue-500" },
              { label: "Team Compactness", type: "grid", status: "ANALYZING", icon: Target, color: "text-white" },
              { label: "Lynchpin Detection", type: "radar", status: "SCANNING", icon: Hexagon, color: "text-rose-500" }
            ].map((panel, i) => (
              <FadeIn key={i} delay={400 + (i * 100)} duration={800}>
                <div className="liquid-glass p-6 rounded-2xl border border-white/5 space-y-4 hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <panel.icon className={`w-5 h-5 ${panel.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{panel.status}</span>
                  </div>
                  <div className="relative z-10">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">{panel.label}</div>
                    
                    {/* Abstract Visualizers instead of hardcoded numbers */}
                    <div className="h-10 flex items-end gap-1">
                      {panel.type === "bars" && Array.from({ length: 8 }).map((_, j) => (
                        <motion.div 
                          key={j}
                          animate={{ height: [10, 40, 15, 35, 20] }}
                          transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut", delay: j * 0.1 }}
                          className={`w-full rounded-t-sm ${panel.color} opacity-40`}
                        />
                      ))}
                      {panel.type === "wave" && (
                        <div className="w-full flex items-center h-full">
                           <svg viewBox="0 0 100 20" className="w-full h-8 overflow-visible">
                              <motion.path
                                d="M0 10 Q 25 0, 50 10 T 100 10"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={panel.color}
                                animate={{ d: ["M0 10 Q 25 0, 50 10 T 100 10", "M0 10 Q 25 20, 50 10 T 100 10", "M0 10 Q 25 0, 50 10 T 100 10"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              />
                           </svg>
                        </div>
                      )}
                      {panel.type === "grid" && (
                        <div className="grid grid-cols-4 grid-rows-2 gap-1 w-full h-full">
                           {Array.from({ length: 8 }).map((_, j) => (
                             <motion.div 
                               key={j}
                               animate={{ opacity: [0.1, 0.5, 0.1] }}
                               transition={{ duration: 2, repeat: Infinity, delay: j * 0.2 }}
                               className="bg-white/20 rounded-sm"
                             />
                           ))}
                        </div>
                      )}
                      {panel.type === "radar" && (
                        <div className="relative w-full h-full flex items-center justify-center">
                           <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-8 h-8 rounded-full border border-rose-500/50"
                           />
                           <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-t border-rose-500/40 rounded-full"
                           />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Decorative Background for Panel */}
                  <div className={`absolute bottom-[-20%] right-[-10%] w-24 h-24 blur-3xl opacity-5 rounded-full ${panel.color.replace('text-', 'bg-')}`} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-10 left-6 md:left-12 lg:left-16 right-6 md:right-12 lg:right-16 flex justify-between items-end">
        <div className="flex gap-8">
           <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Spatio-Temporal Sync</span>
              <span className="text-[9px] font-bold text-cyan-400 uppercase font-mono tracking-tighter animate-pulse">ACTIVE // 1:1 SCALE</span>
           </div>
           <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Engine Load</span>
              <span className="text-[9px] font-bold text-blue-500 uppercase font-mono tracking-tighter">DISTRIBUTED CLUSTERS</span>
           </div>
        </div>
        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 pb-1">
          GDG Hackathon 2026 // Production Release
        </div>
      </div>
    </section>
  );
}
