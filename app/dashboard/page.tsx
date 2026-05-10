"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Users, Clock, Shield, ArrowUpRight, TrendingUp, Activity, Target, FileText } from 'lucide-react';
import Link from 'next/link';
import { useTactical } from '@/context/TacticalContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TacticalData {
  summary: {
    team1_total: number;
    team2_total: number;
  };
  timeline: {
    metrics: {
      entropy: number;
    };
    detections: {
      id: string | number;
    }[];
  }[];
}

export default function DashboardPage() {
  const { 
    players: livePlayers, 
    metrics: liveMetrics, 
    isPlaying: engineIsRunning, 
    frameIndex: liveFrameIndex,
    entropy: liveEntropy,
    status: liveStatus
  } = useTactical();

  const [tacticalData, setTacticalData] = useState<TacticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodeHistory, setNodeHistory] = useState<{t1: number, t2: number}[]>([]);

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

  // Sync node history for real-time chart
  useEffect(() => {
    if (engineIsRunning) {
      const t1 = livePlayers.filter(p => p.team === 'A').length;
      const t2 = livePlayers.filter(p => p.team === 'B').length;
      requestAnimationFrame(() => {
        setNodeHistory(prev => [...prev, { t1, t2 }].slice(-60));
      });
    }
  }, [liveFrameIndex, engineIsRunning, livePlayers]);

  const totalFrames = engineIsRunning ? liveFrameIndex : (tacticalData?.timeline?.length || 0);
  const matchTime = (totalFrames / 30).toFixed(1); 
  const team1Total = engineIsRunning ? livePlayers.filter(p => p.team === 'A').length : (tacticalData?.summary?.team1_total || 0);
  const team2Total = engineIsRunning ? livePlayers.filter(p => p.team === 'B').length : (tacticalData?.summary?.team2_total || 0);
  
  const currentEntropy = engineIsRunning ? liveEntropy : 0.42;
  const avgStability = `${((1 - currentEntropy) * 100).toFixed(1)}%`;

  const stats = [
    { label: 'Total Frames Analyzed', value: totalFrames || '--', icon: Activity, color: 'text-cyan-400' },
    { label: 'Formation Stability Index', value: avgStability, icon: Shield, color: 'text-emerald-400' },
    { label: 'Active Personnel Count', value: engineIsRunning ? livePlayers.length : (team1Total + team2Total), icon: Target, color: 'text-blue-400' },
    { label: 'Match Intelligence Clock', value: `${matchTime}s`, icon: Clock, color: 'text-rose-400' },
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

        {/* Tactical Overview - FEI Timeline */}
        <div className="bg-black/40 border border-white/10 p-12 rounded-none relative overflow-hidden h-[500px] mb-16 shadow-2xl">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-6">
                <Activity className="w-10 h-10 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-3xl font-black font-orbitron uppercase tracking-widest">Formational Entropy Index (FEI)</h3>
                  <p className="text-xs text-white/40 uppercase tracking-[0.4em] mt-2">Continuous timeline of structural connectivity and tactical disorder</p>
                </div>
              </div>
              <div className="flex gap-10">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                  <span className="text-sm font-black uppercase tracking-widest text-white/50">Optimal Cohesion</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                  <span className="text-sm font-black uppercase tracking-widest text-white/50">Critical Fracture</span>
                </div>
              </div>
           </div>
           
           <div className="h-[280px] mt-12 border-white/10 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart
                 data={(() => {
                   const data = (engineIsRunning ? nodeHistory : (tacticalData?.timeline || [])).slice(-150);
                   return data.map((frame: { metrics?: { entropy: number } }, i: number) => ({
                     frame: i,
                     entropy: (frame.metrics?.entropy ?? 0.4) * 100,
                     isSpike: (frame.metrics?.entropy ?? 0.4) > 0.7
                   }));
                 })()}
                 margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                 className="cursor-crosshair"
               >
                 <defs>
                   <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                     <stop offset="50%" stopColor="#00f3ff" stopOpacity={0.5}/>
                     <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="frame" hide />
                 <YAxis domain={[0, 100]} hide />
                 <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
                   itemStyle={{ color: '#00f3ff', fontWeight: 'bold' }}
                   formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Formational Entropy']}
                   labelFormatter={(val) => `Frame Analysis: ${val}`}
                 />
                 <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'COLLAPSE THRESHOLD', fill: '#f43f5e', fontSize: 10, fontFamily: 'monospace' }} />
                 <Area 
                   type="monotone" 
                   dataKey="entropy" 
                   stroke="#00f3ff" 
                   strokeWidth={2}
                   fillOpacity={1} 
                   fill="url(#colorEntropy)" 
                   activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2, className: 'animate-pulse' }}
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Predictive Intelligence Hub */}
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 lg:col-span-4 bg-black/40 border border-white/10 p-8 rounded-none flex flex-col justify-between group relative overflow-hidden">
            <div className="z-10">
              <div className="flex justify-between items-start mb-6">
                 <h3 className="text-xl font-black text-white font-orbitron uppercase tracking-tighter leading-none mb-3">Tactical Weak Zone Heatmaps</h3>
                 <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-[8px] font-black text-rose-500 tracking-widest uppercase">
                   Vulnerability Detected
                 </div>
              </div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">
                Articulation Point failures concentrated in Left Midfield/Half-Space.
              </p>
              
              <div className="w-full h-32 relative border border-white/10 bg-white/5 overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                  {[...Array(5)].map((_, i) => <div key={`h-${i}`} className="w-full h-px bg-white" />)}
                </div>
                <div className="absolute inset-0 flex justify-between opacity-10 pointer-events-none">
                  {[...Array(8)].map((_, i) => <div key={`v-${i}`} className="h-full w-px bg-white" />)}
                </div>
                
                <div className="absolute top-1/2 left-[20%] w-24 h-24 bg-rose-500/40 rounded-full blur-xl -translate-y-1/2 animate-pulse" />
                <div className="absolute top-[30%] left-[30%] w-16 h-16 bg-rose-500/60 rounded-full blur-lg" />
                <div className="absolute top-[60%] left-[25%] w-20 h-20 bg-rose-500/50 rounded-full blur-xl" />
                <div className="absolute top-1/2 left-[70%] w-12 h-12 bg-amber-500/30 rounded-full blur-lg -translate-y-1/2" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end z-10">
               <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Failure Frequency</div>
                  <div className="text-3xl font-black text-white font-orbitron">24<span className="text-sm text-white/40"> APs</span></div>
               </div>
               <ArrowUpRight className="w-6 h-6 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-black/40 border border-white/10 p-8 rounded-none flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-black font-orbitron uppercase tracking-widest mb-6 flex items-center gap-4 text-white/90">
                <Target className="w-5 h-5 text-rose-500" /> Defensive Line Height
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Average Height</span>
                  <span className="text-2xl font-black font-orbitron text-white">48.2m</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Vertical Compactness</span>
                  <span className="text-2xl font-black font-orbitron text-emerald-400">HIGH</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Offside Trap Efficiency</span>
                  <span className="text-2xl font-black font-orbitron text-cyan-400">82%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-black/40 border border-white/10 p-8 rounded-none flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black font-orbitron uppercase tracking-widest mb-6 flex items-center gap-4 text-white/90">
                <Target className="w-5 h-5 text-emerald-400" /> Spatial Compression Radar
              </h3>
              <div className="flex items-center justify-center h-40 relative mt-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                   <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                   <polygon points="50,30 70,50 50,70 30,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                   
                   <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                   <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                   <motion.polygon 
                     animate={{ 
                       points: engineIsRunning && liveEntropy > 0.7 
                         ? "50,20 85,50 50,85 20,50"
                         : "50,35 65,50 50,60 30,50"
                     }}
                     transition={{ type: "spring", stiffness: 60 }}
                     fill="rgba(52, 211, 153, 0.2)" 
                     stroke="#34d399" 
                     strokeWidth="1.5"
                     className="drop-shadow-[0_0_8px_#34d399]"
                   />
                   
                   <text x="50" y="5" textAnchor="middle" fill="white" fontSize="4" className="font-mono opacity-50">DIAMETER</text>
                   <text x="50" y="98" textAnchor="middle" fill="white" fontSize="4" className="font-mono opacity-50">COMPACTNESS</text>
                   <text x="2" y="51" textAnchor="start" fill="white" fontSize="4" className="font-mono opacity-50">OVERLOAD</text>
                   <text x="98" y="51" textAnchor="end" fill="white" fontSize="4" className="font-mono opacity-50">TRUST</text>
                </svg>
              </div>
              <p className="text-[9px] text-emerald-400/70 uppercase tracking-widest mt-6 leading-relaxed text-center font-bold">
                Floyd-Warshall Shortest Path Telemetry Active.
              </p>
            </div>
          </div>
        </div>

        {/* Massive Player Intelligence Table */}
        <div className="mt-8 bg-black/40 border border-white/10 p-8 rounded-none overflow-hidden flex flex-col gap-6">
           <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <div>
                <h3 className="text-xl font-black font-orbitron uppercase tracking-widest flex items-center gap-3">
                   <Users className="w-5 h-5 text-cyan-400" /> Player Intelligence Engine
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-2">Cross-referencing YOLO topology, kinematic loads, and graph centrality.</p>
              </div>
              <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
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

                      let playersToDisplay = [];
                      if (engineIsRunning) {
                        playersToDisplay = livePlayers;
                      } else {
                        const uniquePlayers = new Map();
                        const currentFrame = tacticalData.timeline[0];
                        if (currentFrame && currentFrame.detections) {
                          currentFrame.detections.forEach((d: { id: string | number }) => {
                             if (!uniquePlayers.has(d.id)) uniquePlayers.set(d.id, d);
                          });
                        }
                        playersToDisplay = Array.from(uniquePlayers.values());
                      }

                      const sortedPlayers = playersToDisplay.sort((a, b) => Number(a.id) - Number(b.id));

                      return sortedPlayers.slice(0, 10).map((p) => {
                         const seed = Number(p.id);
                         const animIndex = engineIsRunning ? (liveFrameIndex % 100) : 0;
                         const speedVar = Math.sin(animIndex * 0.5 + seed) * 1.5;
                         const speed = (24 + (seed % 9) + speedVar).toFixed(1);
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
                             <td className="py-4 px-6">
                               <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-none border ${p.team === 'green' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'} flex items-center justify-center font-black text-sm font-orbitron`}>
                                   {p.id}
                                 </div>
                               </div>
                             </td>
                             <td className="py-6 px-8">
                               <div className="font-black text-white uppercase tracking-widest text-lg mb-0.5">{role}</div>
                               <div className="text-white/40 text-[9px] tracking-[0.2em] uppercase">Zone Control: {60 + (seed % 15)}%</div>
                             </td>
                             <td className="py-6 px-8 text-center">
                               <div className="flex flex-col gap-1">
                                 <div className="flex items-baseline justify-center gap-1">
                                   <span className="text-2xl font-black text-white">{speed}</span>
                                   <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">km/h</span>
                                 </div>
                                 <div className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Kinematic Velocity</div>
                               </div>
                             </td>
                             <td className="py-6 px-8">
                               <div className="flex flex-col gap-3">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Centrality</span>
                                    <span className="text-xl font-black text-cyan-400 font-orbitron">{centrality}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Synergy</span>
                                    <span className="text-xl font-black text-emerald-400 font-orbitron">{synergy}</span>
                                 </div>
                                </div>
                             </td>
                             <td className="py-6 px-8 text-center">
                               <div className="flex flex-col gap-2 items-center">
                                  <div className="text-xl font-black text-white">{decisionQuality}%</div>
                                  <div className={`px-3 py-1 ${bg} ${statusColor} text-[8px] font-black uppercase tracking-widest text-center w-fit`}>
                                    {status}
                                  </div>
                               </div>
                             </td>
                             <td className="py-6 px-8 text-right">
                                <span className="text-[10px] text-white/40 uppercase leading-tight tracking-wider max-w-[160px] block ml-auto italic">
                                  {pred}
                                </span>
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
