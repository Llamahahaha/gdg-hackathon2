"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Camera, Activity, AlertCircle, Zap, TrendingUp, Timer, Users } from 'lucide-react';

const radialData = [
  { name: 'Fatigue', value: 74, fill: '#fb923c' },
];

const activityData = [
  { time: '1s', val: 12 },
  { time: '2s', val: 15 },
  { time: '3s', val: 14 },
  { time: '4s', val: 18 },
  { time: '5s', val: 22 },
  { time: '6s', val: 20 },
  { time: '7s', val: 25 },
];

export default function LivePage() {
  return (
    <main className="min-h-screen bg-transparent text-black dark:text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter dark:text-white text-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              LIVE TRACKING
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              SYSTEM_LIVE // SESSION_ID: PP-8821
            </div>
          </div>
          <button className="px-6 py-3 bg-[#c8e86e] text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(200,232,110,0.3)]">
            Initialize Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed - Tactical View */}
          <Card className="lg:col-span-3 overflow-hidden border-[#c8e86e]/20">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#c8e86e]" />
                  TACTICAL_OVERLAY_V2.0
                </CardTitle>
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> LATENCY: 12MS</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> DETECTED: 22</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-black aspect-video relative group">
              {/* Field Grid */}
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#c8e86e 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 border-2 border-[#c8e86e]/30 rounded-full flex items-center justify-center animate-spin-slow">
                  <div className="w-12 h-12 border border-[#c8e86e]/50 rounded-full" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-mono text-[#c8e86e] tracking-widest animate-pulse">AWAITING_VIDEO_INPUT</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Connecting to vision engine pipeline...</p>
                </div>
              </div>

              {/* Corner UI */}
              <div className="absolute top-4 left-4 p-2 bg-black/60 border border-white/10 rounded backdrop-blur-md">
                <div className="text-[10px] font-mono text-gray-400">POS_ENGINE: <span className="text-blue-400">ACTIVE</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Side Panel - Live Insights */}
          <div className="space-y-6">
            {/* Fatigue Radial */}
            <Card className="bg-zinc-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-gray-400 uppercase">Avg. Fatigue Risk</CardTitle>
              </CardHeader>
              <CardContent className="h-[180px] p-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={30}
                    />
                    <text
                      x="50%"
                      y="70%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-2xl font-black font-mono"
                    >
                      74%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Live Alerts */}
            <Card className="flex-1 border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-xs font-mono flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  LIVE_ALERTS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 border border-red-500/20 bg-red-500/10 rounded text-[10px] font-mono">
                  <span className="text-red-400 font-bold">[!]</span> FATIGUE_THRESHOLD_EXCEEDED (P7)
                </div>
                <div className="p-2 border border-blue-500/20 bg-blue-500/10 rounded text-[10px] font-mono">
                  <span className="text-blue-400 font-bold">[i]</span> TACTICAL_FORMATION_SHIFT
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Avg. Speed', val: '24.2', unit: 'km/h', icon: TrendingUp, color: '#c8e86e' },
            { label: 'Max Intensity', val: '92%', unit: '', icon: Zap, color: '#3b82f6' },
            { label: 'Match Time', val: '00:00', unit: '', icon: Timer, color: '#a78bfa' },
            { label: 'Active Players', val: '22', unit: '', icon: Users, color: '#f472b6' }
          ].map((m, i) => (
            <Card key={i} className="hover:border-white/20 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono">{m.val}</span>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{m.unit}</span>
                  </div>
                </div>
                <m.icon className="w-8 h-8 opacity-20" style={{ color: m.color }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
