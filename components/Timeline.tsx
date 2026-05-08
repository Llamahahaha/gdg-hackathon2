"use client";

import React, { useEffect, useState } from 'react';

const events = [
  { time: "00:00", label: "Match Start", type: "system" },
  { time: "08:24", label: "Max Speed: 32km/h", type: "perf", desc: "Player 7 reached peak velocity during counter-attack" },
  { time: "15:40", label: "Fatigue Alert", type: "warning", desc: "Average team stamina dropped below 80%" },
  { time: "22:15", label: "Tactical Shift", type: "system", desc: "Formation transition detected: 4-3-3 to 4-4-2" },
  { time: "34:10", label: "High Intensity Burst", type: "perf", desc: "Player 11 completed 4 consecutive sprints" },
];

export default function Timeline() {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % events.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Event <span className="text-blue-500">Timeline</span></h2>
          <p className="text-gray-400">Automatic event logging and performance milestone tracking.</p>
        </div>

        <div className="relative border-l border-white/10 ml-4 md:ml-0">
          {events.map((event, i) => (
            <div 
              key={i} 
              className={`mb-12 ml-8 transition-all duration-500 transform ${i === activeIndex ? "scale-105 opacity-100" : "opacity-40 scale-100"}`}
            >
              {/* Dot */}
              <div className={`absolute -left-[37px] w-4 h-4 rounded-full border-4 border-black transition-colors duration-500 ${
                i === activeIndex ? (event.type === 'warning' ? 'bg-red-500' : 'bg-blue-500') : 'bg-zinc-700'
              }`}></div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <span className="font-mono text-blue-500 text-sm">{event.time}</span>
                <h3 className="text-xl font-bold">{event.label}</h3>
              </div>
              
              {event.desc && (
                <p className="text-gray-400 mt-2 max-w-lg leading-relaxed">
                  {event.desc}
                </p>
              )}

              {i === activeIndex && (
                <div className="mt-4 flex gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-tighter text-gray-500">Automated Log</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-tighter text-gray-500">Vision Analysis</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
