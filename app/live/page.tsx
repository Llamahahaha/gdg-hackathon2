"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Activity, Zap, Target, Hexagon, Play, Pause, SkipBack, SkipForward, AlertTriangle, ChevronRight } from 'lucide-react';

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
  const [players, setPlayers] = useState<any[]>(initialPlayers);
  const [playerHistory, setPlayerHistory] = useState<Record<number, {x: number, y: number}[]>>({});
  const [neutralizedIds, setNeutralizedIds] = useState<number[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [entropy, setEntropy] = useState(0.42);
  const [phase, setPhase] = useState("MID_BLOCK");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [possession, setPossession] = useState("UNKNOWN");

  // WebSocket Connection for Real Live Stream
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws');
    
    socket.onopen = () => {
      setConnectionStatus("CONNECTED");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'frame') {
          setLiveFrame(`data:image/jpeg;base64,${data.frame}`);
          setFrameIndex(data.stats?.frame_id || 0);
          
          if (data.stats) {
            const detections = data.stats.detections || [];
            const uniqueDetections = new Map();
            
            detections.forEach((d: any) => {
              const bbox = d.bbox || [0, 0, 0, 0];
              const center = d.center || [(bbox[0] + bbox[2])/2, (bbox[1] + bbox[3])/2];
              // Enforce String ID to prevent mixed-type Map collisions
              const id = d.id !== undefined ? String(d.id) : String(Math.random());
              
              if (!uniqueDetections.has(id)) {
                uniqueDetections.set(id, {
                  id: id,
                  rawX: center[0],
                  rawY: center[1],
                  x: (center[0] / 1920) * 800,
                  y: (center[1] / 1080) * 400,
                  name: `P${id}`,
                  team: d.team === 'green' ? 'A' : 'B'
                });
              }
            });

            const updatedPlayers = Array.from(uniqueDetections.values())
              .filter((d: any) => !neutralizedIds.includes(d.id));

            setPlayerHistory(prev => {
              const newHistory = { ...prev };
              updatedPlayers.forEach(p => {
                if (!newHistory[p.id]) newHistory[p.id] = [];
                newHistory[p.id] = [...newHistory[p.id].slice(-5), { x: p.x, y: p.y }];
              });
              return newHistory;
            });

            setPlayers(updatedPlayers);
            setPossession(data.stats.possession || "UNKNOWN");
            // Mocked entropy based on frame index just for the right panel UI
            setEntropy(0.3 + (Math.abs(Math.sin((data.stats.frame_id || 0) / 50)) * 0.4));
          }
        } else if (data.type === 'status') {
          console.log("[PIPELINE STATUS]", data.message);
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.onclose = () => {
      setConnectionStatus("DISCONNECTED");
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleStart = async () => {
    setIsPlaying(true);
    try {
      await fetch('http://localhost:8000/start', { method: 'POST' });
    } catch (e) {
      console.error("Failed to start pipeline:", e);
    }
  };

  const handleStop = async () => {
    setIsPlaying(false);
    setLiveFrame(null);
    try {
      await fetch('http://localhost:8000/stop', { method: 'POST' });
    } catch (e) {
      console.error("Failed to stop pipeline:", e);
    }
  };

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
              onClick={handleStart}
              className={`px-6 py-2 border flex items-center gap-2 transition-all ${isPlaying ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
            >
              <Play className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Initialize Engine</span>
            </button>
            <button 
              onClick={handleStop}
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

            {liveFrame ? (
              <img
                src={liveFrame}
                alt="Live Pipeline Feed"
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
                <div className="text-cyan-400 text-sm font-mono animate-pulse">AWAITING_SIGNAL...</div>
                <div className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-2">
                  {connectionStatus}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

            {/* HUD Overlay on Video */}
            {liveFrame && (
              <div className="absolute top-6 left-6 space-y-1">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] bg-black/40 px-2 py-1 inline-block border-l-2 border-cyan-500">CAM_01 // SECURE_FEED</div>
                <div className="text-[10px] font-mono text-white/50 bg-black/20 px-2">SAT_SYNC: 40.2443° N, 3.7121° W</div>
              </div>
            )}
          </div>

          <div className="bg-black/60 p-4 rounded-none border border-white/10 flex flex-col gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-2">Telemetry Pipeline // Stream Logs</div>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-2 text-white/40 h-24">
              <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-cyan-400">[STREAM_STABLE]</span> <span>PACKETS_RECV: 1024kbps</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-cyan-400">[FRM:{frameIndex}]</span> <span>OBJECTS_DETECTED: {players.length}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-cyan-400">[FRM:{frameIndex}]</span> <span>POSSESSION: {possession.toUpperCase()}</span></div>
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
                    stroke={players.find(p => String(p.id) === String(id))?.team === 'A' ? "#00f3ff" : "#0066ff"}
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
                    const edgeKey = [String(p.id), String(other.id)].sort().join('-');
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
