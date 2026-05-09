"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, TrendingUp } from 'lucide-react';

const steps = [
  {
    title: "Detect",
    desc: "Track player movement and formation structures in real time using high-fidelity spatio-temporal telemetry.",
    icon: Search,
    color: "text-cyan-500",
    glow: "shadow-[0_0_20px_rgba(0,243,255,0.2)]"
  },
  {
    title: "Analyze",
    desc: "Compute graph intelligence using spectral graph theory and temporal connectivity analysis to find hidden patterns.",
    icon: BarChart3,
    color: "text-blue-500",
    glow: "shadow-[0_0_20px_rgba(0,102,255,0.2)]"
  },
  {
    title: "Predict",
    desc: "Detect tactical instability and formation fractures before defensive collapse occurs with AI-driven heuristics.",
    icon: TrendingUp,
    color: "text-rose-500",
    glow: "shadow-[0_0_20px_rgba(255,0,51,0.2)]"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-16 bg-charcoal relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 mb-4">Operational Pipeline</div>
          <h2 className="text-4xl md:text-6xl font-black font-orbitron tracking-tighter text-white">SYSTEM ARCHITECTURE</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Animated Connecting Lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2">
             <motion.div 
               animate={{ x: ['-100%', '200%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
             />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10 }}
              className={`liquid-glass p-10 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-all ${step.glow} relative z-10 overflow-hidden`}
            >
              <div className="w-16 h-16 rounded-2xl bg-charcoal border border-white/10 flex items-center justify-center mb-8 relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-dashed border-white/10 rounded-2xl"
                />
                <step.icon className={`w-8 h-8 ${step.color} group-hover:scale-125 transition-transform duration-500`} />
              </div>
              <h3 className="text-2xl font-black font-orbitron text-white mb-4 uppercase tracking-tighter">{step.title}</h3>
              <p className="text-gray-400 font-light leading-relaxed">
                {step.desc}
              </p>
              
              {/* Scanline Effect on Hover */}
              <motion.div 
                initial={{ y: '-100%' }}
                whileHover={{ y: '200%' }}
                transition={{ duration: 1, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
