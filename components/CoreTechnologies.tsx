"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Network, Layers, GitBranch, Share2, ShieldAlert } from 'lucide-react';

const techs = [
  { name: "Spectral Graph Theory", icon: Network, desc: "Modeling team dynamics through Laplacian eigenvalues." },
  { name: "Formation Entropy", icon: Layers, desc: "Quantifying structural disorder and tactical predictability." },
  { name: "Articulation Point Detection", icon: GitBranch, desc: "Identifying critical nodes whose removal collapses the network." },
  { name: "Tactical Pathfinding", icon: Share2, desc: "Dynamic optimization of passing lanes and movement vectors." },
  { name: "Graph Laplacian Analysis", icon: Cpu, desc: "Deep structural auditing of player connectivity matrices." },
  { name: "Spatial Connectivity Audits", icon: ShieldAlert, desc: "Real-time auditing of spatial pressure and defensive gaps." }
];

export default function CoreTechnologies() {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-16 bg-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Core Engine</div>
            <h2 className="text-4xl md:text-6xl font-black font-orbitron tracking-tighter text-white uppercase">MATHEMATICAL FOUNDATION</h2>
          </div>
          <div className="text-right">
            <span className="text-cyan-500 font-mono text-xs font-bold tracking-widest">[ ENGINE v4.2.0-STABLE ]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techs.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col gap-6 group relative overflow-hidden"
            >
              <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <tech.icon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{tech.name}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed">
                  {tech.desc}
                </p>
              </div>

              {/* Matrix-style background effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none font-mono text-[8px] text-blue-500 leading-none p-4 overflow-hidden select-none">
                 {Array.from({length: 10}).map((_, j) => (
                   <motion.div 
                    key={j}
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear", delay: Math.random() }}
                   >
                     {Math.random().toString(2).slice(2, 10)}
                   </motion.div>
                 ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
