"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Monitor, Plane, Biohazard } from 'lucide-react';

const platforms = [
  { 
    name: "Esports Intelligence", 
    icon: Monitor, 
    subtitle: "CS2 / Valorant",
    desc: "Map topological control and crossfire connectivity in high-stakes FPS tactical lanes.",
    color: "#ffaa00"
  },
  { 
    name: "Swarm Robotics", 
    icon: Target, 
    subtitle: "Drone Fleet Control",
    desc: "Calculate dynamic mesh networking stability for autonomous aerial drone fleets.",
    color: "#00f3ff"
  },
  { 
    name: "Military Simulations", 
    icon: Plane, 
    subtitle: "Squad Coordination",
    desc: "Analyze combat unit spacing, tactical exposure, and flanking vulnerabilities in real-time.",
    color: "#ff0055"
  },
  { 
    name: "Emergency Response", 
    icon: Biohazard, 
    subtitle: "Disaster Management",
    desc: "Optimize search-and-rescue team coverage and communication radius efficiency.",
    color: "#00ff66"
  }
];

export default function PlatformExtensibility() {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-16 bg-[#07080f] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4">Venture-Scale Architecture</div>
          <h2 className="text-4xl md:text-5xl font-black font-orbitron tracking-tighter text-white uppercase mb-6">
            Beyond Football
          </h2>
          <p className="text-gray-400 font-light leading-relaxed">
            Our Spatio-Temporal Graph Engine is domain-agnostic. The mathematical principles of structural connectivity, entropy, and spatial routing scale instantly to any multi-agent tactical environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-black/40 p-8 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex flex-col items-center text-center relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ background: `linear-gradient(to bottom, ${platform.color}, transparent)` }}
              />

              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <platform.icon className="w-8 h-8" style={{ color: platform.color }} />
              </div>

              <div className="relative z-10 space-y-2">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{platform.name}</h3>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4" style={{ color: platform.color }}>
                  {platform.subtitle}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  {platform.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
