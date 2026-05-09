"use client";

import React from 'react';
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
  Cell
} from 'recharts';
import { Brain, ShieldAlert, Zap, Target, Cpu } from 'lucide-react';

const COLORS = ['#c8e86e', '#3b82f6', '#a78bfa'];

export default function InsightsPage() {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    fetch('/api/telemetry')
      .then(res => res.json())
      .then(data => setTelemetry(data))
      .catch(console.error);
  }, []);

  if (!telemetry) {
    return (
      <main className="min-h-screen bg-transparent text-black dark:text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
        <Navbar />
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white text-black uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              AI Insights
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">Loading AI data...</p>
          </div>
        </div>
      </main>
    );
  }

  const summary = telemetry.summary;

  const formationData = [
    { name: 'Defensive', val: 94 },
    { name: 'Midfield', val: 88 },
    { name: 'Attacking', val: 82 },
  ];

  return (
    <main className="min-h-screen bg-transparent text-black dark:text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white text-black uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            AI Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">Our proprietary neural network processes match telemetry to generate tactical recommendations and injury risk assessments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Insights List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" />
               Critical Recommendations
            </h2>
            
            <div className="space-y-4">
              {[
                { title: 'Defensive Line Integrity Warning', desc: 'Back four spacing exceeded 18m threshold. Vertical gap detected between CD and LB.', level: 'HIGH', icon: Target, color: 'text-red-400' },
                { title: 'Substitution Window: P7 (ST)', desc: 'Sprint frequency dropped 22% in last 10 mins. Fatigue index: 84%. Recommended sub at 65\'.', level: 'CRITICAL', icon: Brain, color: 'text-orange-400' },
                { title: 'Tactical Overload Detected', desc: 'Green Team exploiting right flank over-rotation. 3-v-1 situation developing.', level: 'MODERATE', icon: Zap, color: 'text-blue-400' }
              ].map((insight, i) => (
                <Card key={i} className="hover:bg-white/[0.02] transition-colors border-white/5">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${insight.color}`}>
                      <insight.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white tracking-tight">{insight.title}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-current ${insight.color} opacity-60`}>
                          {insight.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{insight.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Side Metrics - AI Confidence */}
          <div className="space-y-8">
            <Card className="bg-zinc-900/40">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-gray-400 uppercase tracking-widest">Formation Stability Score</CardTitle>
                <CardDescription>Real-time integrity metrics per zone</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formationData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={60} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                       {formationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-[#c8e86e]/20">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-[#c8e86e] uppercase tracking-widest flex items-center gap-2">
                   <Cpu className="w-4 h-4" />
                   Processing Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-gray-500">
                     <span>GPU_UTILIZATION</span>
                     <span>64%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full w-[64%] bg-[#c8e86e]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-gray-500">
                     <span>INFERENCE_TIME</span>
                     <span>{summary ? (summary.avg_inference_time * 1000).toFixed(1) : '12.4'}ms</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full w-[40%] bg-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
