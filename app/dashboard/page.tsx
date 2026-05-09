"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { BarChart3, Users, Clock, Shield, ArrowUpRight, TrendingUp, Activity, Target, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Matches Analyzed', value: '1,284', icon: Activity, color: 'text-cyan-400' },
    { label: 'Avg. Formation Stability', value: '84.2%', icon: Shield, color: 'text-emerald-400' },
    { label: 'Active Neural Nodes', value: '2,048', icon: Target, color: 'text-blue-400' },
    { label: 'Tactical Uptime', value: '99.9%', icon: Clock, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 px-8 pb-12 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black font-orbitron tracking-tight mb-2 uppercase">Command Center</h1>
              <p className="text-white/40 text-sm font-light uppercase tracking-widest">Spatio-Temporal Intelligence Overview</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => alert('Analyzing spatio-temporal datasets... Tactical Audit generating.')}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all rounded-none flex items-center gap-2 group"
              >
                <FileText className="w-4 h-4 text-cyan-400" /> Generate Intelligence Audit
              </button>
              <Link href="/live" className="px-6 py-3 bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all rounded-none flex items-center gap-2 group">
                Open Live Engine <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/40 border border-white/10 p-6 rounded-none relative overflow-hidden group"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-white/5 border border-white/10 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-white/20" />
              </div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-3xl font-black font-orbitron">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <div className="col-span-12 lg:col-span-8 bg-black/40 border border-white/10 p-8 rounded-none relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest">Formation Stability Index</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-none" />
                  <span className="text-[10px] text-white/40 uppercase">Home</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-none" />
                  <span className="text-[10px] text-white/40 uppercase">Away</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-2 px-4">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${20 + Math.random() * 80}%` }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                  className="flex-1 bg-cyan-500/20 border-t border-cyan-500/40"
                />
              ))}
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div>
                <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Peak Synergy</div>
                <div className="text-xl font-bold font-orbitron text-emerald-400">94.8%</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Stability Variance</div>
                <div className="text-xl font-bold font-orbitron text-white">± 2.4%</div>
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
                { time: '12:04:22', msg: 'Formation entropy threshold exceeded on Right Flank.', type: 'warn' },
                { time: '11:58:10', msg: 'Lynchpin player identified: Node #8 (Articulation Point).', type: 'info' },
                { time: '11:45:04', msg: 'System stable. Global diameter within optimal range.', type: 'success' },
                { time: '11:32:18', msg: 'New match footage uploaded and indexed successfully.', type: 'success' },
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
      </main>
    </div>
  );
}
