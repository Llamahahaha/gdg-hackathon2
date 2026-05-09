"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Move, RefreshCw, Save, Zap, AlertTriangle, Hexagon } from 'lucide-react';

export default function SimulationsPage() {
  const [nodes, setNodes] = useState([
    { id: 1, x: 200, y: 150, team: 'A' },
    { id: 2, x: 300, y: 100, team: 'A' },
    { id: 3, x: 300, y: 200, team: 'A' },
    { id: 4, x: 450, y: 150, team: 'A' },
    { id: 5, x: 100, y: 150, team: 'A' },
    { id: 6, x: 550, y: 150, team: 'B' },
    { id: 7, x: 650, y: 100, team: 'B' },
    { id: 8, x: 650, y: 200, team: 'B' },
  ]);

  const [ghostNodes] = useState([
    { id: 1, x: 200, y: 150, team: 'A' },
    { id: 2, x: 300, y: 100, team: 'A' },
    { id: 3, x: 300, y: 200, team: 'A' },
    { id: 4, x: 450, y: 150, team: 'A' },
    { id: 5, x: 100, y: 150, team: 'A' },
    { id: 6, x: 550, y: 150, team: 'B' },
    { id: 7, x: 650, y: 100, team: 'B' },
    { id: 8, x: 650, y: 200, team: 'B' },
  ]);

  const [entropy, setEntropy] = useState(0.42);
  const [showGhost, setShowGhost] = useState(true);

  const handleDrag = (id: number, info: any) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
    const center = nodes.reduce((acc, n) => ({ x: acc.x + n.x, y: acc.y + n.y }), { x: 0, y: 0 });
    const avgCenter = { x: center.x / nodes.length, y: center.y / nodes.length };
    const dispersion = nodes.reduce((acc, n) => acc + Math.hypot(n.x - avgCenter.x, n.y - avgCenter.y), 0);
    setEntropy(Math.min(0.99, dispersion / 2000));
  };

  const resetSimulation = () => {
    setNodes([
      { id: 1, x: 200, y: 150, team: 'A' },
      { id: 2, x: 300, y: 100, team: 'A' },
      { id: 3, x: 300, y: 200, team: 'A' },
      { id: 4, x: 450, y: 150, team: 'A' },
      { id: 5, x: 100, y: 150, team: 'A' },
      { id: 6, x: 550, y: 150, team: 'B' },
      { id: 7, x: 650, y: 100, team: 'B' },
      { id: 8, x: 650, y: 200, team: 'B' },
    ]);
    setEntropy(0.42);
  };

  const simulateCollapse = () => {
    setNodes(prev => prev.map(n => n.id === 4 ? { ...n, x: n.x + 100, y: n.y + 50 } : n));
    setEntropy(0.82);
  };

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-24 px-8 pb-8 grid grid-cols-12 gap-8 overflow-hidden">
        
        {/* Left: Simulation Canvas */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black uppercase tracking-[0.2em]">Tactical Sandbox</h1>
              <div className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-[8px] font-black text-cyan-400 tracking-widest uppercase">Simulation Mode</div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={simulateCollapse}
                className="px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
              >
                <Zap className="w-3 h-3" /> Simulate Predictive Collapse
              </button>
              <button 
                onClick={() => setShowGhost(!showGhost)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border transition-all ${showGhost ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-transparent border-white/10 text-white/40'}`}
              >
                Ghost Formation: {showGhost ? 'ON' : 'OFF'}
              </button>
              <button onClick={resetSimulation} className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white"><RefreshCw className="w-4 h-4" /></button>
              <button className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Save className="w-3 h-3" /> Save Scenario
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black rounded-none border border-white/20 relative overflow-hidden group select-none">
            {/* Pitch Markings */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '10% 10%'
              }} />

            <div className="absolute inset-0 p-12">
               <svg className="w-full h-full" viewBox="0 0 800 400">
                  {/* Ghost Formation (Static Reference) */}
                  {showGhost && ghostNodes.map(p => (
                    <g key={`ghost-${p.id}`} opacity="0.1">
                      <circle cx={p.x} cy={p.y} r={10} fill="white" />
                      <circle cx={p.x} cy={p.y} r={16} fill="transparent" stroke="white" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Edges with Stress Visualization */}
                  {nodes.map((p, i) => (
                    nodes.slice(i + 1).map((other) => {
                      const dist = Math.hypot(p.x - other.x, p.y - other.y);
                      if (dist > 200) return null;
                      const isSameTeam = p.team === other.team;
                      const isStressed = dist > 140;
                      
                      return (
                        <motion.line
                          key={`${p.id}-${other.id}`}
                          x1={p.x} y1={p.y} x2={other.x} y2={other.y}
                          stroke={isStressed ? "#ff0033" : (isSameTeam ? "#00f3ff" : "#ffffff")}
                          strokeWidth={isSameTeam ? (200 - dist) / 40 : 0.5}
                          strokeOpacity={isSameTeam ? (isStressed ? 0.8 : 0.3) : 0.1}
                          initial={false}
                          animate={{ strokeDasharray: isStressed ? "4,4" : "0" }}
                        />
                      );
                    })
                  ))}

                  {/* Drag-and-Drop Nodes */}
                  {nodes.map((p) => (
                    <motion.g 
                      key={p.id} 
                      drag 
                      dragMomentum={false}
                      onDrag={(e, info) => handleDrag(p.id, info)}
                      style={{ cursor: 'grab' }}
                      whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
                    >
                      <motion.circle 
                        cx={p.x} cy={p.y} r={10} 
                        fill={p.team === 'A' ? "#00f3ff" : "#ff0033"} 
                        className="drop-shadow-[0_0_10px_currentColor]"
                        animate={{ r: 10 }}
                      />
                      <motion.circle 
                        cx={p.x} cy={p.y} r={16} 
                        fill="transparent" 
                        stroke={p.team === 'A' ? "#00f3ff" : "#ff0033"} 
                        strokeWidth="1" 
                        className="opacity-20"
                      />
                      <text x={p.x} y={p.y - 20} textAnchor="middle" fill="white" fontSize="10" className="font-mono font-bold uppercase tracking-widest">P{p.id}</text>
                    </motion.g>
                  ))}
               </svg>
            </div>

            {/* Instruction Overlay */}
            <div className="absolute bottom-8 left-8 p-4 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-xl flex items-center gap-3">
              <Move className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Manual Node Override Active: Drag players to test formations</span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          {/* Real-time Impact Panel */}
          <div className="bg-black/40 border border-white/20 p-8 rounded-none flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Real-Time Impact Audit</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase">Formation Entropy</span>
                  <span className={`text-2xl font-black font-orbitron ${entropy > 0.6 ? 'text-rose-500' : 'text-cyan-400'}`}>{(entropy * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5">
                  <motion.div 
                    animate={{ width: `${entropy * 100}%`, backgroundColor: entropy > 0.6 ? '#ff0033' : '#00f3ff' }}
                    className="h-full"
                  />
                </div>
                {entropy > 0.6 && (
                   <div className="mt-2 text-[9px] font-black text-rose-500 uppercase flex items-center gap-1 animate-pulse">
                     <AlertTriangle className="w-3 h-3" /> FORMATION COLLAPSE RISK: CRITICAL
                   </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Lynchpin Resilience</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-[8px] font-bold text-white/40 uppercase mb-1">Max Path</div>
                    <div className="text-lg font-black font-orbitron">32.4m</div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-[8px] font-bold text-white/40 uppercase mb-1">Centrality</div>
                    <div className="text-lg font-black font-orbitron">0.89</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Engine */}
          <div className="flex-1 bg-cyan-500 p-8 text-black flex flex-col gap-6 relative overflow-hidden">
            <Hexagon className="absolute top-[-20px] right-[-20px] w-32 h-32 text-black/5 rotate-12" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Simulation Intelligence</div>
            <div className="text-2xl font-black font-orbitron uppercase leading-tight">Recommended Structure Adjustment</div>
            <p className="text-sm font-medium leading-relaxed mt-4">
              Current dispersion indicates a {entropy > 0.5 ? 'weakening' : 'stable'} midfield core. Shift Player #2 4m inwards to restore articulation point connectivity.
            </p>
            <button className="mt-auto w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-all">
              Apply AI Optimization
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
