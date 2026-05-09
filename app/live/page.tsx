"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Activity, Zap, Target, Hexagon, Play, Pause, SkipBack, SkipForward, AlertTriangle, ChevronRight } from 'lucide-react';

import matchData from '@/public/data/match_telemetry.json';

// --- Mock Data & Helpers ---
const initialPlayers = [
  { id: 1, x: 200, y: 150, name: "P1", team: 'A' },
  { id: 2, x: 300, y: 100, name: "P2", team: 'A' },
  { id: 3, x: 300, y: 200, name: "P3", team: 'A' },
  { id: 4, x: 450, y: 150, name: "P4", team: 'A' },
  { id: 5, x: 100, y: 150, name: "GK", team: 'A' },
  { id: 6, x: 550, y: 150, name: "O1", team: 'B' },
  { id: 7, x: 650, y: 100, name: "O2", team: 'B' },
  { id: 8, x: 650, y: 200, name: "O3", team: 'B' },
];

export default function LiveEnginePage() {
  const [players, setPlayers] = useState(initialPlayers);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [entropy, setEntropy] = useState(0.42);

  // Sync with real match telemetry
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setFrameIndex(prev => {
        const next = (prev + 1) % matchData.timeline.length;
        const currentFrame = matchData.timeline[next];

        if (currentFrame && currentFrame.detections) {
          // Use a Map to filter out duplicate IDs from detections
          const uniqueDetections = new Map();
          currentFrame.detections.forEach((d: any) => {
            if (!uniqueDetections.has(d.id)) {
              uniqueDetections.set(d.id, d);
            }
          });

          const updatedPlayers = Array.from(uniqueDetections.values()).map((d: any) => ({
            id: d.id,
            // Scale coordinates from 1920x1080 to roughly 800x400 for the graph SVG
            x: (d.center[0] / 1920) * 800,
            y: (d.center[1] / 1080) * 400,
            name: `P${d.id}`,
            team: d.team === 'green' ? 'A' : 'B'
          }));
          setPlayers(updatedPlayers);

          // Dynamically compute entropy based on team dispersion (mocked logic)
          setEntropy(0.3 + (Math.abs(Math.sin(next / 50)) * 0.4));
        }

        return next;
      });
    }, 100); // 10 FPS simulated sync

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-6 px-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">

        {/* TOP SECTION: Match Feed (Full Width) */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Match Feed // Live</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              Recording
            </span>
          </div>

          <div className="aspect-video bg-black rounded-xl border border-white/5 overflow-hidden relative group shadow-2xl">
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover opacity-80"
              src="/videos/test.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

            {/* HUD Overlay on Video */}
            <div className="absolute top-4 left-4 space-y-1">
              <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">CAM_01 // WIDE_PITCH</div>
              <div className="text-[10px] font-mono text-white/50">40.2443° N, 3.7121° W</div>
            </div>

            {/* Bounding Box Tracking Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {players.slice(0, 12).map((p, i) => (
                <motion.g
                  key={p.id}
                  animate={{
                    x: p.x,
                    y: p.y
                  }}
                  transition={{ ease: "linear", duration: 0.1 }}
                >
                  <rect
                    x="-15" y="-25"
                    width="30" height="50"
                    fill="transparent"
                    stroke={p.team === 'A' ? "#00f3ff" : "#ff0033"}
                    strokeWidth="1.5"
                    className="opacity-60"
                  />
                  <text y="-30" x="0" textAnchor="middle" fill="white" fontSize="8" className="font-mono bg-black/50">
                    ID:{p.id}
                  </text>
                  <circle cx="0" cy="0" r="2" fill={p.team === 'A' ? "#00f3ff" : "#ff0033"} />
                </motion.g>
              ))}
            </svg>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-white/5 flex flex-col gap-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">Detection Logs</div>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-2 text-white/50 h-24">
              <div className="flex justify-between"><span className="text-cyan-400">[FRM:{frameIndex}]</span> <span>OBJECTS_DETECTED: {players.length}</span></div>
              <div className="flex justify-between"><span className="text-cyan-400">[FRM:{frameIndex}]</span> <span>POSSESSION: {matchData.timeline[frameIndex]?.possession.toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-rose-500">[FRM:{frameIndex}]</span> <span>ENTROPY: {entropy.toFixed(3)}</span></div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Intelligence & Graph (Split) */}
        <div className="grid grid-cols-12 gap-6 pb-24">

          {/* Tactical Graph */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Topological Graph // Live</span>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-cyan-400 font-mono">NODES: 22</span>
                <span className="text-[10px] font-bold text-blue-500 font-mono">EDGES: 142</span>
              </div>
            </div>

            <div className="h-[500px] bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden shadow-inner">
              {/* Pitch Markings */}
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                  backgroundSize: '10% 10%'
                }} />

              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* Edges */}
                {players.map((p, i) => (
                  players.slice(i + 1).map((other) => {
                    const dist = Math.hypot(p.x - other.x, p.y - other.y);
                    if (dist > 150) return null;
                    const isSameTeam = p.team === other.team;
                    const edgeKey = [p.id, other.id].sort((a, b) => a - b).join('-');
                    return (
                      <motion.line
                        key={edgeKey}
                        x1={p.x} y1={p.y} x2={other.x} y2={other.y}
                        stroke={isSameTeam ? "#00f3ff" : "#ff0033"}
                        strokeWidth={isSameTeam ? (150 - dist) / 50 : 0.5}
                        strokeOpacity={isSameTeam ? 0.3 : 0.1}
                      />
                    );
                  })
                ))}

                {/* Nodes */}
                {players.map((p) => (
                  <motion.g key={p.id} animate={{ x: p.x, y: p.y }}>
                    <circle r={4} fill={p.team === 'A' ? "#00f3ff" : "#0066ff"} className="drop-shadow-[0_0_8px_currentColor]" />
                    <circle r={8} fill="transparent" stroke={p.team === 'A' ? "#00f3ff" : "#0066ff"} strokeWidth={0.5} className="opacity-20" />
                    <text y={-10} textAnchor="middle" fill="white" fontSize="8" className="font-mono opacity-50 uppercase tracking-tighter">{p.name}</text>
                  </motion.g>
                ))}
              </svg>

              {/* Graph Legend */}
              <div className="absolute bottom-6 left-6 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Home Synergy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Opponent Pressure</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: AI Tactical Intelligence */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">AI Intelligence // Insights</span>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

              {/* Metric Card 1 */}
              <motion.div
                animate={{ borderColor: entropy > 0.7 ? '#ff0033' : 'rgba(255,255,255,0.05)' }}
                className="liquid-glass p-6 rounded-2xl border transition-colors relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <Activity className={`w-5 h-5 ${entropy > 0.7 ? 'text-rose-500' : 'text-cyan-400'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${entropy > 0.7 ? 'text-rose-500 animate-pulse' : 'text-white/30'}`}>
                    {entropy > 0.7 ? 'WARNING: HIGH DISORDER' : 'STABLE'}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Formation Entropy</div>
                <div className="text-4xl font-black font-orbitron text-white mt-1">{(entropy * 100).toFixed(1)}%</div>
                
                {entropy > 0.7 && (
                  <div className="mt-2 text-[9px] font-bold text-rose-500 uppercase tracking-tighter animate-bounce flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Predictive Collapse Risk: 84%
                  </div>
                )}
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${entropy * 100}%`, backgroundColor: entropy > 0.7 ? '#ff0033' : '#00f3ff' }} className="h-full" />
                </div>
              </motion.div>

              {/* Metric Card 2 */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <Hexagon className="w-5 h-5 text-blue-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">SYSTEM DETECTED</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Critical Node</div>
                <div className="text-4xl font-black font-orbitron text-white mt-1">PLAYER #6</div>
                <p className="text-[10px] text-gray-400 mt-3 font-light">Articulation point detected. Removal results in 42% connectivity loss.</p>
              </div>

              {/* Metric Card 3: Team Compactness */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Team Compactness</span>
                  <Target className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black font-orbitron text-emerald-400">OPTIMAL</div>
                <div className="text-[10px] text-white/40 font-mono mt-1">DIAMETER: 32.4m</div>
                <div className="mt-3 flex gap-1 h-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['40%', '100%', '40%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                      className="flex-1 bg-emerald-500/20 border-t border-emerald-500/50"
                    />
                  ))}
                </div>
              </div>

              {/* Metric Card 4: Passing Lanes */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Passing Lanes</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 animate-pulse">ACTIVE</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-white/60 font-mono">
                    <span>P1 → P4 (Synergy)</span>
                    <span className="text-cyan-400">92%</span>
                  </div>
                  <div className="h-0.5 w-full bg-white/5">
                    <div className="h-full bg-cyan-400 w-[92%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/60 font-mono mt-2">
                    <span>P2 → P3 (Risk)</span>
                    <span className="text-rose-500">41%</span>
                  </div>
                  <div className="h-0.5 w-full bg-white/5">
                    <div className="h-full bg-rose-500 w-[41%]" />
                  </div>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-2xl relative overflow-hidden">
                <Zap className="absolute top-[-10px] right-[-10px] w-24 h-24 text-cyan-500/5 rotate-12" />
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">AI Recommendation</div>
                <div className="text-lg font-bold text-white leading-tight">Compress midfield spacing to reduce passing lane distance by 15%.</div>
                <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-cyan-400 tracking-widest group">
                  Apply Simulation <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM PANEL: Timeline Replay */}
        <div className="col-span-12 h-24 liquid-glass border border-white/10 rounded-2xl px-8 flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-white"><SkipBack className="w-4 h-4" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button className="p-2 text-white/40 hover:text-white"><SkipForward className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
              <span>Timeline // Match Progress</span>
              <span>FRAME: {frameIndex} / {matchData.timeline.length}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full relative overflow-hidden cursor-pointer group">
              <motion.div animate={{ width: `${(frameIndex / matchData.timeline.length) * 100}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]" />
              </motion.div>
              {/* Mock "Moments" markers */}
              <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-rose-500/50" />
              <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-cyan-500/50" />
              <div className="absolute top-0 bottom-0 left-[82%] w-0.5 bg-rose-500/50" />
            </div>
          </div>

          <div className="flex gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Efficiency</span>
              <span className="text-sm font-bold text-white">82%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Stability</span>
              <span className="text-sm font-bold text-emerald-500">OPTIMAL</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
