"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Network, Layers, GitBranch, Share2 } from 'lucide-react';

const techs = [
  { 
    name: "Spectral Graph Theory", 
    icon: Network, 
    desc: "Modeling team dynamics as complex networks. We analyze Graph Laplacian eigenvalues to determine the overall algebraic connectivity and structural health of the formation in real-time.",
    color: "#00f3ff"
  },
  { 
    name: "Formation Entropy", 
    icon: Layers, 
    desc: "Quantifying structural disorder. By tracking spatial variance and edge deterioration, our Formational Entropy Index (FEI) predicts defensive fractures before the opponent can exploit them.",
    color: "#ffaa00"
  },
  { 
    name: "Articulation Point Detection", 
    icon: GitBranch, 
    desc: "Identifying critical lynchpin nodes. Using Tarjan's algorithm, we mathematically isolate the exact players whose removal or neutralization would shatter the team's passing network.",
    color: "#ff0055"
  },
  { 
    name: "Tactical Pathfinding", 
    icon: Share2, 
    desc: "Dynamic optimization of passing lanes. We apply adaptive Dijkstra routing with coach-defined spatial heuristics to find the most communication-efficient tactical skeleton under pressure.",
    color: "#00ff66"
  }
];

export default function CoreTechnologies() {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) return <section className="py-32 px-6 md:px-12 lg:px-16 bg-[#07080f]" />;

  return (
    <section className="py-32 px-6 md:px-12 lg:px-16 bg-[#07080f] border-t border-white/5 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4 flex items-center gap-2">
              <Network className="w-4 h-4" /> The Math Engine
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-orbitron tracking-tighter text-white uppercase leading-tight">
              Rigorous <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Topological Computation</span>
            </h2>
          </div>
          <div className="text-right">
            <span className="text-cyan-500/50 font-mono text-xs font-bold tracking-widest px-4 py-2 border border-cyan-500/20 bg-cyan-500/5">[ ENGINE v4.2.0-STABLE ]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {techs.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              className="group relative bg-black/40 p-10 rounded-2xl border border-white/10 hover:border-white/30 transition-all overflow-hidden"
            >
              {/* Glowing Hover Effect */}
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${tech.color}, transparent 70%)` }}
              />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-500" style={{ borderColor: `${tech.color}40`, backgroundColor: `${tech.color}10` }}>
                    <tech.icon className="w-6 h-6" style={{ color: tech.color }} />
                  </div>
                  <span className="font-mono text-[10px] text-white/20 tracking-widest group-hover:text-white/60 transition-colors">SYS_MOD_{i+1}</span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">{tech.name}</h3>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
