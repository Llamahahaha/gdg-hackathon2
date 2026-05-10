"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';

const initialPlayers = [
  { id: 1, x: 200, y: 200, name: "P1" },
  { id: 2, x: 300, y: 150, name: "P2" },
  { id: 3, x: 300, y: 250, name: "P3" },
  { id: 4, x: 450, y: 200, name: "P4" },
  { id: 5, x: 100, y: 200, name: "GK" }
];

export default function SimulationPreview() {
  const [players, setPlayers] = useState(initialPlayers);

  const handleDrag = (id: number, info: any) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, x: p.x + info.delta.x, y: p.y + info.delta.y } : p
    ));
  };

  // Calculate dynamic topology
  const { edges, entropy, isCollapsed } = useMemo(() => {
    const e = [];
    let maxDist = 0;
    
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist > maxDist) maxDist = dist;
        
        e.push({
          p1, p2, dist,
          isStretched: dist > 180,
          isBroken: dist > 250
        });
      }
    }
    
    // Normalize entropy between 0.3 (tight) and 1.0 (scattered)
    const ent = Math.min(1.0, Math.max(0.2, (maxDist - 100) / 250));
    return { edges: e, entropy: ent, isCollapsed: ent > 0.8 };
  }, [players]);

  return (
    <section className="py-32 px-6 md:px-12 lg:px-16 bg-charcoal border-t border-white/5 relative overflow-hidden">
      {/* Background Warning Glow if collapsed */}
      <motion.div 
        animate={{ opacity: isCollapsed ? 0.2 : 0 }} 
        className="absolute inset-0 bg-rose-500 pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-center relative z-10">
        
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Simulation Sandbox
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-orbitron tracking-tighter text-white uppercase">Predictive Collapse Engine</h2>
          </div>
          <p className="text-gray-400 font-light leading-relaxed text-sm">
            Drag player nodes to stretch the graph. When spatial diameter breaches the threshold, the Laplacian eigenvalue drops, and you'll see the tactical passing lanes visually fracture.
          </p>
          
          <div className="space-y-4">
             <div className={`flex flex-col gap-2 p-5 border rounded-xl transition-colors ${isCollapsed ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-end mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isCollapsed ? 'text-rose-400' : 'text-gray-400'}`}>Formational Entropy</span>
                  <span className={`text-2xl font-black font-mono tracking-tight ${isCollapsed ? 'text-rose-500' : 'text-cyan-400'}`}>{(entropy * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                   <motion.div 
                    animate={{ width: `${entropy * 100}%`, backgroundColor: isCollapsed ? '#ff0033' : '#00f3ff' }}
                    className="h-full" 
                   />
                </div>
             </div>

             <AnimatePresence mode="wait">
               {isCollapsed ? (
                 <motion.div 
                   key="alert"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                   className="p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-start gap-3"
                 >
                   <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 animate-pulse" />
                   <div>
                     <div className="text-[10px] font-black uppercase text-rose-500 tracking-widest">CRITICAL FRACTURE DETECTED</div>
                     <div className="text-xs text-rose-400/80 mt-1">Right flank overload probability increased by 37%. Defensive cohesion lost.</div>
                   </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="stable"
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3"
                 >
                   <Activity className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <div>
                     <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">STRUCTURE STABLE</div>
                     <div className="text-xs text-white/40 mt-1">Passing network integrity maintaining optimal Laplacian connectivity.</div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-3 relative aspect-[4/3] bg-[#0a0a0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
           
           <svg className="w-full h-full">
              {/* Edges */}
              {edges.map((edge, i) => (
                <motion.line
                  key={`edge-${i}`}
                  x1={edge.p1.x} y1={edge.p1.y}
                  x2={edge.p2.x} y2={edge.p2.y}
                  stroke={edge.isBroken ? 'transparent' : edge.isStretched ? '#ff0033' : '#00f3ff'}
                  strokeWidth={edge.isStretched ? 2 : 1}
                  strokeDasharray={edge.isStretched ? '4 4' : '0'}
                  opacity={edge.isStretched ? 0.8 : 0.3}
                />
              ))}

              {/* Player Nodes */}
              {players.map((p) => (
                <motion.g
                  key={p.id}
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => handleDrag(p.id, info)}
                  initial={{ x: p.x, y: p.y }}
                  style={{ x: p.x, y: p.y }}
                >
                  <circle 
                    r={14} 
                    fill={isCollapsed ? "rgba(255, 0, 51, 0.1)" : "rgba(0, 243, 255, 0.1)"} 
                    stroke={isCollapsed ? "#ff0033" : "#00f3ff"} 
                    strokeWidth={2} 
                    className="cursor-grab active:cursor-grabbing" 
                  />
                  <text y={4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none select-none font-mono">
                    {p.name}
                  </text>
                  <motion.circle 
                    r={24} fill="transparent" 
                    stroke={isCollapsed ? "#ff0033" : "#00f3ff"} 
                    strokeWidth={1} className="opacity-30 pointer-events-none"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.g>
              ))}
           </svg>
        </div>

      </div>
    </section>
  );
}
