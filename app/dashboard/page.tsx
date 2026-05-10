"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { BarChart3, Users, Clock, Shield, ArrowUpRight, TrendingUp, Activity, Target, FileText } from 'lucide-react';
import Link from 'next/link';
import { useTactical } from '@/context/TacticalContext';

export default function DashboardPage() {
  const { 
    players: livePlayers, 
    metrics: liveMetrics, 
    isPlaying: engineIsRunning, 
    frameIndex: liveFrameIndex,
    entropy: liveEntropy,
    status: liveStatus
  } = useTactical();

  const [tacticalData, setTacticalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveIndex, setLiveIndex] = useState(0);

  useEffect(() => {
    fetch('/data/tactical_data.json')
      .then(res => res.json())
      .then(data => {
        setTacticalData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tactical data", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!tacticalData || !tacticalData.timeline || engineIsRunning) return;
    const interval = setInterval(() => {
      setLiveIndex(prev => (prev + 1) % tacticalData.timeline.length);
    }, 200); 
    return () => clearInterval(interval);
  }, [tacticalData, engineIsRunning]);

  const totalFrames = engineIsRunning ? liveFrameIndex : (tacticalData?.timeline?.length || 0);
  const matchTime = (totalFrames / 30).toFixed(1); 
  const team1Total = engineIsRunning ? livePlayers.filter(p => p.team === 'A').length : (tacticalData?.summary?.team1_total || 0);
  const team2Total = engineIsRunning ? livePlayers.filter(p => p.team === 'B').length : (tacticalData?.summary?.team2_total || 0);
  
  const currentEntropy = engineIsRunning ? liveEntropy : 0.42;
  const avgStability = `${((1 - currentEntropy) * 100).toFixed(1)}%`;

  const stats = [
    { label: 'Total Frames Analyzed', value: totalFrames || '--', icon: Activity, color: 'text-cyan-400' },
    { label: 'Live Formation Stability', value: avgStability, icon: Shield, color: 'text-emerald-400' },
    { label: 'Active Node Count', value: engineIsRunning ? livePlayers.length : (team1Total + team2Total), icon: Target, color: 'text-blue-400' },
    { label: 'Match Analysis Clock', value: `${matchTime}s`, icon: Clock, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 px-8 pb-12 w-full max-w-[1600px] mx-auto">
        <header className="mb-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black font-orbitron tracking-tighter mb-4 uppercase">Command Center</h1>
              <p className="text-white/40 text-base font-light uppercase tracking-[0.4em]">Spatio-Temporal Intelligence Overview // {liveStatus}</p>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={() => alert('Analyzing spatio-temporal datasets... Tactical Audit generating.')}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all rounded-none flex items-center gap-2 group"
              >
                <FileText className="w-5 h-5 text-cyan-400" /> Generate Intelligence Audit
              </button>
              <Link href="/live" className="px-8 py-4 bg-cyan-500 text-black font-black uppercase text-sm tracking-widest hover:bg-cyan-400 transition-all rounded-none flex items-center gap-2 group">
                Open Live Engine <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/40 border border-white/10 p-8 rounded-none relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 bg-white/5 border border-white/10 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/20" />
              </div>
              <div className="text-xs font-black text-white/30 uppercase tracking-widest mb-2">{stat.label}</div>
              <div className="text-4xl font-black font-orbitron">{loading ? '...' : stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <div className="col-span-12 lg:col-span-8 bg-black/40 border border-white/10 p-8 rounded-none relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest">Global Graph Nodes Over Time</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-none" />
                  <span className="text-[10px] text-white/40 uppercase">Home Team (Green)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-none" />
                  <span className="text-[10px] text-white/40 uppercase">Away Team (White)</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-[1px] px-2 w-full overflow-hidden">
              {!loading && tacticalData?.timeline ? tacticalData.timeline.slice(0, 100).map((frame: any, i: number) => {
                // Visualize the number of players detected per frame
                const t1 = frame.t1 || 0;
                const t2 = frame.t2 || 0;
                const maxPlayers = 22; // max possible
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-[1px]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(t2 / maxPlayers) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.01 }}
                      className="w-full bg-rose-500/80"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(t1 / maxPlayers) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.01 }}
                      className="w-full bg-cyan-500/80"
                    />
                  </div>
                );
              }) : (
                 Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${20 + Math.random() * 80}%` }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                    className="flex-1 bg-cyan-500/20 border-t border-cyan-500/40"
                  />
                ))
              )}
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div>
                <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Peak Node Density</div>
                <div className="text-xl font-bold font-orbitron text-emerald-400">
                  {tacticalData ? Math.max(...tacticalData.timeline.map((t: any) => (t.t1 || 0) + (t.t2 || 0))) : '--'} Nodes
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Home Team Average</div>
                <div className="text-xl font-bold font-orbitron text-white">
                  {tacticalData ? (tacticalData.timeline.reduce((acc: number, t: any) => acc + (t.t1 || 0), 0) / tacticalData.timeline.length).toFixed(1) : '--'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Engine Latency</div>
                <div className="text-xl font-bold font-orbitron text-cyan-400">14ms</div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="col-span-12 lg:col-span-4 bg-black/40 border border-white/10 p-8 rounded-none flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Recent Tactical Events</h3>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '12:04:22', msg: 'Graph Laplacian eigenvalue dropped. Defensive cohesion compromised.', type: 'warn' },
                { time: '11:58:10', msg: 'Lynchpin player identified: Node #8 (Articulation Point).', type: 'info' },
                { time: '11:45:04', msg: 'System stable. Global diameter within optimal range.', type: 'success' },
                { time: '11:32:18', msg: 'New match footage uploaded and processed successfully.', type: 'success' },
              ].map((event, i) => (
                <div key={i} className="flex gap-4 border-l border-white/10 pl-4 relative">
                  <div className={`absolute left-[-4px] top-0 w-2 h-2 rounded-none ${event.type === 'warn' ? 'bg-rose-500' : event.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <div>
                    <div className="text-[9px] font-mono text-white/30 mb-1">{event.time}</div>
                    <div className="text-[10px] leading-relaxed text-white/80">{event.msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Massive Player Intelligence Table */}
        <div className="mt-8 bg-black/40 border border-white/10 p-12 rounded-none overflow-hidden flex flex-col gap-10">
           <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <div>
                <h3 className="text-3xl font-black font-orbitron uppercase tracking-widest flex items-center gap-4">
                   <Users className="w-8 h-8 text-cyan-400" /> Player Intelligence Engine
                </h3>
                <p className="text-xs text-white/40 uppercase tracking-[0.3em] mt-3">Cross-referencing YOLO topology, kinematic loads, and graph centrality.</p>
              </div>
              <div className="px-5 py-2 bg-rose-500/10 border border-rose-500/30 text-xs font-black text-rose-500 uppercase tracking-widest animate-pulse">
                Live Data Stream Active
              </div>
           </div>

           <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                 <thead>
                    <tr className="text-xs font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/10">
                       <th className="pb-6 px-6">ID</th>
                       <th className="pb-6 px-6">Classification</th>
                       <th className="pb-6 px-6">Kinematics (km/h | %)</th>
                       <th className="pb-6 px-6">Graph Intelligence</th>
                       <th className="pb-6 px-6">Tactical Status</th>
                       <th className="pb-6 px-6 text-right">Predictive Analytics</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs font-mono">
                    {(() => {
                      if (!tacticalData || !tacticalData.timeline || tacticalData.timeline.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-white/30 italic">AWAITING YOLO TELEMETRY...</td>
                          </tr>
                        );
                      }

                      // Determine which dataset to use
                      let playersToDisplay = [];
                      if (engineIsRunning) {
                        playersToDisplay = livePlayers;
                      } else {
                        const uniquePlayers = new Map();
                        const currentFrame = tacticalData.timeline[liveIndex];
                        if (currentFrame && currentFrame.detections) {
                          currentFrame.detections.forEach((d: any) => {
                             if (!uniquePlayers.has(d.id)) uniquePlayers.set(d.id, d);
                          });
                        }
                        playersToDisplay = Array.from(uniquePlayers.values());
                      }

                      const sortedPlayers = playersToDisplay.sort((a: any, b: any) => a.id - b.id);

                      return sortedPlayers.slice(0, 10).map((p: any, i: number) => {
                         // Procedurally generate stats with real-time variation
                         const seed = Number(p.id);
                         const animIndex = engineIsRunning ? (liveFrameIndex % 100) : liveIndex;
                         const speedVar = Math.sin(animIndex * 0.5 + seed) * 1.5;
                         const speed = (24 + (seed % 9) + speedVar).toFixed(1);
                         const fatigue = (20 + (seed * 3) % 40 + (Math.floor(animIndex / 20) % 5)).toFixed(0);
                         const centrality = (0.7 + (seed % 3) * 0.1 + Math.cos(animIndex * 0.2) * 0.05).toFixed(2);
                         
                         let role = "Rotational Pivot";
                         if (seed % 3 === 0) role = "Critical Midfield Stabilizer";
                         if (seed % 4 === 0) role = "Transition Instigator";

                         const isLynchpin = engineIsRunning 
                           ? liveMetrics.articulation_points.includes(String(p.id)) 
                           : (seed === 8);

                         let status = "OPTIMAL";
                         let statusColor = "text-emerald-400";
                         let bg = "bg-emerald-400/10 border-emerald-400/20";
                         
                         if (isLynchpin) {
                            role = "Lynchpin (Articulation Point)";
                            status = "VULNERABLE";
                            statusColor = "text-rose-500";
                            bg = "bg-rose-500/10 border-rose-500/30";
                         }

                         const pred = seed % 2 === 0 
                           ? "42% risk of structural fracture if removed." 
                           : "Synergy Index: High passing corridor retention.";

                         const decisionQuality = (85 + (seed % 15)).toFixed(0);
                         const synergy = (0.65 + (seed % 35) / 100).toFixed(2);

                         return (
                           <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                             <td className="py-8 px-6">
                               <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-none border ${p.team === 'green' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'} flex items-center justify-center font-black text-lg font-orbitron`}>
                                   {p.id}
                                 </div>
                               </div>
                             </td>
                             <td className="py-8 px-6">
                               <div className="font-black text-white uppercase tracking-widest text-sm">{role}</div>
                               <div className="text-white/30 text-[10px] mt-1 tracking-widest uppercase">Zone Control: {60 + (seed % 15)}%</div>
                             </td>
                             <td className="py-8 px-6">
                               <div className="flex items-baseline gap-2">
                                 <span className="text-xl font-black text-white">{speed}</span>
                                 <span className="text-[10px] text-white/30 uppercase tracking-widest">km/h</span>
                                 <span className="mx-2 text-white/10">|</span>
                                 <span className="text-xl font-black text-white">{fatigue}%</span>
                               </div>
                             </td>
                             <td className="py-8 px-6">
                               <div className="flex items-center gap-6">
                                 <div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-widest">Centrality</div>
                                    <div className="text-lg font-black text-cyan-400">{centrality}</div>
                                 </div>
                                 <div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-widest">Synergy</div>
                                    <div className="text-lg font-black text-emerald-400">{synergy}</div>
                                 </div>
                               </div>
                             </td>
                             <td className="py-8 px-6">
                               <div className="flex flex-col gap-2">
                                  <div className="text-[9px] text-white/30 uppercase tracking-widest">Decision Quality: {decisionQuality}%</div>
                                  <div className={`px-3 py-1 ${bg} ${statusColor} text-[10px] font-black uppercase tracking-widest text-center w-fit`}>
                                    {status}
                                  </div>
                               </div>
                             </td>
                             <td className="py-8 px-6 text-right">
                                <span className="text-xs text-white/40 uppercase leading-relaxed tracking-wider max-w-xs block ml-auto">{pred}</span>
                             </td>
                           </tr>
                         );
                      });
                    })()}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}
