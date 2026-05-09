"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { History, LayoutPanelLeft, ArrowRight, Save, Trash2, Share2, PlayCircle } from 'lucide-react';

const matchMoments = [
  { id: 1, time: "24:12", event: "Defensive Fracture", type: "warning", desc: "Winger drift created 15m gap in final third." },
  { id: 2, time: "42:05", event: "Midfield Synergy", type: "success", desc: "Triadic closure successful, leading to shot on goal." },
  { id: 3, time: "67:30", event: "Formation Collapse", type: "critical", desc: "Lynchpin player #6 isolated, entropy spike detected." },
];

export default function ReplayLabPage() {
  const [selectedMoment, setSelectedMoment] = useState(matchMoments[0]);

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-6 px-6 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Sidebar: Moment History */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
           <div className="flex items-center gap-2 px-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Replay History // Match 042</span>
           </div>

           <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {matchMoments.map((moment) => (
                <button 
                  key={moment.id}
                  onClick={() => setSelectedMoment(moment)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMoment.id === moment.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-cyan-400">{moment.time}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${moment.type === 'critical' ? 'bg-rose-500/20 text-rose-500' : moment.type === 'warning' ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {moment.type}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{moment.event}</div>
                  <p className="text-[10px] text-gray-500 leading-tight">{moment.desc}</p>
                </button>
              ))}
           </div>

           <button className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all">
              <Save className="w-4 h-4" /> Export Tactical Report
           </button>
        </div>

        {/* Main Area: Before vs After Comparison */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Comparative Visualization</span>
                 <ArrowRight className="w-3 h-3 text-white/20" />
                 <span className="text-[10px] font-bold text-white uppercase">{selectedMoment.event}</span>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg"><Share2 className="w-4 h-4" /></button>
                 <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-rose-500"><Trash2 className="w-4 h-4" /></button>
              </div>
           </div>

           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BEFORE VIEW */}
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">T - 5.0s // Nominal State</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">ENTROPY: 0.24</span>
                 </div>
                 <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:30px_30px]" />
                    {/* Mock Graph Visual */}
                    <svg className="w-full h-full p-8" viewBox="0 0 400 300">
                       <circle cx="200" cy="150" r="4" fill="#00f3ff" />
                       <circle cx="150" cy="100" r="4" fill="#00f3ff" />
                       <circle cx="150" cy="200" r="4" fill="#00f3ff" />
                       <line x1="200" y1="150" x2="150" y2="100" stroke="#00f3ff" strokeWidth="1" strokeOpacity="0.4" />
                       <line x1="200" y1="150" x2="150" y2="200" stroke="#00f3ff" strokeWidth="1" strokeOpacity="0.4" />
                       <line x1="150" y1="100" x2="150" y2="200" stroke="#00f3ff" strokeWidth="1" strokeOpacity="0.4" />
                    </svg>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                       <PlayCircle className="w-4 h-4 text-white/20" />
                       <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Baseline Sync Active</span>
                    </div>
                 </div>
              </div>

              {/* AFTER VIEW */}
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic">T + 0.0s // Critical Event</span>
                    <span className="text-[10px] font-mono text-rose-500 font-bold">ENTROPY: 0.82</span>
                 </div>
                 <div className="flex-1 bg-black/40 rounded-2xl border border-rose-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,0,0,0.05)_1px,transparent_0)] bg-[size:30px_30px]" />
                    {/* Mock Graph Visual (Fractured) */}
                    <svg className="w-full h-full p-8" viewBox="0 0 400 300">
                       <motion.circle 
                         animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                         transition={{ duration: 1, repeat: Infinity }}
                         cx="200" cy="150" r="6" fill="#ff0033" 
                       />
                       <circle cx="100" cy="80" r="4" fill="#00f3ff" />
                       <circle cx="300" cy="220" r="4" fill="#00f3ff" />
                       <line x1="200" y1="150" x2="100" y2="80" stroke="#ff0033" strokeWidth="0.5" strokeOpacity="0.2" />
                       <line x1="200" y1="150" x2="300" y2="220" stroke="#ff0033" strokeWidth="0.5" strokeOpacity="0.2" />
                       <path d="M180 140 L220 160" stroke="#ff0033" strokeWidth="2" />
                    </svg>
                    <div className="absolute top-4 right-4 bg-rose-500/20 border border-rose-500/50 px-2 py-1 rounded">
                       <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Structural Collapse</span>
                    </div>
                 </div>
              </div>

           </div>

           {/* Metrics Comparison */}
           <div className="h-32 grid grid-cols-4 gap-4">
              {[
                { label: "Graph Diameter", before: "12.4m", after: "38.2m", diff: "+208%", color: "rose" },
                { label: "Efficiency", before: "92%", after: "44%", diff: "-52%", color: "rose" },
                { label: "Synergy Bias", before: "0.88", after: "0.12", diff: "-86%", color: "rose" },
                { label: "Recovery Time", before: "--", after: "4.2s", diff: "ESTIMATED", color: "cyan" }
              ].map((m, i) => (
                <div key={i} className="liquid-glass p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                   <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{m.label}</div>
                   <div className="flex items-end justify-between">
                      <div className="text-xl font-black font-orbitron text-white">{m.after}</div>
                      <div className={`text-[10px] font-bold ${m.color === 'rose' ? 'text-rose-500' : 'text-cyan-400'}`}>{m.diff}</div>
                   </div>
                   <div className="text-[8px] font-mono text-white/20">Prev: {m.before}</div>
                </div>
              ))}
           </div>
        </div>

      </main>
    </div>
  );
}
