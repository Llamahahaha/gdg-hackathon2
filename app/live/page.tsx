"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, AlertCircle, Zap, TrendingUp, Users, Wifi, WifiOff, Play, Square } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlayerData {
  id: number;
  class: number;
  label: string;
  coords: [number, number];
}

interface FrameStats {
  players_detected: number;
  goalkeepers: number;
  referees: number;
  ball_detected: boolean;
  total_tracked: number;
  frame_id: number;
}

// ─── Frame Stream Hook ────────────────────────────────────────────────────────
function useFrameStream(active: boolean) {
  const ws            = useRef<WebSocket | null>(null);
  const imgRef        = useRef<HTMLImageElement | null>(null);
  const [stats, setStats]         = useState<FrameStats | null>(null);
  const [players, setPlayers]     = useState<PlayerData[]>([]);
  const [connected, setConnected] = useState(false);
  const [ready, setReady]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [fps, setFps]             = useState(0);
  const frameCount = useRef(0);
  const lastFpsTime = useRef(Date.now());

  const connect = useCallback(() => {
    if (ws.current) ws.current.close();
    setError(null);

    const socket = new WebSocket('ws://localhost:8000/ws');
    ws.current = socket;

    socket.onopen = () => { setConnected(true); setError(null); };

    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === 'ready') {
          setReady(true);
        }

        if (msg.type === 'frame') {
          // Update img element directly (bypasses React re-render for max speed)
          if (imgRef.current) {
            imgRef.current.src = `data:image/jpeg;base64,${msg.frame}`;
          }
          setStats(msg.stats ?? null);
          setPlayers(msg.players ?? []);

          // FPS counter
          frameCount.current++;
          const now = Date.now();
          if (now - lastFpsTime.current >= 1000) {
            setFps(frameCount.current);
            frameCount.current = 0;
            lastFpsTime.current = now;
          }
        }

        if (msg.type === 'error') {
          setError(msg.message);
        }
      } catch { /* ignore parse errors */ }
    };

    socket.onclose = () => { setConnected(false); setReady(false); };
    socket.onerror = () => {
      setError('Cannot connect. Make sure server.py is running in vision-engine/');
      setConnected(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
    setConnected(false);
    setReady(false);
    setStats(null);
    setPlayers([]);
    setFps(0);
    if (imgRef.current) imgRef.current.src = '';
  }, []);

  useEffect(() => {
    if (active) connect(); else disconnect();
    return () => { ws.current?.close(); };
  }, [active, connect, disconnect]);

  return { imgRef, stats, players, connected, ready, error, fps };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LivePage() {
  const [sessionActive, setSessionActive] = useState(false);
  const { imgRef, stats, players, connected, ready, error, fps } =
    useFrameStream(sessionActive);

  const metrics = [
    { label: 'Players Detected', val: stats ? String(stats.players_detected) : '—', unit: '',        icon: Users,       color: '#c8e86e' },
    { label: 'Total Tracked',    val: stats ? String(stats.total_tracked)    : '—', unit: 'objects', icon: Activity,    color: '#3b82f6' },
    { label: 'Ball Status',      val: stats ? (stats.ball_detected ? 'LIVE' : 'LOST') : '—', unit: '', icon: Zap,       color: stats?.ball_detected ? '#c8e86e' : '#ef4444' },
    { label: 'Stream Rate',      val: String(fps),                                   unit: 'fps',    icon: TrendingUp,  color: '#a78bfa' },
  ];

  return (
    <main className="min-h-screen bg-transparent text-black dark:text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1
              className="text-3xl md:text-5xl font-black tracking-tighter dark:text-white text-black"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              LIVE TRACKING
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
              {connected ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <Wifi className="w-3 h-3 text-green-500" />
                  {ready ? `ENGINE LIVE // FRAME #${stats?.frame_id ?? 0} // ${fps}fps` : 'LOADING FRAMES...'}
                </>
              ) : sessionActive ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  CONNECTING...
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-gray-500" />
                  <WifiOff className="w-3 h-3" />
                  SESSION INACTIVE
                </>
              )}
            </div>
          </div>

          <button
            onClick={async () => {
              if (!sessionActive) {
                try {
                  await fetch('http://localhost:8000/start', { method: 'POST' });
                } catch (e) {
                  console.error("Failed to start vision engine", e);
                }
              }
              setSessionActive(v => !v);
            }}
            className={`px-6 py-3 font-bold rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg ${
              sessionActive
                ? 'bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20'
                : 'bg-[#c8e86e] text-black shadow-[0_0_20px_rgba(200,232,110,0.3)]'
            }`}
          >
            {sessionActive
              ? <><Square className="w-3 h-3" /> Stop Session</>
              : <><Play className="w-3 h-3" /> Initialize Session</>}
          </button>
        </div>

        {/* ─── Error Banner ────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">[ERROR]</span> {error}
              <div className="text-gray-500 mt-1 space-y-0.5">
                <div>→ Step 1: <code className="bg-black/20 px-1 rounded">cd vision-engine && python process_video.py</code></div>
                <div>→ Step 2: <code className="bg-black/20 px-1 rounded">python server.py</code></div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Main Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Video Feed — 3/4 width */}
          <Card className="lg:col-span-3 overflow-hidden border-[#c8e86e]/20">
            <CardHeader className="bg-white/5 dark:bg-white/5 border-b border-white/5 py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#c8e86e]" />
                  TACTICAL_OVERLAY_V2.0
                </CardTitle>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                  <span className={stats?.ball_detected ? 'text-[#c8e86e]' : 'text-red-400'}>
                    BALL: {stats?.ball_detected ? 'TRACKED' : 'LOST'}
                  </span>
                  <span>PLAYERS: {stats?.players_detected ?? 0}</span>
                  <span>{fps}fps</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 bg-black aspect-video relative">

              {/* Placeholder shown when inactive */}
              {!sessionActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10">
                  <div
                    style={{ backgroundImage: 'radial-gradient(#c8e86e 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    className="absolute inset-0 opacity-10 pointer-events-none"
                  />
                  <div className="w-20 h-20 border-2 border-[#c8e86e]/30 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 border border-[#c8e86e]/50 rounded-full" />
                  </div>
                  <p className="text-sm font-mono text-[#c8e86e] tracking-widest">AWAITING_SESSION_START</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Click &quot;Initialize Session&quot; to start</p>
                </div>
              )}

              {/* Connecting spinner */}
              {sessionActive && !ready && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10">
                  <div className="w-12 h-12 border-2 border-[#c8e86e]/30 border-t-[#c8e86e] rounded-full animate-spin" />
                  <p className="text-sm font-mono text-[#c8e86e] tracking-widest animate-pulse">LOADING ENGINE...</p>
                </div>
              )}

              {/* The actual frame — always mounted, updated via imgRef for speed */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                alt="AI Vision Feed"
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* HUD overlay */}
              {ready && (
                <>
                  <div className="absolute top-3 left-3 p-2 bg-black/70 border border-[#c8e86e]/20 rounded backdrop-blur-md pointer-events-none z-20">
                    <div className="text-[9px] font-mono text-gray-400">AI_ENGINE: <span className="text-green-400">LIVE</span></div>
                    <div className="text-[9px] font-mono text-gray-400">FRAME: <span className="text-white">{stats?.frame_id ?? '—'}</span></div>
                  </div>
                  <div className="absolute top-3 right-3 p-2 bg-black/70 border border-white/10 rounded backdrop-blur-md text-[9px] font-mono text-gray-400 pointer-events-none z-20">
                    TRACKED: <span className="text-[#c8e86e]">{stats?.total_tracked ?? 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ─── Side Panel ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            <Card className={`border ${connected ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'}`}>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs font-mono text-gray-400 uppercase">Engine Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-[10px] font-mono pb-4">
                {[
                  { label: 'WebSocket',   val: connected ? 'CONNECTED' : 'OFFLINE',  ok: connected },
                  { label: 'Frames',      val: ready     ? 'STREAMING' : '—',        ok: ready },
                  { label: 'Telemetry',   val: stats     ? 'ACTIVE'    : '—',        ok: !!stats },
                  { label: 'Goalkeepers', val: String(stats?.goalkeepers ?? '—'),    ok: true },
                  { label: 'Referees',    val: String(stats?.referees    ?? '—'),    ok: true },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gray-500">{r.label}</span>
                    <span className={r.ok && connected ? 'text-green-400' : 'text-gray-600'}>{r.val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5 flex-1">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs font-mono flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-3 h-3" /> LIVE_ALERTS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {connected && stats ? (
                  <>
                    {!stats.ball_detected && (
                      <div className="p-2 border border-red-500/20 bg-red-500/10 rounded text-[10px] font-mono">
                        <span className="text-red-400 font-bold">[!]</span> BALL_OUT_OF_FRAME
                      </div>
                    )}
                    {stats.players_detected < 5 && (
                      <div className="p-2 border border-yellow-500/20 bg-yellow-500/10 rounded text-[10px] font-mono">
                        <span className="text-yellow-400 font-bold">[!]</span> LOW_PLAYER_COUNT: {stats.players_detected}
                      </div>
                    )}
                    {stats.players_detected >= 5 && stats.ball_detected && (
                      <div className="p-2 border border-green-500/20 bg-green-500/10 rounded text-[10px] font-mono">
                        <span className="text-green-400 font-bold">[✓]</span> ALL_SYSTEMS_NOMINAL
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[10px] font-mono text-gray-600">No active session.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── Bottom Metrics ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Card key={i} className="hover:border-white/20 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono">{m.val}</span>
                    {m.unit && <span className="text-[10px] font-mono text-gray-500 uppercase">{m.unit}</span>}
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
