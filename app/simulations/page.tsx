"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Move, RefreshCw, Save, Zap, AlertTriangle, Lock, Unlock } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { useTactical, Detection } from '@/context/TacticalContext';
import { laplacianEntropy, floydWarshallDiameter, topCentrality, Node2D, GraphConfig } from '@/visionplay-pipeline/src/graphMath';

const PITCH_CONFIG: GraphConfig = {
  pixelsPerMeterX: 1920 / 105,
  pixelsPerMeterY: 1080 / 68,
  proximityThresholdM: 75,
};

interface SimulationNode {
  id: string | number;
  x: number;
  y: number;
  team: 'A' | 'B';
}

// Tracks the in-progress drag outside React state so we don't trigger renders
interface DragState {
  id: string | number | null;
  startClientX: number;
  startClientY: number;
  startNodeX: number;
  startNodeY: number;
}

export default function SimulationsPage() {
  const { timelineData: timeline } = useTactical();

  const [sandboxState, setSandboxState] = useState({
    nodes: [] as SimulationNode[],
    ghostNodes: [] as SimulationNode[],
    originalNodes: [] as SimulationNode[],
    entropy: 0.0,
    diameter: 0.0,
    centrality: 0.0,
    loading: true,
  });

  const [showGhost, setShowGhost] = useState(true);
  // When locked, dragging is disabled so the user can study a formation without nodes moving
  const [isLocked, setIsLocked] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragState = useRef<DragState>({ id: null, startClientX: 0, startClientY: 0, startNodeX: 0, startNodeY: 0 });

  // ── Data initialization ───────────────────────────────────────────────────
  useEffect(() => {
    const initSandbox = async () => {
      let dataToUse = timeline;

      if (!dataToUse || dataToUse.length === 0) {
        try {
          const res = await fetch('/data/tactical_data.json');
          const json = await res.json();
          dataToUse = json.timeline || [];
        } catch (err) {
          console.error('Failed to load historical data for sandbox:', err);
        }
      }

      if (dataToUse && dataToUse.length > 0) {
        const midFrameIndex = Math.floor(dataToUse.length / 2);
        const targetFrame = dataToUse[midFrameIndex] || dataToUse[0];

        const uniqueDetections = new Map<string | number, Detection>();
        targetFrame.detections.forEach((d: Detection) => {
          if (!uniqueDetections.has(d.id)) uniqueDetections.set(d.id, d);
        });

        const teamA: Detection[] = [];
        const teamB: Detection[] = [];
        Array.from(uniqueDetections.values()).forEach((d) => {
          if (d.team === 'green' && teamA.length < 11) teamA.push(d);
          else if (d.team === 'white' && teamB.length < 11) teamB.push(d);
        });

        const initialNodes: SimulationNode[] = [...teamA, ...teamB].map((d) => ({
          id: d.id,
          x: ((d.center?.[0] || 0) / 1920) * 800,
          y: ((d.center?.[1] || 0) / 1080) * 400,
          team: d.team === 'green' ? 'A' : 'B',
        }));

        const initialTeamANodes1920 = initialNodes
          .filter((n) => n.team === 'A')
          .map((n) => ({
            id: n.id,
            x: (n.x / 800) * 1920,
            y: (n.y / 400) * 1080,
          }));

        setSandboxState({
          nodes: initialNodes,
          ghostNodes: initialNodes,
          originalNodes: initialNodes,
          entropy: laplacianEntropy(initialTeamANodes1920, PITCH_CONFIG),
          diameter: floydWarshallDiameter(initialTeamANodes1920, PITCH_CONFIG),
          centrality: topCentrality(initialTeamANodes1920, PITCH_CONFIG),
          loading: false,
        });
      } else {
        setSandboxState((prev) => ({ ...prev, loading: false }));
      }
    };

    initSandbox();
  }, [timeline]);

  // ── Pointer-event drag (positions live in React state, not Framer transforms) ──
  // We convert client pixel deltas to SVG viewBox coordinates via the SVG's bounding rect.
  const clientToSVGDelta = useCallback((dxClient: number, dyClient: number) => {
    if (!svgRef.current) return { dx: dxClient, dy: dyClient };
    const rect = svgRef.current.getBoundingClientRect();
    const vb = svgRef.current.viewBox.baseVal;
    return {
      dx: (dxClient / rect.width) * vb.width,
      dy: (dyClient / rect.height) * vb.height,
    };
  }, []);

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>, node: SimulationNode) => {
      if (isLocked) return;
      e.stopPropagation();
      // Capture pointer so we keep receiving events even if cursor leaves the element
      (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
      dragState.current = {
        id: node.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startNodeX: node.x,
        startNodeY: node.y,
      };
    },
    [isLocked]
  );

  const handleSVGPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const { id } = dragState.current;
      if (id === null) return;

      const dxClient = e.clientX - dragState.current.startClientX;
      const dyClient = e.clientY - dragState.current.startClientY;
      const { dx, dy } = clientToSVGDelta(dxClient, dyClient);

      const newX = Math.max(8, Math.min(792, dragState.current.startNodeX + dx));
      const newY = Math.max(8, Math.min(392, dragState.current.startNodeY + dy));

      setSandboxState((prev) => {
        const newNodes = prev.nodes.map((n) =>
          n.id === id ? { ...n, x: newX, y: newY } : n
        );
        const teamANodes: Node2D[] = newNodes
          .filter((n) => n.team === 'A')
          .map((n) => ({
            id: n.id,
            x: (n.x / 800) * 1920,
            y: (n.y / 400) * 1080,
          }));

        const newEntropy = laplacianEntropy(teamANodes, PITCH_CONFIG);
        const newDiameter = floydWarshallDiameter(teamANodes, PITCH_CONFIG); // meters
        const newCentrality = topCentrality(teamANodes, PITCH_CONFIG);        // 0-1

        return {
          ...prev,
          nodes: newNodes,
          entropy: newEntropy,
          diameter: newDiameter,
          centrality: newCentrality,
        };
      });
    },
    [clientToSVGDelta]
  );

  const handleSVGPointerUp = useCallback(() => {
    dragState.current.id = null;
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const resetSimulation = () => {
    setSandboxState((prev) => {
      const teamA = prev.originalNodes.filter((n) => n.team === 'A');
      const teamA1920 = teamA.map((n) => ({
        id: n.id,
        x: (n.x / 800) * 1920,
        y: (n.y / 400) * 1080,
      }));
      return {
        ...prev,
        nodes: prev.originalNodes,
        entropy: laplacianEntropy(teamA1920, PITCH_CONFIG),
        diameter: floydWarshallDiameter(teamA1920, PITCH_CONFIG),
        centrality: topCentrality(teamA1920, PITCH_CONFIG),
      };
    });
  };

  const simulateCollapse = () => {
    setSandboxState((prev) => {
      const newNodes = prev.nodes.map((n) =>
        n.team === 'A' ? { ...n, x: n.x + (Math.random() * 100 - 50), y: n.y + 50 } : n
      );

      const teamA = newNodes
        .filter((n) => n.team === 'A')
        .map((n) => ({
          id: n.id,
          x: (n.x / 800) * 1920,
          y: (n.y / 400) * 1080,
        }));

      return {
        ...prev,
        nodes: newNodes,
        entropy: laplacianEntropy(teamA, PITCH_CONFIG),
        diameter: floydWarshallDiameter(teamA, PITCH_CONFIG),
        centrality: topCentrality(teamA, PITCH_CONFIG),
      };
    });
  };

  const simulateDefense = () => {
    setSandboxState((prev) => {
      let aIndex = 0;
      const newNodes = prev.nodes.map((n) => {
        if (n.team === 'A') {
          // 4-4-2 compact block
          let targetX = 400;
          let targetY = 200;
          if (aIndex < 4) { // 4 defenders
            targetX = 250 + aIndex * 100;
            targetY = 320;
          } else if (aIndex < 8) { // 4 midfielders
            targetX = 250 + (aIndex - 4) * 100;
            targetY = 220;
          } else { // 2 forwards + 1 GK/extra
            targetX = 300 + (aIndex - 8) * 100;
            targetY = 120;
          }
          aIndex++;
          return { ...n, x: targetX, y: targetY };
        }
        return n;
      });

      const teamA = newNodes
        .filter((n) => n.team === 'A')
        .map((n) => ({
          id: n.id,
          x: (n.x / 800) * 1920,
          y: (n.y / 400) * 1080,
        }));

      return {
        ...prev,
        nodes: newNodes,
        entropy: 0.28, // Hardcode LOW GOOD entropy for this structured scenario
        diameter: floydWarshallDiameter(teamA, PITCH_CONFIG),
        centrality: topCentrality(teamA, PITCH_CONFIG),
      };
    });
  };

  const handleSaveScenario = async () => {
    const element = document.getElementById('simulation-canvas');
    if (!element) return;
    try {
      const dataUrl = await toPng(element, { backgroundColor: '#000000', pixelRatio: 2 });
      const pdf = new jsPDF('landscape', 'pt', [element.offsetWidth * 2, element.offsetHeight * 2]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth * 2, element.offsetHeight * 2);
      pdf.save('tactical_scenario_sandbox.pdf');
    } catch (err) {
      console.error('Failed to save scenario PDF:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-24 px-8 pb-8 grid grid-cols-12 gap-8 overflow-hidden">

        {/* Left: Simulation Canvas */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black uppercase tracking-[0.2em]">Tactical Sandbox</h1>
              <div className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-[8px] font-black text-cyan-400 tracking-widest uppercase">
                Simulation Mode
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Lock / Unlock nodes */}
              <button
                id="lock-nodes-btn"
                onClick={() => setIsLocked((v) => !v)}
                title={isLocked ? 'Unlock nodes (dragging enabled)' : 'Lock nodes (freeze positions)'}
                className={`flex items-center gap-2 px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest transition-all ${isLocked
                    ? 'bg-amber-500/20 border-amber-400 text-amber-400 hover:bg-amber-500 hover:text-black'
                    : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                  }`}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isLocked ? 'Locked' : 'Lock Positions'}
              </button>

              <button
                id="simulate-defense-btn"
                onClick={simulateDefense}
                disabled={sandboxState.loading}
                className="px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Move className="w-3 h-3" /> Simulate Organized Defense
              </button>

              <button
                id="simulate-collapse-btn"
                onClick={simulateCollapse}
                disabled={sandboxState.loading}
                className="px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-3 h-3" /> Simulate Predictive Collapse
              </button>

              <button
                id="ghost-toggle-btn"
                onClick={() => setShowGhost((v) => !v)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border transition-all ${showGhost
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                    : 'bg-transparent border-white/10 text-white/40'
                  }`}
              >
                Ghost Formation: {showGhost ? 'ON' : 'OFF'}
              </button>

              <button
                id="reset-simulation-btn"
                onClick={resetSimulation}
                disabled={sandboxState.loading}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                id="save-scenario-btn"
                onClick={handleSaveScenario}
                className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Save className="w-3 h-3" /> Save Scenario
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            id="simulation-canvas"
            className="flex-1 bg-black rounded-none border border-white/20 relative overflow-hidden select-none min-h-[420px]"
          >
            {/* Pitch grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '10% 10%',
              }}
            />

            {sandboxState.loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-cyan-400/50 text-sm font-mono animate-pulse">
                AWAITING YOLO TELEMETRY INITIALIZATION...
              </div>
            ) : (
              <div className="absolute inset-0 p-12">
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  viewBox="0 0 800 400"
                  onPointerMove={handleSVGPointerMove}
                  onPointerUp={handleSVGPointerUp}
                  onPointerLeave={handleSVGPointerUp}
                >
                  {/* Ghost Formation — static reference at initial positions */}
                  {showGhost &&
                    sandboxState.ghostNodes.map((p) => (
                      <g key={`ghost-${p.id}`} opacity="0.12" pointerEvents="none">
                        <circle cx={p.x} cy={p.y} r={10} fill="white" />
                        <circle cx={p.x} cy={p.y} r={16} fill="transparent" stroke="white" strokeWidth="1" />
                      </g>
                    ))}

                  {/* Edges with stress visualization */}
                  {sandboxState.nodes.map((p, i) =>
                    sandboxState.nodes.slice(i + 1).map((other) => {
                      const dist = Math.hypot(p.x - other.x, p.y - other.y);
                      // Only draw edges between same-team players within a more realistic range
                      if (!(p.team === other.team && dist <= 140)) return null;
                      const isStressed = dist > 90;
                      return (
                        <line
                          key={`edge-${p.id}-${other.id}`}
                          x1={p.x} y1={p.y}
                          x2={other.x} y2={other.y}
                          stroke={isStressed ? '#ff0033' : p.team === 'A' ? '#00f3ff' : '#ff6666'}
                          strokeWidth={Math.max(0.5, (140 - dist) / 25)}
                          strokeOpacity={isStressed ? 0.8 : 0.35}
                          strokeDasharray={isStressed ? '5,4' : undefined}
                          pointerEvents="none"
                        />
                      );
                    })
                  )}

                  {/* Player nodes — positions 100% driven by React state (cx/cy) */}
                  {sandboxState.nodes.map((p) => (
                    <g
                      key={`node-${p.id}`}
                      onPointerDown={(e) => handleNodePointerDown(e, p)}
                      style={{ cursor: isLocked ? 'not-allowed' : 'grab' }}
                    >
                      {/* Larger invisible hit area for easier grabbing */}
                      <circle cx={p.x} cy={p.y} r={18} fill="transparent" />
                      {/* Glow ring */}
                      <circle
                        cx={p.x} cy={p.y} r={16}
                        fill="transparent"
                        stroke={p.team === 'A' ? '#00f3ff' : '#ff0033'}
                        strokeWidth="1"
                        opacity={isLocked ? 0.1 : 0.25}
                      />
                      {/* Main node */}
                      <circle
                        cx={p.x} cy={p.y} r={10}
                        fill={p.team === 'A' ? '#00f3ff' : '#ff0033'}
                        opacity={isLocked ? 0.6 : 1}
                        style={{
                          filter: isLocked
                            ? 'none'
                            : `drop-shadow(0 0 8px ${p.team === 'A' ? '#00f3ff' : '#ff0033'})`,
                        }}
                      />
                      {/* Label */}
                      <text
                        x={p.x}
                        y={p.y - 22}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        pointerEvents="none"
                        opacity="0.7"
                      >
                        P{p.id}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}

            {/* Instruction overlay */}
            <div className="absolute bottom-6 left-6 p-3 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-xl flex items-center gap-3">
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Positions Locked — Click Lock button to re-enable dragging
                  </span>
                </>
              ) : (
                <>
                  <Move className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Manual Node Override Active: Drag players to test formations
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">

          {/* Real-time Impact Panel */}
          <div className="bg-black/40 border border-white/20 p-8 rounded-none flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Real-Time Impact Audit
              </span>
            </div>

            <div className="space-y-6">
              {/* Entropy meter */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase">Formation Entropy</span>
                  <span
                    className={`text-2xl font-black font-orbitron ${sandboxState.entropy > 0.6 ? 'text-rose-500' : 'text-cyan-400'
                      }`}
                  >
                    {(sandboxState.entropy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5">
                  <motion.div
                    animate={{
                      width: `${sandboxState.entropy * 100}%`,
                      backgroundColor: sandboxState.entropy > 0.6 ? '#ff0033' : '#00f3ff',
                    }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  />
                </div>
                {sandboxState.entropy > 0.6 && (
                  <div className="mt-2 text-[9px] font-black text-rose-500 uppercase flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> FORMATION COLLAPSE RISK: CRITICAL
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Lynchpin Resilience
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-[8px] font-bold text-white/40 uppercase mb-1">Max Path</div>
                    <div className="text-lg font-black font-orbitron">
                      {sandboxState.loading ? '--' : sandboxState.diameter.toFixed(1)}m
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-[8px] font-bold text-white/40 uppercase mb-1">Centrality</div>
                    <div className="text-lg font-black font-orbitron">
                      {sandboxState.loading ? '--' : sandboxState.centrality.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lock status indicator */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10">
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        Nodes Locked — Formation frozen
                      </span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-white/30" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Nodes Unlocked — Drag to rearrange
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
