"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell
} from 'recharts';
import { Layers, Database, Cpu, Camera, Network, Globe } from 'lucide-react';

const pipelineData = [
  { name: 'Capture', val: 100 },
  { name: 'Pose', val: 95 },
  { name: 'Motion', val: 88 },
  { name: 'AI', val: 92 },
  { name: 'Insight', val: 85 },
];

export default function TechnologyPage() {
  return (
    <main className="min-h-screen bg-[#080c08] text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1 bg-[#c8e86e]/10 border border-[#c8e86e]/20 rounded-full text-[10px] font-mono text-[#c8e86e] uppercase tracking-[0.2em] mb-4">
            <Layers className="w-3 h-3" /> System Architecture
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            The <span className="text-[#c8e86e]">Technology</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">A specialized computer vision pipeline engineered for low-latency athletic motion tracking on consumer hardware.</p>
        </div>

        {/* Vision Pipeline Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Vision Intelligence Pipeline</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Raw Image Acquisition', desc: 'Capturing 60FPS streams from commodity 2D cameras.', icon: Camera },
                { step: 2, title: 'Landmark Extraction', desc: 'MediaPipe-powered 33-point skeletal pose estimation.', icon: Network },
                { step: 3, title: 'Spatial Translation', desc: 'OpenCV calculation for real-world coordinate mapping.', icon: Database },
                { step: 4, title: 'Neural Inference', desc: 'Proprietary AI forecasting fatigue & injury risks.', icon: Cpu }
              ].map((s, i) => (
                <Card key={i} className="group hover:border-[#c8e86e]/20 transition-all border-white/5">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="text-4xl font-black text-white/5 group-hover:text-[#c8e86e]/10 transition-colors tabular-nums">{s.step}</div>
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-[#c8e86e]/5 transition-colors">
                      <s.icon className="w-5 h-5 text-gray-400 group-hover:text-[#c8e86e] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white uppercase tracking-tight text-sm">{s.title}</h3>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="bg-zinc-900/40 border-white/5">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-gray-400 uppercase tracking-widest">Pipeline Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Bar dataKey="val" fill="#c8e86e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="pt-16 space-y-10">
          <div className="text-center">
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.4em]">Core Stack Components</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['OpenCV', 'MediaPipe', 'FastAPI', 'React', 'Tailwind', 'WebSockets'].map((t, i) => (
              <Card key={i} className="p-6 text-center hover:bg-white/5 transition-colors">
                <span className="text-xs font-bold font-mono text-gray-400 tracking-tighter">{t}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Scalability Vision */}
        <Card className="border-[#c8e86e]/30 bg-gradient-to-br from-[#c8e86e]/5 to-transparent">
          <CardContent className="p-12 text-center space-y-6">
            <Globe className="w-12 h-12 text-[#c8e86e] mx-auto opacity-50" />
            <h2 className="text-3xl font-black uppercase tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>Democratizing Elite Intelligence</h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Our architecture is designed to scale across environments where expensive wearable hardware is inaccessible. By leveraging commodity 2D cameras and edge-optimized AI, we put the same data advantage used by professional leagues into the hands of schools and grassroots academies.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
