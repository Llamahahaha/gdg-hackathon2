import React from 'react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';
import TacticalBackground from './TacticalBackground';
import { Activity, Zap, Target, Hexagon } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-charcoal">
      <TacticalBackground />

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col px-6 md:px-12 lg:px-16 justify-center">
        <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Tactical Intelligence Active</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white font-orbitron leading-none">
              Field<span className="text-cyan-500">Theory</span> <span className="text-3xl align-top bg-cyan-500/20 text-cyan-400 px-2 rounded">AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-xl leading-tight">
              Real-Time Tactical Intelligence Powered by <span className="text-white font-medium">Spatio-Temporal Graph Analytics</span>.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-cyan-500 text-black px-8 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:scale-105 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                Launch Intelligence Suite
              </button>
              <button className="liquid-glass border border-white/10 text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:bg-white/10">
                Documentation
              </button>
            </div>
          </div>

          {/* Right Column: Metric Panels */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { label: "Formation Entropy", value: "0.142", status: "STABLE", icon: Activity, color: "text-cyan-400" },
              { label: "Tactical Stability", value: "98.4%", status: "OPTIMAL", icon: Zap, color: "text-blue-500" },
              { label: "Team Compactness", value: "24.5m", status: "HIGH", icon: Target, color: "text-white" },
              { label: "Lynchpin Detection", value: "ID: #7", status: "DETECTED", icon: Hexagon, color: "text-rose-500" }
            ].map((panel, i) => (
              <FadeIn key={i} delay={400 + (i * 100)} duration={800}>
                <div className="liquid-glass p-6 rounded-2xl border border-white/5 space-y-3 hover:border-cyan-500/30 transition-colors group">
                  <div className="flex justify-between items-start">
                    <panel.icon className={`w-5 h-5 ${panel.color}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{panel.status}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{panel.label}</div>
                    <div className="text-3xl font-black font-orbitron text-white group-hover:text-cyan-400 transition-colors">{panel.value}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-10 left-6 md:left-12 lg:left-16 right-6 md:right-12 lg:right-16 flex justify-between items-end">
        <div className="flex gap-8">
           <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Spatio-Temporal Sync</span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">0.00ms Offset</span>
           </div>
           <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Engine Load</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase font-mono">14.2% GFLOPs</span>
           </div>
        </div>
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">
          GDG Hackathon 2026 // Production Release
        </div>
      </div>
    </section>
  );
}
