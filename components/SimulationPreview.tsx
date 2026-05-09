"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RefreshCw } from 'lucide-react';

const initialPlayers = [
  { id: 1, x: 150, y: 150, name: "P1" },
  { id: 2, x: 250, y: 100, name: "P2" },
  { id: 3, x: 250, y: 200, name: "P3" },
  { id: 4, x: 400, y: 150, name: "P4" },
  { id: 5, x: 50, y: 150, name: "GK" }
];

export default function SimulationPreview() {
  const [players, setPlayers] = useState(initialPlayers);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleDrag = (id: number, info: any) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, x: p.x + info.delta.x, y: p.y + info.delta.y } : p
    ));
  };

  return (
    <section className="py-32 px-6 md:px-12 lg:px-16 bg-charcoal border-t border-white/5">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-center">
        
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-4">Interactive Lab</div>
            <h2 className="text-4xl md:text-6xl font-black font-orbitron tracking-tighter text-white">LIVE SIMULATION</h2>
          </div>
          <p className="text-gray-400 font-light leading-relaxed">
            Interact with the spatio-temporal engine directly. Drag player nodes to recalculate graph connectivity, entropy spikes, and AI-driven tactical recommendations in real-time.
          </p>
          
          <div className="space-y-4">
             <div className="flex justify-between items-end p-4 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-time Entropy</span>
                <span className="text-2xl font-black text-cyan-400 font-orbitron">0.{(players[0].x / 1000).toFixed(3)}</span>
             </div>
             <div className="flex justify-between items-end p-4 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Passing Lanes</span>
                <span className="text-2xl font-black text-blue-500 font-orbitron">ACTIVE</span>
             </div>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-bold uppercase tracking-widest text-[10px]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause Engine" : "Resume Engine"}
          </button>
        </div>

        <div className="lg:col-span-3 relative aspect-[4/3] bg-black/40 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
           
           <svg className="w-full h-full cursor-crosshair">
              {/* Passing Lanes */}
              {players.map((p, i) => (
                players.slice(i + 1).map((other, j) => (
                  <motion.line
                    key={`${p.id}-${other.id}`}
                    x1={p.x} y1={p.y}
                    x2={other.x} y2={other.y}
                    stroke="rgba(0, 243, 255, 0.2)"
                    strokeWidth={1}
                    strokeDasharray={4}
                  />
                ))
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
                  <circle r={12} fill="rgba(0, 243, 255, 0.1)" stroke="#00f3ff" strokeWidth={1.5} className="cursor-grab active:cursor-grabbing" />
                  <text y={4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="pointer-events-none select-none">
                    {p.name}
                  </text>
                  <motion.circle 
                    r={20} fill="transparent" stroke="#00f3ff" strokeWidth={0.5} className="opacity-20"
                    animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.g>
              ))}
           </svg>

           {/* AI HUD Overlay */}
           <div className="absolute top-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl space-y-2 pointer-events-none">
              <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">AI Recommendation</div>
              <div className="text-[10px] text-white font-medium">Shift P2 +4.5m East to reduce <br/> Formation Entropy spike.</div>
           </div>
        </div>

      </div>
    </section>
  );
}
