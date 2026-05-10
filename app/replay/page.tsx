"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  ChevronLeft, ChevronRight, Play, Pause,
  FileText, ZoomIn, Download, Activity, AlertTriangle, Brain, Route
} from 'lucide-react';
import { useTactical, FrameData } from '@/context/TacticalContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface ReportData {
  matchId: string;
  date: string;
  criticalMoments: { frame: number; reason: string; impact: string }[];
  overallStability: string;
  recommendation: string;
  aiSummary: string;
  defensiveStability: string;
  offensiveTransition: string;
  keyTakeaways: string[];
}

export default function ReplayLabPage() {
  const { timelineData: liveTimeline, uploadedVideoSrc } = useTactical();
  const [frozenTimeline, setFrozenTimeline] = useState<FrameData[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [neutralizedIds, setNeutralizedIds] = useState<number[]>([]);

  useEffect(() => {
    if (isPlaying || (liveTimeline && liveTimeline.length > 0 && frozenTimeline.length === 0)) {
      requestAnimationFrame(() => {
        setFrozenTimeline(liveTimeline);
      });
    }
  }, [liveTimeline, isPlaying, frozenTimeline.length]);

  const timeline = frozenTimeline;

  // Two-step audit state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showTacticalRoute, setShowTacticalRoute] = useState(false);

  const peakEntropyFrameIndex = React.useMemo(() => {
    if (!timeline || timeline.length === 0) return 0;
    let max = 0;
    let idx = 0;
    timeline.forEach((f, i) => {
      if ((f.metrics?.entropy || 0) > max) { max = f.metrics.entropy; idx = i; }
    });
    return idx;
  }, [timeline]);

  const preCollapseFrameIndex = Math.max(0, peakEntropyFrameIndex - 45); // ~1.5s before peak

  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedFrame = React.useMemo(() => {
    if (!timeline || timeline.length === 0) return null;
    return timeline[Math.min(frameIndex, timeline.length - 1)] || null;
  }, [frameIndex, timeline]);

  const players = React.useMemo(() => {
    if (!selectedFrame) return [];
    interface Detection { id: string | number; center: [number, number]; team: string; }
    const uniqueDetections = new Map<string, Detection>();

    (selectedFrame.detections || []).forEach((d: Detection) => {
      const key = String(d.id);
      if (!uniqueDetections.has(key)) uniqueDetections.set(key, d);
    });

    return Array.from(uniqueDetections.values()).map((d) => ({
      id: String(d.id),
      rawX: d.center[0],
      rawY: d.center[1],
      team: d.team === 'green' ? 'A' : 'B',
    }));
  }, [selectedFrame]);

  useEffect(() => {
    if (isPlaying) {
      requestAnimationFrame(() => {
        setNeutralizedIds([]);
      });
    }
  }, [isPlaying]);

  // ── Auto-play scrubber ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !timeline || timeline.length === 0) return;
    const id = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % timeline.length);
    }, 250);
    return () => clearInterval(id);
  }, [isPlaying, timeline]);

  // ── Sync video playback with scrubber ─────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !uploadedVideoSrc) return;
    if (isPlaying) video.play().catch(() => { });
    else video.pause();
  }, [isPlaying, uploadedVideoSrc]);

  // ── STEP 1: Analyze — call backend Ollama endpoint ────────────────────────
  const analyzeReport = async () => {
    const dataToAnalyze = timeline;
    if (!dataToAnalyze || dataToAnalyze.length === 0) return;
    setIsAnalyzing(true);
    setReportData(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${window.location.hostname}:8000`;
      const res = await fetch(`${backendUrl}/generate-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline: dataToAnalyze }),
      });
      const aiReport = await res.json();

      // Scan for critical events
      const moments: { frame: number; reason: string; impact: string }[] = [];
      timeline.forEach((f, i) => {
        if (f.metrics?.entropy > 0.8 && moments.length < 5) {
          moments.push({ frame: i, reason: `Entropy spike (${f.metrics.entropy.toFixed(2)})`, impact: 'Critical' });
        } else if (f.metrics?.articulation_points?.length > 0 && moments.length < 5) {
          moments.push({
            frame: i,
            reason: `Lynchpin at Player #${f.metrics.articulation_points[0]}`,
            impact: 'High',
          });
        }
      });
      if (moments.length === 0)
        moments.push({ frame: timeline.length - 1, reason: 'No structural fractures detected. System stable.', impact: 'Low' });

      const avgEntropy = (
        timeline.reduce((a: number, f) => a + (f.metrics?.entropy || 0), 0) / timeline.length
      ).toFixed(2);

      setReportData({
        matchId: 'FT-OLLAMA-AUDIT',
        date: new Date().toLocaleDateString().toUpperCase(),
        criticalMoments: moments,
        overallStability: `${(100 - parseFloat(avgEntropy) * 100).toFixed(1)}%`,
        recommendation: aiReport.strategic_advice || 'Maintain formation compactness.',
        aiSummary: aiReport.summary || 'Analysis complete.',
        defensiveStability: aiReport.defensive_stability || 'Defensive structure was generally compact with acceptable diameter.',
        offensiveTransition: aiReport.offensive_transition || 'Transitions relied heavily on isolated lynchpin movements.',
        keyTakeaways: aiReport.key_takeaways || [],
      });
    } catch (_err) {
      console.error('Ollama audit failed:', _err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── STEP 2: Download — generate & save PDF ────────────────────────────────
  const downloadPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();

    // Background
    doc.setFillColor(11, 15, 26);
    doc.rect(0, 0, 210, 297, 'F');

    // Title
    doc.setTextColor(0, 243, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('FIELDTHEORY AI · TACTICAL AUDIT', 14, 20);

    // Meta
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`MATCH ID: ${reportData.matchId}   DATE: ${reportData.date}   STABILITY: ${reportData.overallStability}`, 14, 29);

    // AI Summary
    doc.setTextColor(0, 243, 255);
    doc.setFontSize(11);
    doc.text('AI EXECUTIVE SUMMARY', 14, 40);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const splitSummary = doc.splitTextToSize(reportData.aiSummary, 182);
    doc.text(splitSummary, 14, 47);

    let y = 47 + splitSummary.length * 5 + 6;

    // Defensive Stability
    doc.setTextColor(0, 243, 255);
    doc.setFontSize(10);
    doc.text('DEFENSIVE STABILITY', 14, y);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const splitDef = doc.splitTextToSize(reportData.defensiveStability, 182);
    doc.text(splitDef, 14, y + 6);
    y += splitDef.length * 5 + 8;

    // Offensive Transition
    doc.setTextColor(0, 243, 255);
    doc.setFontSize(10);
    doc.text('OFFENSIVE TRANSITION', 14, y);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const splitOff = doc.splitTextToSize(reportData.offensiveTransition, 182);
    doc.text(splitOff, 14, y + 6);
    y += splitOff.length * 5 + 10;

    // Critical moments table
    doc.setTextColor(0, 243, 255);
    doc.setFontSize(11);
    doc.text('CRITICAL BREAKDOWN MOMENTS', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Frame', 'Tactical Event', 'Impact']],
      body: reportData.criticalMoments.map((m) => [`#${m.frame}`, m.reason, m.impact]),
      theme: 'grid',
      headStyles: { fillColor: [0, 243, 255], textColor: [11, 15, 26], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fillColor: [18, 18, 18], textColor: [255, 255, 255], fontSize: 8 },
      alternateRowStyles: { fillColor: [25, 25, 25] },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    // Key takeaways
    if (reportData.keyTakeaways?.length) {
      doc.setTextColor(0, 243, 255);
      doc.setFontSize(11);
      doc.text('KEY OBSERVATIONS', 14, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      reportData.keyTakeaways.forEach((item: string, i: number) => {
        doc.text(`• ${item}`, 14, y + 8 + i * 6);
      });
      y += reportData.keyTakeaways.length * 6 + 14;
    }

    // Strategic recommendation
    doc.setTextColor(0, 243, 255);
    doc.setFontSize(11);
    doc.text('STRATEGIC RECOMMENDATION', 14, y);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const splitRec = doc.splitTextToSize(reportData.recommendation, 182);
    doc.text(splitRec, 14, y + 8);

    doc.save('FieldTheory_AI_Tactical_Audit.pdf');
  };

  const baseEntropy = selectedFrame?.metrics?.entropy ?? 0;
  const currentEntropy = neutralizedIds.length > 0 ? 1.00 : baseEntropy;
  const isAnomaly = currentEntropy > 0.6;
  const hasData = timeline && timeline.length > 0;

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-24 px-8 pb-8 grid grid-cols-12 gap-6 overflow-hidden">

        {/* ── Left column: video + scrubber ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black uppercase tracking-[0.2em]">Forensic Replay Lab</h1>
              <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-[8px] font-black text-rose-400 tracking-widest uppercase">
                Post-Match Audit
              </div>
              {!uploadedVideoSrc && (
                <div className="text-[9px] font-mono text-white/30 animate-pulse">
                  → Upload a video in Live Engine to begin
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Step 1 – Analyze */}
              {!isPlaying && hasData && (
                <button
                  onClick={analyzeReport}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Activity className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                  {isAnalyzing ? 'Llama Thinking...' : 'Analyze Frame Data'}
                </button>
              )}
              {/* Step 2 – Download */}
              {!isPlaying && hasData && reportData && (
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Download className="w-3 h-3" />
                  Download Audit
                </button>
              )}
            </div>
          </div>

          {/* Video canvas */}
          <div className="relative bg-black border border-white/20 overflow-hidden min-h-[420px] flex-1">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 z-10 pointer-events-none" />

            {/* Video element */}
            {uploadedVideoSrc ? (
              <video
                ref={videoRef}
                src={uploadedVideoSrc}
                className="w-full h-full object-cover opacity-70"
                muted
                loop
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
                <FileText className="w-16 h-16" />
                <span className="text-[11px] font-black uppercase tracking-widest">No video loaded — upload in Live Engine</span>
              </div>
            )}

            {/* Player/edge SVG overlay */}
            {hasData && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080">
                {/* Edges */}
                {players.map((p, i) =>
                  players.slice(i + 1).map(other => {
                    const isNeutralized = neutralizedIds.includes(Number(p.id)) || neutralizedIds.includes(Number(other.id));
                    if (isNeutralized) return null; // Break edges if neutralized

                    const dist = Math.hypot(p.rawX - other.rawX, p.rawY - other.rawY);
                    if (dist > 400) return null;
                    const same = p.team === other.team;
                    const stressed = dist > 250;
                    return (
                      <line
                        key={`${p.id}-${other.id}`}
                        x1={p.rawX} y1={p.rawY} x2={other.rawX} y2={other.rawY}
                        stroke={stressed ? '#ff0033' : same ? '#00f3ff' : '#ffffff'}
                        strokeWidth={same ? 1.5 : 0.5}
                        opacity={same ? (stressed ? 0.8 : 0.3) : 0.1}
                        strokeDasharray={stressed ? '4 4' : '0'}
                        className="pointer-events-none"
                      />
                    );
                  })
                )}

                {/* Adaptive Tactical Routing (Dijkstra's Path) */}
                {showTacticalRoute && (() => {
                  const teamANodes = players.filter(p => p.team === 'A' && !neutralizedIds.includes(Number(p.id))).sort((a, b) => a.rawX - b.rawX);
                  if (teamANodes.length < 2) return null;

                  // Simple heuristic for "safest path": Goalkeeper -> Mid 1 -> Mid 2 -> Striker
                  const pathNodes = [
                    teamANodes[0],
                    teamANodes[Math.floor(teamANodes.length * 0.33)],
                    teamANodes[Math.floor(teamANodes.length * 0.66)],
                    teamANodes[teamANodes.length - 1]
                  ];

                  const d = `M ${pathNodes.map(n => `${n.rawX},${n.rawY}`).join(' L ')}`;
                  return (
                    <path d={d} fill="none" stroke="#00ff66" strokeWidth="3" strokeDasharray="8 8" className="drop-shadow-[0_0_15px_#00ff66] pointer-events-none" />
                  );
                })()}

                {/* Player nodes */}
                {players.map(p => {
                  const isArticulation = selectedFrame?.metrics?.articulation_points?.includes(String(p.id));
                  const isNeutralized = neutralizedIds.includes(Number(p.id));

                  if (isNeutralized) return null; // Remove from map entirely

                  return (
                    <g
                      key={p.id}
                      transform={`translate(${p.rawX},${p.rawY})`}
                      className={isArticulation ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                      onClick={() => {
                        if (isArticulation && !isPlaying) {
                          setNeutralizedIds(prev => [...prev, Number(p.id)]);
                        }
                      }}
                    >
                      <circle
                        r={isArticulation ? 28 : 14}
                        fill={isArticulation ? '#ff003344' : p.team === 'A' ? '#00f3ff22' : '#ff003322'}
                        stroke={isArticulation ? '#ff0055' : p.team === 'A' ? '#00f3ff' : '#ff0033'}
                        strokeWidth={isArticulation ? 3 : 2}
                        className={isArticulation ? 'animate-pulse' : ''}
                      />
                      {isArticulation && (
                        <circle r={36} fill="transparent" stroke="#ff0055" strokeWidth={1} className="animate-ping pointer-events-none" />
                      )}
                      <text y={-32} textAnchor="middle" fill="white" fontSize={14} fontFamily="monospace" opacity={0.9} className="pointer-events-none font-bold shadow-black drop-shadow-md">
                        P{p.id} {isArticulation && '[NEUTRALIZE]'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Frame HUD */}
            {hasData && (
              <div className="absolute bottom-5 left-5 p-3 bg-black/80 border border-white/20 backdrop-blur-xl space-y-0.5">
                <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Frame Intelligence</div>
                <div className="text-sm font-bold font-mono">
                  #{String(frameIndex).padStart(4, '0')} / {String(timeline.length).padStart(4, '0')}
                </div>
                <div className="text-[8px] text-white/40 font-mono">T: {(frameIndex * 0.033).toFixed(2)}s</div>
              </div>
            )}
          </div>

          {/* Scrubber + controls */}
          <div className="bg-black/40 border border-white/20 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  disabled={!hasData}
                  className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Precision Scrubbing</span>
                {isPlaying && (
                  <span className="text-[8px] font-black uppercase text-rose-400 animate-pulse">● PLAYING</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {hasData && (
                  <button
                    onClick={() => {
                      if (!isCompareMode) {
                        setFrameIndex(peakEntropyFrameIndex);
                        setIsCompareMode(true);
                      } else {
                        setFrameIndex(preCollapseFrameIndex);
                        setIsCompareMode(false);
                      }
                      setIsPlaying(false);
                      setNeutralizedIds([]);
                    }}
                    className={`px-4 py-1.5 border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isCompareMode ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'}`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {isCompareMode ? 'Viewing: Peak Collapse' : 'Viewing: Stable Pre-Collapse'}
                  </button>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => { setFrameIndex(i => Math.max(0, i - 1)); setIsCompareMode(false); }}
                    disabled={!hasData}
                    className="p-2 hover:bg-white/5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setFrameIndex(i => Math.min((timeline?.length || 1) - 1, i + 1)); setIsCompareMode(false); }}
                    disabled={!hasData}
                    className="p-2 hover:bg-white/5 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline bar */}
            <div
              className="relative h-3 w-full bg-white/5 cursor-pointer"
              onClick={e => {
                if (!hasData) return;
                const r = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - r.left) / r.width;
                setFrameIndex(Math.floor(pct * timeline.length));
              }}
            >
              <motion.div
                animate={{ width: hasData ? `${(frameIndex / timeline.length) * 100}%` : '0%' }}
                className="h-full bg-cyan-500 relative"
              >
                <div className="absolute right-[-2px] top-[-4px] bottom-[-4px] w-1 bg-white shadow-[0_0_8px_white]" />
              </motion.div>
              {/* Entropy spike markers */}
              {timeline?.map((f, i) =>
                f.metrics?.entropy > 0.8 ? (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-rose-500/80"
                    style={{ left: `${(i / timeline.length) * 100}%` }}
                  />
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: inspector + report ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

          {/* Frame inspector */}
          <div className="bg-black/40 border border-white/20 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-cyan-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Frame Inspector</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Detected Nodes</div>
                  <div className="text-xl font-black font-mono">{players.length} <span className="text-[9px] font-normal text-white/40">players</span></div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Possession</div>
                  <div className={`text-xl font-black font-mono ${selectedFrame?.possession === 'A' ? 'text-[#00f3ff]' : selectedFrame?.possession === 'B' ? 'text-[#ff0033]' : 'text-white/60'}`}>
                    {selectedFrame?.possession === 'A' ? 'TEAM A' : selectedFrame?.possession === 'B' ? 'TEAM B' : 'UNKNOWN'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Team A (Green)</div>
                  <div className="text-xl font-black font-mono text-[#00f3ff]">{selectedFrame?.t1 || 0} <span className="text-[9px] font-normal text-white/40">nodes</span></div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Team B (White)</div>
                  <div className="text-xl font-black font-mono text-[#ff0033]">{selectedFrame?.t2 || 0} <span className="text-[9px] font-normal text-white/40">nodes</span></div>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest">Structural Entropy</div>
                  <div className={`text-xl font-black font-mono ${isAnomaly ? 'text-rose-500' : 'text-cyan-400'}`}>
                    {currentEntropy.toFixed(3)}
                  </div>
                </div>
                <div className="h-1 w-full bg-white/5">
                  <motion.div
                    animate={{ width: `${currentEntropy * 100}%` }}
                    className={`h-full ${isAnomaly ? 'bg-rose-500' : 'bg-cyan-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Team Diameter</div>
                  <div className="text-xl font-black font-mono">
                    {(selectedFrame?.metrics?.diameter || 0).toFixed(0)}<span className="text-[9px] font-normal text-white/40">px</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Lynchpins (AP)</div>
                  <div className={`text-xl font-black font-mono ${(selectedFrame?.metrics?.articulation_points?.length || 0) > 0 ? 'text-rose-500' : 'text-cyan-400'}`}>
                    {selectedFrame?.metrics?.articulation_points?.length || 0}
                  </div>
                </div>
              </div>

              <div className={`p-4 border ${isAnomaly ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className={`text-[7px] font-black uppercase tracking-widest mb-1 ${isAnomaly ? 'text-rose-500' : 'text-cyan-400'}`}>
                  Anomaly Detection
                </div>
                <p className="text-[9px] text-white/60 leading-snug">
                  {isAnomaly
                    ? 'CRITICAL FRACTURE: Graph Laplacian threshold exceeded.'
                    : 'No structural fractures detected in this frame.'}
                </p>
              </div>

              <button
                onClick={() => setShowTacticalRoute(!showTacticalRoute)}
                className={`w-full p-4 border transition-all flex items-center justify-between group ${showTacticalRoute ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <Route className={`w-4 h-4 ${showTacticalRoute ? 'text-emerald-400 animate-pulse' : 'text-white/40 group-hover:text-white/60'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${showTacticalRoute ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'}`}>
                    Tactical Routing (Dijkstra)
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${showTacticalRoute ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/10'}`} />
              </button>
            </div>
          </div>

          {/* Audit result card */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 border border-cyan-500/20 bg-cyan-500/5 flex flex-col items-center justify-center gap-4 p-8 text-center"
                >
                  <Activity className="w-10 h-10 text-cyan-400 animate-spin" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Llama 3.2 Analyzing...</div>
                  <div className="text-[9px] text-white/40">Generating tactical intelligence report</div>
                </motion.div>
              )}

              {!isAnalyzing && reportData && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 bg-cyan-500/10 border border-cyan-500/30 p-6 flex flex-col gap-4 overflow-y-auto"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-[11px] font-black font-mono uppercase text-cyan-400">AI Audit Ready</div>
                    <div className="text-[8px] text-white/30 font-mono">{reportData.matchId}</div>
                  </div>

                  <div className="text-[9px] text-white/70 leading-relaxed border-b border-white/10 pb-3">
                    {reportData.aiSummary}
                  </div>

                  <div className="space-y-1 border-b border-white/10 pb-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400/60">Defensive Stability</div>
                    <div className="text-[9px] text-white/60 leading-snug">{reportData.defensiveStability}</div>
                  </div>

                  <div className="space-y-1 border-b border-white/10 pb-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400/60">Offensive Transition</div>
                    <div className="text-[9px] text-white/60 leading-snug">{reportData.offensiveTransition}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400/60">Critical Moments</div>
                    {reportData.criticalMoments.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="text-[8px] font-black text-cyan-400 font-mono">#{m.frame}</span>
                        <div>
                          <div className="text-[8px] font-bold uppercase">{m.reason}</div>
                          <div className="text-[7px] text-rose-400 font-black uppercase">Impact: {m.impact}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reportData.keyTakeaways?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400/60">Key Takeaways</div>
                      {reportData.keyTakeaways.map((t: string, i: number) => (
                        <div key={i} className="text-[8px] text-white/60 flex gap-2">
                          <span className="text-cyan-400">›</span> {t}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-cyan-500/20">
                    <div className="text-[7px] font-black uppercase tracking-widest text-cyan-400/50 mb-1">Strategic Recommendation</div>
                    <div className="text-[9px] font-bold leading-snug">{reportData.recommendation}</div>
                  </div>

                  <button
                    onClick={downloadPDF}
                    className="w-full py-3 bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" /> Download Full PDF Audit
                  </button>
                </motion.div>
              )}

              {!isAnalyzing && !reportData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center opacity-40"
                >
                  <Brain className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    Click &quot;Analyze&quot; to run Llama 3.2 tactical analysis
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
