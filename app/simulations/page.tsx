"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { MousePointer2, Move, RefreshCw, Zap, AlertTriangle, CheckCircle2, LayoutGrid, Skull, Binary } from 'lucide-react';

const initialPlayers = [
  { id: 1, x: 200, y: 150, name: "P1", team: 'A' },
  { id: 2, x: 300, y: 100, name: "P2", team: 'A' },
  { id: 3, x: 300, y: 200, name: "P3", team: 'A' },
  { id: 4, x: 400, y: 150, name: "P4", team: 'A' },
  { id: 5, x: 100, y: 150, name: "GK", team: 'A' },
];

export default function SimulationSandboxPage() {
  const [players, setPlayers] = useState(initialPlayers);
  const [isSimulating, setIsSimulating] = useState(true);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showMST, setShowMST] = useState(false);
  const [isolatedId, setIsolatedId] = useState<number | null>(null);

  // Calculate metrics based on player positions
  const metrics = useMemo(() => {
    // Fake calculation based on distance between players
    const dists = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        dists.push(Math.hypot(players[i].x - players[j].x, players[i].y - players[j].y));
      }
    }
    const avgDist = dists.reduce((a, b) => a + b, 0) / dists.length;
    const entropy = Math.min(1, avgDist / 300);
    const stability = 1 - entropy;
    return { entropy, stability, avgDist };
  }, [players]);

  const handleDrag = (id: number, info: any) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, x: p.x + info.delta.x, y: p.y + info.delta.y } : p
    ));
  };

  const resetSim = () => setPlayers(initialPlayers);

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-6 px-6 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Control Panel */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Simulation Sandbox // Lab</span>
              <button onClick={resetSim} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-cyan-400">
                <RefreshCw className="w-4 h-4" />
              </button>
           </div>

           <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Dynamic Metric 1 */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Formation Entropy</span>
                    {metrics.entropy > 0.6 ? <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                 </div>
                 <div className="text-4xl font-black font-orbitron">{(metrics.entropy * 100).toFixed(1)}%</div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${metrics.entropy * 100}%`, backgroundColor: metrics.entropy > 0.6 ? '#ff0033' : '#00f3ff' }} 
                      className="h-full" 
                    />
                 </div>
              </div>

              {/* Dynamic Metric 2 */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Team Diameter</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Live Calc</span>
                 </div>
                 <div className="text-4xl font-black font-orbitron">{(metrics.avgDist / 10).toFixed(1)}m</div>
                 <p className="text-[10px] text-gray-500 font-light">Distance between most distant nodes in current sub-graph.</p>
              </div>

              {/* AI Real-time Reaction */}
              <div className={`p-6 rounded-2xl border transition-all duration-500 ${metrics.entropy > 0.6 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                 <div className="flex items-center gap-2 mb-4">
                    <Zap className={`w-4 h-4 ${metrics.entropy > 0.6 ? 'text-rose-500' : 'text-cyan-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${metrics.entropy > 0.6 ? 'text-rose-500' : 'text-cyan-400'}`}>
                      {metrics.entropy > 0.6 ? 'Instability Detected' : 'Optimal Synergy'}
                    </span>
                 </div>
                 <div className="text-sm font-bold text-white leading-snug">
                    {metrics.entropy > 0.6 
                      ? "Formation fracture detected. Move P2 closer to the center to restore network bridge connectivity." 
                      : "Graph connectivity is robust. Passing lanes are optimized for transition play."}
                 </div>
              </div>

           </div>

           <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium leading-relaxed">
                 * Interaction Guide: Drag player nodes to recalculate graph topology and entropy spikes in real-time.
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => setShowMatrix(!showMatrix)}
                   className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all text-[9px] font-black uppercase tracking-widest ${showMatrix ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                 >
                   <Binary className="w-3 h-3" /> {showMatrix ? 'Close Matrix' : 'Open Matrix'}
                 </button>
                 <button 
                   onClick={() => {
                     const lynchpin = players[Math.floor(Math.random() * players.length)];
                     setPlayers(prev => prev.filter(p => p.id !== lynchpin.id));
                   }}
                   className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                 >
                   <Skull className="w-3 h-3" /> Isolate Lynchpin
                 </button>
              </div>
           </div>
        </div>

        {/* Interaction Canvas */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <MousePointer2 className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tool: Select & Drag</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Move className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Mode: Vertex Manipulation</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:50px_50px]" />
              
              {/* Spectral Matrix Overlay */}
              {showMatrix && (
                <div className="absolute top-6 right-6 z-10 p-4 liquid-glass border border-cyan-500/30 rounded-xl space-y-4 animate-in fade-in zoom-in duration-300">
                   <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Graph Laplacian [L]</span>
                      <span className="text-[8px] font-mono text-white/30">DIM: {players.length}x{players.length}</span>
                   </div>
                   <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}>
                      {players.map((p1, i) => 
                         players.map((p2, j) => {
                            const val = i === j ? players.length - 1 : -1;
                            return (
                              <div key={`${i}-${j}`} className={`w-8 h-8 flex items-center justify-center border border-white/5 font-mono text-[9px] ${i === j ? 'text-cyan-400 bg-cyan-400/5' : 'text-white/20'}`}>
                                {val}
                              </div>
                            );
                         })
                      )}
                   </div>
                   <div className="text-[8px] font-mono text-white/20 leading-tight">
                      Σ Degree(v) - Adjacency(G)<br/>
                      Spectral Gap: {(1 - metrics.entropy).toFixed(4)}
                   </div>
                </div>
              )}

              {/* Tactical Fracture Warning */}
              {players.length < initialPlayers.length && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-rose-500/10 backdrop-blur-[2px]">
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="p-8 liquid-glass border border-rose-500/50 rounded-3xl text-center space-y-3 shadow-[0_0_50px_rgba(255,0,51,0.2)]"
                   >
                      <Skull className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
                      <h3 className="text-2xl font-black font-orbitron text-white uppercase tracking-tighter">Tactical Fracture</h3>
                      <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em]">Articulation Point Removed // Graph Connectivity Fragmented</p>
                   </motion.div>
                </div>
              )}
              
              <svg className="w-full h-full cursor-crosshair">
                 {/* Pitch Markings */}
                 <rect x="50" y="50" width="700" height="300" fill="transparent" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
                 <line x1="400" y1="50" x2="400" y2="350" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
                 <circle cx="400" cy="200" r="50" fill="transparent" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />

                 {/* Edges */}
                 {players.map((p, i) => (
                    players.slice(i + 1).map((other, j) => {
                       const dist = Math.hypot(p.x - other.x, p.y - other.y);
                       return (
                          <motion.line
                            key={`${p.id}-${other.id}`}
                            x1={p.x} y1={p.y} x2={other.x} y2={other.y}
                            stroke={metrics.entropy > 0.6 ? "#ff0033" : "#00f3ff"}
                            strokeWidth={Math.max(0.5, 5 - dist / 50)}
                            strokeOpacity={Math.max(0.05, 0.5 - dist / 500)}
                            transition={{ duration: 0 }}
                          />
                       );
                    })
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
                       <circle r={14} fill="rgba(0, 0, 0, 0.8)" stroke={metrics.entropy > 0.6 ? "#ff0033" : "#00f3ff"} strokeWidth={2} className="cursor-grab active:cursor-grabbing" />
                       <text y={4} textAnchor="middle" fill="white" fontSize="10" fontWeight="black" className="font-orbitron pointer-events-none select-none">
                          {p.name}
                       </text>
                       
                       {/* Proximity Warning */}
                       {metrics.entropy > 0.6 && (
                          <motion.circle 
                            r={30} fill="transparent" stroke="#ff0033" strokeWidth={0.5} strokeDasharray="4 4"
                            animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          />
                       )}
                    </motion.g>
                 ))}
              </svg>

              {/* HUD Coordinates Overlay */}
              <div className="absolute bottom-6 right-6 font-mono text-[9px] text-white/20 text-right space-y-1">
                 <div>COORD_SYSTEM: CARTESIAN</div>
                 <div>REF_PLANE: X-Y-Z_NORMAL</div>
                 <div>PRECISION: FLOAT64</div>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
