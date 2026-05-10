"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Activity, Zap, Target, Hexagon, Play, Pause, SkipBack, SkipForward, AlertTriangle, ChevronRight } from 'lucide-react';

export default function LiveEnginePage() {
  // --- Core State ---
  const [players, setPlayers] = useState<any[]>([]);
  const [neutralizedIds, setNeutralizedIds] = useState<number[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [entropy, setEntropy] = useState(0.42);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [possession, setPossession] = useState("UNKNOWN");

  // --- Tactical Intelligence State ---
  const [recommendation, setRecommendation] = useState("Awaiting tactical analysis...");
  const [metrics, setMetrics] = useState<any>({ entropy: 0, articulation_points: [], diameter: 0, diameter_nodes: [] });
  const [timelineData, setTimelineData] = useState<{frame: number, entropy: number}[]>([]);

  // WebSocket Connection
  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws');
    
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

            // Re-filter players here instead of relying on state to trigger effect
            setPlayers(Array.from(uniqueDetections.values()));
            setPossession(data.stats.possession || "UNKNOWN");
            
            if (data.stats.metrics) {
              setMetrics(data.stats.metrics);
              setEntropy(data.stats.metrics.entropy);
              
              setTimelineData(prev => {
                const newData = [...prev, { frame: data.stats.frame_id, entropy: data.stats.metrics.entropy }].slice(-100);
                return newData;
              });
            }

            if (data.stats.recommendation) {
              setRecommendation(data.stats.recommendation);
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.onclose = () => {
      setConnectionStatus("DISCONNECTED");
      setWs(null);
    };

    return () => socket.close();
  }, []); // Empty dependency array to prevent constant reconnects

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
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Graph Stability</span>
              <span className="text-sm font-bold font-mono text-cyan-400">{(1 - entropy).toFixed(3)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Possession</span>
              <span className="text-sm font-bold text-emerald-500 tracking-tighter uppercase">{possession}</span>
            </div>
          </div>
        </div>

        {/* Command Bar */}
        <div className="flex justify-between items-center bg-black/40 p-4 border-x border-t border-white/10">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
              <input type="file" className="hidden" accept="video/*" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sync Dataset</span>
            </label>
            <span className="text-[9px] font-mono text-white/30 tracking-tighter uppercase">{connectionStatus}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleStart} className={`px-6 py-2 border flex items-center gap-2 transition-all ${isPlaying ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}>
              <Play className="w-3 h-3" /> <span className="text-[10px] font-black uppercase tracking-widest">Start Engine</span>
            </button>
            <button onClick={handleStop} className={`px-6 py-2 border flex items-center gap-2 transition-all ${!isPlaying ? 'bg-rose-500 border-rose-400 text-white' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}>
              <Pause className="w-3 h-3" /> <span className="text-[10px] font-black uppercase tracking-widest">Abort Signal</span>
            </button>
          </div>
        </div>

        {/* TOP SECTION: Match Feed */}
        <div className="w-full flex flex-col">
          <div className="aspect-video bg-black rounded-none border border-white/20 overflow-hidden relative group shadow-2xl">
            {liveFrame ? (
              <img src={liveFrame} alt="Live Feed" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/80">
                <span className="text-cyan-400 text-sm font-mono animate-pulse uppercase">Awaiting Neural Signal...</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute top-6 left-6 text-[10px] font-black text-cyan-400 bg-black/40 px-2 py-1 border-l-2 border-cyan-500 uppercase tracking-widest">Live_HUD_Overlay // Spatio-Temporal Sync</div>
          </div>
        </div>

        {/* BOTTOM PANEL: Intelligence & Graph */}
        <div className="grid grid-cols-12 gap-6 pb-12">
          {/* Tactical Graph */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Topological Graph // Dynamic Adjacency</span>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase">Nodes: {players.length}</span>
                <span className="text-[10px] font-bold text-blue-500 font-mono uppercase">Entropy: {entropy.toFixed(3)}</span>
              </div>
            </div>

            <div className="h-[500px] bg-black/40 border border-white/20 relative overflow-hidden shadow-inner">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* Team Diameter Line */}
                {metrics.diameter_nodes.length === 2 && (
                  <motion.line
                    x1={players.find(p => String(p.id) === String(metrics.diameter_nodes[0]))?.x}
                    y1={players.find(p => String(p.id) === String(metrics.diameter_nodes[0]))?.y}
                    x2={players.find(p => String(p.id) === String(metrics.diameter_nodes[1]))?.x}
                    y2={players.find(p => String(p.id) === String(metrics.diameter_nodes[1]))?.y}
                    stroke="#ffaa00"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                  />
                )}

                {/* Edges */}
                {players.map((p, i) => (
                  players.slice(i + 1).map((other) => {
                    const dist = Math.hypot(p.x - other.x, p.y - other.y);
                    if (dist > 150) return null;
                    return (
                      <line
                        key={`${p.id}-${other.id}`}
                        x1={p.x} y1={p.y} x2={other.x} y2={other.y}
                        stroke={p.team === 'A' ? "#00f3ff" : "#ff0033"}
                        strokeWidth={0.5}
                        strokeOpacity={0.2}
                      />
                    );
                  })
                ))}

                {/* Nodes */}
                {players.map((p) => {
                  const isArticulation = metrics.articulation_points.includes(String(p.id));
                  return (
                    <motion.g key={p.id} animate={{ x: p.x, y: p.y }}>
                      <circle r={isArticulation ? 6 : 4} fill={isArticulation ? "#ff0055" : (p.team === 'A' ? "#00f3ff" : "#0066ff")} className={isArticulation ? "drop-shadow-[0_0_8px_#ff0055]" : ""} />
                      {isArticulation && <circle r={12} fill="transparent" stroke="#ff0055" strokeWidth={1} className="animate-pulse" />}
                      <text y={-10} textAnchor="middle" fill="white" fontSize="8" className="font-mono opacity-50 uppercase tracking-widest">{p.name}</text>
                    </motion.g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 p-4 bg-black/80 border border-white/20 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500" />
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Home Synergy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500" />
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Critical Lynchpin</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Intelligence */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Intelligence // Spatio-Temporal Metrics</span>
            </div>

            {/* Entropy Card */}
            <div className="bg-black/40 p-6 border border-white/10 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <Activity className={`w-5 h-5 ${entropy > 0.7 ? 'text-rose-500' : 'text-cyan-400'}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${entropy > 0.7 ? 'text-rose-500 animate-pulse' : 'text-white/30'}`}>
                  {entropy > 0.7 ? 'Warning: High Disorder' : 'System Stable'}
                </span>
              </div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Formation Entropy</div>
              <div className="text-4xl font-black font-orbitron">{(entropy * 100).toFixed(1)}%</div>
              <div className="mt-4 h-1 w-full bg-white/5 overflow-hidden">
                <motion.div animate={{ width: `${entropy * 100}%`, backgroundColor: entropy > 0.7 ? '#ff0033' : '#00f3ff' }} className="h-full" />
              </div>
            </div>

            {/* Diameter Card */}
            <div className="bg-black/40 p-6 border border-white/10">
              <div className="text-[10px] font-black text-white/30 uppercase mb-1">Team Diameter // Compactness</div>
              <div className="text-2xl font-black font-orbitron">{metrics.diameter.toFixed(2)}px</div>
              <p className="text-[8px] text-white/40 mt-2 uppercase tracking-tight">Floyd-Warshall all-pairs shortest path length across largest component.</p>
            </div>

            {/* Lynchpin Card */}
            <div className="bg-rose-500/10 border border-rose-500/30 p-6 relative overflow-hidden">
              <Target className="absolute top-[-10px] right-[-10px] w-20 h-20 text-rose-500/10" />
              <div className="text-[10px] font-black text-rose-500 uppercase mb-2">Critical Lynchpin</div>
              <div className="text-2xl font-black font-orbitron uppercase">
                {metrics.articulation_points.length > 0 ? `Node #${metrics.articulation_points[0]}` : "None Detected"}
              </div>
              <p className="text-[9px] text-rose-500/70 mt-2 font-bold uppercase tracking-widest">
                Tarjan's Articulation Point Analysis identifies structural vulnerability.
              </p>
              <button
                onClick={() => {
                  const lynchpin = metrics.articulation_points[0];
                  if (lynchpin) setNeutralizedIds(prev => [...prev, Number(lynchpin)]);
                }}
                className="mt-4 w-full py-2 bg-rose-500/20 border border-rose-500/40 text-[9px] font-black uppercase text-rose-500 tracking-widest hover:bg-rose-500 hover:text-white transition-all"
              >
                Fracture Connectivity
              </button>
            </div>

            {/* Recommendation Card */}
            <div className="relative overflow-hidden p-[2px] rounded-lg mt-2 h-full min-h-[140px]">
              <motion.div 
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 z-0 bg-[linear-gradient(90deg,transparent,#00f3ff,transparent)] opacity-60"
                style={{ backgroundSize: "200% 100%" }}
              />
              <div className="relative z-10 bg-black/90 backdrop-blur-sm p-6 rounded-lg border border-cyan-500/20 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" /> Live Tactical AI
                  </span>
                  <span className="text-[8px] font-mono text-cyan-500/50">YOLO ⇿ Gemini Sync</span>
                </div>
                <motion.div
                  key={recommendation}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-sm font-bold text-white leading-relaxed uppercase tracking-tight flex-1"
                >
                  {recommendation}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Timeline */}
        <div className="bg-black/80 border border-white/10 p-6 mb-24">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Temporal Stability Analysis // Real-time Buffer</span>
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Status: Logging Spatio-Temporal Spikes</span>
          </div>
          <div className="h-[300px] flex items-end gap-1 border-b border-white/10 pb-1">
            {timelineData.map((data, i) => {
              // Emphasize variance by stretching the entropy value for visualization
              const displayHeight = Math.max(5, (data.entropy - 0.3) * 140);
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, displayHeight)}%` }}
                  className={`flex-1 min-w-[2px] transition-colors ${data.entropy > 0.7 ? 'bg-rose-500' : 'bg-cyan-500/40 hover:bg-cyan-400'}`}
                />
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
