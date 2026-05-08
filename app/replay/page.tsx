"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from 'recharts';
import { PlayCircle, Clock, FastForward, History, Share2, Download } from 'lucide-react';

const eventData = [
  { time: '0m', events: 0 },
  { time: '10m', events: 4 },
  { time: '20m', events: 8 },
  { time: '30m', events: 5 },
  { time: '40m', events: 12 },
  { time: '50m', events: 9 },
  { time: '60m', events: 15 },
  { time: '70m', events: 11 },
  { time: '80m', events: 18 },
  { time: '90m', events: 6 },
];

export default function ReplayPage() {
  return (
    <main className="min-h-screen bg-[#080c08] text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              REPLAY <span className="text-[#c8e86e]">CENTER</span>
            </h1>
            <p className="text-gray-400 max-w-xl leading-relaxed">Review match performance with synchronized AI-vision data overlays and event-based quick seek.</p>
          </div>
          <div className="flex gap-4 pb-2">
             <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
               <Share2 className="w-5 h-5 text-gray-400" />
             </button>
             <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
               <Download className="w-5 h-5 text-gray-400" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Replay Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden bg-black border-white/5 shadow-2xl">
              <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center space-y-4 relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <PlayCircle className="w-16 h-16 text-[#c8e86e]/80 hover:text-[#c8e86e] cursor-pointer transition-all hover:scale-110" />
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Select an event from the timeline</p>
                
                {/* HUD Elements */}
                <div className="absolute top-4 left-4 p-2 bg-black/60 rounded border border-white/10 text-[8px] font-mono text-[#c8e86e] tracking-widest">
                  AI_VISION_OVERLAY: <span className="text-white">ENABLED</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <Clock className="w-4 h-4 text-gray-500" />
                   <span className="text-xs font-mono text-gray-300">00:00 / 90:00</span>
                </div>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden relative">
                   <div className="absolute left-0 top-0 h-full w-[30%] bg-[#c8e86e]" />
                </div>
                <div className="flex items-center gap-2">
                   <FastForward className="w-4 h-4 text-gray-500" />
                   <span className="text-[10px] font-mono text-gray-500 tracking-tighter">2.0X</span>
                </div>
              </div>
            </Card>

            <Card>
               <CardHeader>
                 <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    MATCH_EVENT_FREQUENCY
                 </CardTitle>
               </CardHeader>
               <CardContent className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={eventData}>
                     <defs>
                       <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                     <XAxis dataKey="time" stroke="#4b5563" fontSize={10} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                     />
                     <Area type="monotone" dataKey="events" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEvents)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </CardContent>
            </Card>
          </div>

          {/* Event Timeline */}
          <div className="space-y-6">
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Match Timeline</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '12:40', label: 'Explosive Sprint Detected', p: 'P7', color: 'text-[#c8e86e]' },
                { time: '24:15', label: 'Tactical Formation Shift', p: 'TEAM', color: 'text-blue-400' },
                { time: '38:02', label: 'Intensity Peak Reached', p: 'P12', color: 'text-purple-400' },
                { time: '42:11', label: 'Acceleration Threshold Exceeded', p: 'P7', color: 'text-[#c8e86e]' },
                { time: '58:30', label: 'Defensive Line Collapse', p: 'TEAM', color: 'text-red-400' },
                { time: '74:20', label: 'Sprint Recovery Delayed', p: 'P4', color: 'text-orange-400' },
              ].map((ev, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all cursor-pointer">
                  <div className="text-[10px] font-mono text-gray-500 w-10">{ev.time}</div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-white tracking-tight">{ev.label}</p>
                    <p className={`text-[10px] font-mono uppercase tracking-widest ${ev.color}`}>{ev.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
