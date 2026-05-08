"use client";

import React from 'react';
import FadeIn from './FadeIn';

const classifications = [
  { action: "Sprinting", confidence: "98%", color: "text-blue-400" },
  { action: "High Intensity Jump", confidence: "94%", color: "text-purple-400" },
  { action: "Active Recovery", confidence: "89%", color: "text-green-400" },
  { action: "Lateral Movement", confidence: "92%", color: "text-yellow-400" },
];

export default function ClassifyUI() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 bg-black">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Real-time <span className="text-blue-500">Action Classification</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl">
            Our AI vision engine processes 60 frames per second to identify and categorize specific athletic movements with sub-second latency.
          </p>
          
          <div className="space-y-4">
            {classifications.map((item, i) => (
              <FadeIn key={item.action} delay={200 * i} className="w-full">
                <div className="liquid-glass border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')} animate-pulse`}></div>
                    <span className="font-medium">{item.action}</span>
                  </div>
                  <span className={`text-sm font-mono ${item.color}`}>{item.confidence} CONFIDENCE</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="relative aspect-square md:aspect-video bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
          {/* Mock AI Tracking Overlay */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-2 border border-white/20 rounded bg-black/40 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Stream Source</p>
                <p className="text-xs font-mono">CAM_01_SOUTH</p>
              </div>
              <div className="p-2 border border-white/20 rounded bg-black/40 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Processing</p>
                <p className="text-xs font-mono text-blue-400">GPU_LOAD: 42%</p>
              </div>
            </div>
            
            {/* Skeletal tracking mock */}
            <div className="relative w-full h-full flex items-center justify-center">
               <svg className="w-64 h-64 text-blue-500/40" viewBox="0 0 100 100">
                 <circle cx="50" cy="20" r="3" fill="currentColor" />
                 <line x1="50" y1="20" x2="50" y2="50" stroke="currentColor" strokeWidth="1" />
                 <line x1="50" y1="30" x2="30" y2="40" stroke="currentColor" strokeWidth="1" />
                 <line x1="50" y1="30" x2="70" y2="40" stroke="currentColor" strokeWidth="1" />
                 <line x1="50" y1="50" x2="35" y2="80" stroke="currentColor" strokeWidth="1" />
                 <line x1="50" y1="50" x2="65" y2="80" stroke="currentColor" strokeWidth="1" />
               </svg>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500/20 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>

            <div className="flex justify-center">
               <div className="px-4 py-2 bg-blue-500 rounded-full text-xs font-bold tracking-widest text-black">
                 CLASSIFYING: SPRINT
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
