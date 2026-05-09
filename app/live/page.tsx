"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Activity, Zap, Target, Hexagon, Play, Pause, SkipBack, SkipForward, AlertTriangle, ChevronRight } from 'lucide-react';

import matchData from '@/public/data/match_telemetry.json';

// --- Mock Data & Helpers ---
const initialPlayers = [
  { id: 1, x: 200, y: 150, rawX: 200, rawY: 150, name: "P1", team: 'A' },
  { id: 2, x: 300, y: 100, rawX: 300, rawY: 100, name: "P2", team: 'A' },
  { id: 3, x: 300, y: 200, rawX: 300, rawY: 200, name: "P3", team: 'A' },
  { id: 4, x: 450, y: 150, rawX: 450, rawY: 150, name: "P4", team: 'A' },
  { id: 5, x: 100, y: 150, rawX: 100, rawY: 150, name: "GK", team: 'A' },
  { id: 6, x: 550, y: 150, rawX: 550, rawY: 150, name: "O1", team: 'B' },
  { id: 7, x: 650, y: 100, rawX: 650, rawY: 100, name: "O2", team: 'B' },
  { id: 8, x: 650, y: 200, rawX: 650, rawY: 200, name: "O3", team: 'B' },
];

export default function LiveEnginePage() {
  const [players, setPlayers] = useState(initialPlayers);
  const [playerHistory, setPlayerHistory] = useState<Record<number, {x: number, y: number}[]>>({});
  const [neutralizedIds, setNeutralizedIds] = useState<number[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [entropy, setEntropy] = useState(0.42);
  const [phase, setPhase] = useState("MID_BLOCK");

  // Sync with real match telemetry
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setFrameIndex(prev => {
        const next = (prev + 1) % matchData.timeline.length;
        const currentFrame = matchData.timeline[next];

        if (currentFrame && currentFrame.detections) {
          const uniqueDetections = new Map();
          currentFrame.detections.forEach((d: any) => {
            if (!uniqueDetections.has(d.id)) uniqueDetections.set(d.id, d);
          });

          const updatedPlayers = Array.from(uniqueDetections.values())
            .filter((d: any) => !neutralizedIds.includes(d.id))
            .map((d: any) => ({
              id: d.id,
              rawX: d.center[0],
              rawY: d.center[1],
              x: (d.center[0] / 1920) * 800,
              y: (d.center[1] / 1080) * 400,
              name: `P${d.id}`,
              team: d.team === 'green' ? 'A' : 'B'
            }));

          // Update History for Ghosting
          setPlayerHistory(prev => {
            const newHistory = { ...prev };
            updatedPlayers.forEach(p => {
              if (!newHistory[p.id]) newHistory[p.id] = [];
              newHistory[p.id] = [...newHistory[p.id].slice(-5), { x: p.x, y: p.y }];
            });
            return newHistory;
          });

          setPlayers(updatedPlayers);

          // Phase Detection Logic (Mocked)
          const teamA = updatedPlayers.filter(p => p.team === 'A');
          const avgX = teamA.reduce((sum, p) => sum + p.x, 0) / (teamA.length || 1);
          if (avgX > 500) setPhase("HIGH_PRESS");
          else if (avgX < 300) setPhase("LOW_BLOCK");
          else setPhase("MID_BLOCK");

          setEntropy(0.3 + (Math.abs(Math.sin(next / 50)) * 0.4));
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, neutralizedIds]);

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-6 px-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">

        {/* Match Status Header */}
        <div className="flex items-center gap-6 bg-black/80 border border-white/20 p-4 rounded-none">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="w-2 h-2 rounded-none bg-rose-500 animate-pulse" />
            <span className="text-xs font-black tracking-[0.2em]">LIVE_SIGNAL_01</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Match Time</span>
              <span className="text-sm font-bold font-mono">{(frameIndex * 0.1).toFixed(1)}s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Score // Est.</span>
              <span className="text-sm font-bold font-mono text-cyan-400">0 - 0</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Tactical Phase</span>
              <span className="text-sm font-bold text-emerald-500 tracking-tighter">{phase}</span>
            </div>
          </div>
        </div>

        {/* Command Bar: Upload & Controls */}
        <div className="flex justify-between items-center bg-black/40 p-4 border-x border-t border-white/10">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
              <input type="file" className="hidden" accept="video/*" onChange={(e) => alert('Match footage uploaded. Tactical graph ready for initialization.')} />
              <span className="text-[10px] font-black uppercase tracking-widest">Upload Footage</span>
            </label>
            <span className="text-[9px] font-mono text-white/30 tracking-tighter">SUPPORTED: .MP4, .MOV (H.264)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPlaying(true)}
              className={`px-6 py-2 border flex items-center gap-2 transition-all ${isPlaying ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
            >
              <Play className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Initialize Engine</span>
            </button>
            <button 
              onClick={() => setIsPlaying(false)}
              className={`px-6 py-2 border flex items-center gap-2 transition-all ${!isPlaying ? 'bg-rose-500 border-rose-400 text-white' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
            >
              <Pause className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Stop Signal</span>
            </button>
          </div>
        </div>

        {/* TOP SECTION: Match Feed (Full Width) */}
        <div className="w-full flex flex-col">
          <div className="aspect-video bg-black rounded-none border border-white/20 overflow-hidden relative group shadow-2xl">
            {/* Scanline / CRT Effect */}
            <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%'
              }} />
            
            {/* Technical Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 z-10" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 z-10" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 z-10" />

            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover opacity-80"
              src="/videos/test.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

            {/* HUD Overlay on Video */}
            <div className="absolute top-6 left-6 space-y-1">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] bg-black/40 px-2 py-1 inline-block border-l-2 border-cyan-500">CAM_01 // SECURE_FEED</div>
              <div className="text-[10px] font-mono text-white/50 bg-black/20 px-2">SAT_SYNC: 40.2443° N, 3.7121° W</div>
            </div>

            {/* Bounding Box Tracking Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="xMidYMid slice"
            >
              {players.map((p) => {
                const isTeamA = p.team === 'A';
                const color = isTeamA ? "#00f3ff" : "#ff0033";

                return (
                  <motion.g
                    key={p.id}
                    animate={{
                      x: p.rawX,
                      y: p.rawY
                    }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  >
                    {/* Premium Scanner Box */}
                    <motion.rect
                      x="-30" y="-60"
                      width="60" height="120"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="2"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* Corners */}
                    <path d="M-30,-40 V-60 H-10" fill="none" stroke={color} strokeWidth="4" />
                    <path d="M10,-60 H30 V-40" fill="none" stroke={color} strokeWidth="4" />
                    <path d="M30,40 V60 H10" fill="none" stroke={color} strokeWidth="4" />
                    <path d="M-10,60 H-30 V40" fill="none" stroke={color} strokeWidth="4" />

                    {/* ID Label */}
                    <g transform="translate(0, -70)">
                      <rect x="-25" y="-15" width="50" height="15" fill={color} className="opacity-90" />
                      <text textAnchor="middle" y="-4" fill="black" fontSize="10" fontWeight="black" className="font-mono uppercase">
                        ID:{p.id}
                      </text>
                    </g>

                    {/* Team Indicator */}
                    <rect x="-2" y="-2" width="4" height="4" fill={color} className="animate-pulse" />
                  </motion.g>
                );
              })}
            </svg>
          </div>

          <div className="bg-black/60 p-4 rounded-none border border-white/10 flex flex-col gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-2">Telemetry Pipeline // Stream Logs</div>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-2 text-white/40 h-24">
              <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-cyan-400">[STREAM_STABLE]</span> <span>PACKETS_RECV: 1024kbps</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-cyan-400">[FRM:{frameIndex}]</span> <span>OBJECTS_DETECTED: {players.length}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-cyan-400">[FRM:{frameIndex}]</span> <span>POSSESSION: {matchData.timeline[frameIndex]?.possession.toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-rose-500">[FRM:{frameIndex}]</span> <span>ENTROPY: {entropy.toFixed(3)}</span></div>
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL: Intelligence & Graph (Split) */}
        <div className="grid grid-cols-12 gap-6 pb-24">

          {/* Tactical Graph */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Topological Graph // Live</span>
                <motion.span 
                  key={phase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-[8px] font-black text-cyan-400 tracking-widest"
                >
                  {phase}
                </motion.span>
              </div>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-cyan-400 font-mono">NODES: 22</span>
                <span className="text-[10px] font-bold text-blue-500 font-mono">EDGES: 142</span>
              </div>
            </div>

            <div className="h-[500px] bg-black/40 rounded-none border border-white/20 relative overflow-hidden shadow-inner">
              {/* Technical Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40 z-10" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40 z-10" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40 z-10" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40 z-10" />

              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* Ghosting Trails */}
                {Object.entries(playerHistory).map(([id, trail]) => (
                  <polyline
                    key={`trail-${id}`}
                    points={trail.map(t => `${t.x},${t.y}`).join(' ')}
                    fill="none"
                    stroke={players.find(p => p.id === Number(id))?.team === 'A' ? "#00f3ff" : "#0066ff"}
                    strokeWidth="1"
                    strokeOpacity="0.2"
                    strokeDasharray="2,2"
                  />
                ))}

                {/* Edges */}
                {players.map((p, i) => (
                  players.slice(i + 1).map((other) => {
                    const dist = Math.hypot(p.x - other.x, p.y - other.y);
                    if (dist > 150) return null;
                    const isSameTeam = p.team === 'A';
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
                  <motion.g key={p.id} animate={{ x: p.x, y: p.y }} className="cursor-crosshair group/node">
                    <circle r={4} fill={p.team === 'A' ? "#00f3ff" : "#0066ff"} className="drop-shadow-[0_0_8px_currentColor]" />
                    <circle r={8} fill="transparent" stroke={p.team === 'A' ? "#00f3ff" : "#0066ff"} strokeWidth={0.5} className="opacity-20 group-hover/node:opacity-100 transition-opacity" />
                    
                    {/* Node Inspector Tooltip */}
                    <foreignObject x={10} y={10} width={100} height={60} className="pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity">
                      <div className="bg-black/80 border border-white/20 p-2 text-[7px] font-mono leading-tight">
                        <div className="text-cyan-400 mb-1">PLAYER_ID: {p.id}</div>
                        <div className="text-white/60">STABILITY: 0.92</div>
                        <div className="text-white/60">CENTRALITY: 0.45</div>
                        <div className="text-white/60">TEAM: {p.team}</div>
                      </div>
                    </foreignObject>

                    <text y={-10} textAnchor="middle" fill="white" fontSize="8" className="font-mono opacity-50 uppercase tracking-tighter">{p.name}</text>
                  </motion.g>
                ))}
              </svg>

              {/* Graph Legend */}
              <div className="absolute bottom-6 left-6 p-4 bg-black/80 backdrop-blur-md border border-white/20 rounded-none space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-none bg-cyan-500" />
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Home Synergy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-none bg-rose-500" />
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Opponent Pressure</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: AI Tactical Intelligence */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">AI Intelligence // Insights</span>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

              {/* Metric Card 1: Formation Entropy */}
              <motion.div
                animate={{ borderColor: entropy > 0.7 ? '#ff0033' : 'rgba(255,255,255,0.1)' }}
                className="bg-black/40 p-6 rounded-none border border-white/10 transition-colors relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <Activity className={`w-5 h-5 ${entropy > 0.7 ? 'text-rose-500' : 'text-cyan-400'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${entropy > 0.7 ? 'text-rose-500 animate-pulse' : 'text-white/30'}`}>
                    {entropy > 0.7 ? 'WARNING: HIGH DISORDER' : 'STABLE'}
                  </span>
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Formation Entropy</div>
                <div className="text-4xl font-black font-orbitron text-white mt-1">{(entropy * 100).toFixed(1)}%</div>

                {entropy > 0.7 && (
                  <div className="mt-2 text-[9px] font-bold text-rose-500 uppercase tracking-tighter animate-bounce flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Predictive Collapse Risk: 84%
                  </div>
                )}
                <div className="mt-4 h-1 w-full bg-white/5 rounded-none overflow-hidden">
                  <motion.div animate={{ width: `${entropy * 100}%`, backgroundColor: entropy > 0.7 ? '#ff0033' : '#00f3ff' }} className="h-full" />
                </div>
              </motion.div>

              {/* Algorithm Mapping Section (NEW) */}
              <div className="bg-black/60 p-6 rounded-none border border-cyan-500/30 relative group">
                <div className="absolute -top-px -left-px w-2 h-2 bg-cyan-500" />
                <div className="absolute -bottom-px -right-px w-2 h-2 bg-cyan-500" />

                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Algorithm Intelligence Mapping</div>
                <div className="space-y-3">
                  {[
                    { name: 'Graph Laplacian', mean: 'Formation Stability' },
                    { name: 'Articulation Point', mean: 'Key Lynchpin' },
                    { name: 'Dijkstra Path', mean: 'Optimal Progression' },
                    { name: 'Floyd-Warshall', mean: 'Team Compactness' },
                  ].map((alg) => (
                    <div key={alg.name} className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[9px] font-mono text-white/50">{alg.name}</span>
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">{alg.mean}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 text-[9px] text-cyan-200/60 leading-relaxed font-light italic">
                  "Football is Spatial Chess. Our engine maps discrete mathematics to tactical structure."
                </div>
              </div>

              {/* Metric Card 3: Lynchpin Isolation */}
              <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <Target className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Critical Lynchpin</div>
                <div className="text-2xl font-black text-white font-orbitron">PLAYER #{players[3]?.id || 8}</div>
                <p className="text-[9px] text-rose-500/70 mt-2 font-bold uppercase tracking-tighter">
                  Articulation Point Detected: Neutralization causes 42% connectivity loss.
                </p>
                <button
                  onClick={() => {
                    const lynchpin = players[3]?.id;
                    if (lynchpin) setNeutralizedIds(prev => [...prev, lynchpin]);
                  }}
                  className="mt-4 w-full py-2 bg-rose-500/20 border border-rose-500/40 text-[9px] font-black uppercase text-rose-500 tracking-widest hover:bg-rose-500 hover:text-white transition-all rounded-none"
                >
                  Fracture Connectivity
                </button>
              </div>

              {/* Recommendation Card */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-none relative overflow-hidden">
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
      </main>
    </div>
  );
}
