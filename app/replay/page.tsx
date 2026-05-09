"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  Clock, 
  Target, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  FileText, 
  AlertTriangle,
  ZoomIn
} from 'lucide-react';

import matchData from '@/public/data/match_telemetry.json';

export default function ReplayLabPage() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Sync players with frameIndex
  useEffect(() => {
    const currentFrame = matchData.timeline[frameIndex];
    if (currentFrame && currentFrame.detections) {
      const uniqueDetections = new Map();
      currentFrame.detections.forEach((d: any) => {
        if (!uniqueDetections.has(d.id)) uniqueDetections.set(d.id, d);
      });

      const updatedPlayers = Array.from(uniqueDetections.values()).map((d: any) => ({
        id: d.id,
        rawX: d.center[0],
        rawY: d.center[1],
        x: (d.center[0] / 1920) * 800,
        y: (d.center[1] / 1080) * 400,
        team: d.team === 'green' ? 'A' : 'B'
      }));
      setPlayers(updatedPlayers);
      setSelectedFrame(currentFrame);
    }
  }, [frameIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % matchData.timeline.length);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const generateAudit = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setReportData({
        matchId: "CODEY-HACK-01",
        date: "2026-05-09",
        criticalMoments: [
          { frame: 42, reason: "Defensive entropy spike (0.84) detected on left flank.", impact: "High" },
          { frame: 124, reason: "Lynchpin Player #8 neutralization risk identified.", impact: "Critical" },
          { frame: 215, reason: "Global connectivity diameter exceeded optimal range.", impact: "Medium" }
        ],
        overallStability: "82.4%",
        recommendation: "Increase defensive line compactness by 12% during transition phases."
      });
      setIsGeneratingReport(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-24 px-8 pb-8 grid grid-cols-12 gap-8 overflow-hidden">
        
        {/* Left: Forensic Video Feed */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black uppercase tracking-[0.2em]">Forensic Replay Lab</h1>
              <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-[8px] font-black text-rose-400 tracking-widest uppercase">Post-Match Audit</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={generateAudit} className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                <FileText className="w-3 h-3" /> {isGeneratingReport ? 'Analyzing...' : 'Generate Intelligence Audit'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black rounded-none border border-white/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 z-10" />
            
            <video 
              className="w-full h-full object-cover opacity-60"
              src="/videos/test.mp4"
              id="replay-video"
            />
            
            {/* HUD Overlays */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1920 1080">
              {players.map(p => (
                <g key={p.id} transform={`translate(${p.rawX}, ${p.rawY})`}>
                  <rect x="-20" y="-20" width="40" height="40" fill="none" stroke={p.team === 'A' ? "#00f3ff" : "#ff0033"} strokeWidth="2" opacity="0.4" />
                  <text y="-30" textAnchor="middle" fill="white" fontSize="12" className="font-mono opacity-50 uppercase">P{p.id}</text>
                </g>
              ))}
            </svg>

            {/* Frame Data HUD */}
            <div className="absolute bottom-8 left-8 p-4 bg-black/80 border border-white/20 backdrop-blur-xl space-y-1">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Frame Intelligence</div>
              <div className="text-sm font-bold font-orbitron">#00{frameIndex} / 00{matchData.timeline.length}</div>
              <div className="text-[8px] text-white/40 uppercase font-mono">Timestamp: {(frameIndex * 0.1).toFixed(2)}s</div>
            </div>
          </div>

          {/* Forensic Timeline Control */}
          <div className="h-32 bg-black/40 border border-white/20 p-6 flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
                   {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                 </button>
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Precise Scrubbing Mode</div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setFrameIndex(Math.max(0, frameIndex - 1))} className="p-2 hover:bg-white/5"><ChevronLeft className="w-4 h-4" /></button>
                 <button onClick={() => setFrameIndex(Math.min(matchData.timeline.length - 1, frameIndex + 1))} className="p-2 hover:bg-white/5"><ChevronRight className="w-4 h-4" /></button>
               </div>
             </div>
             
             <div className="relative h-4 w-full bg-white/5 cursor-pointer group" onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const pct = x / rect.width;
               setFrameIndex(Math.floor(pct * matchData.timeline.length));
             }}>
               <motion.div 
                 animate={{ width: `${(frameIndex / matchData.timeline.length) * 100}%` }}
                 className="h-full bg-cyan-500 relative"
               >
                 <div className="absolute right-[-2px] top-[-4px] bottom-[-4px] w-1 bg-white shadow-[0_0_10px_white]" />
               </motion.div>
               {/* Event Markers */}
               <div className="absolute top-0 bottom-0 left-[24%] w-0.5 bg-rose-500/50" />
               <div className="absolute top-0 bottom-0 left-[68%] w-0.5 bg-rose-500/50" />
             </div>
          </div>
        </div>

        {/* Right: Forensic Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          {/* Frame Inspector */}
          <div className="bg-black/40 border border-white/20 p-6 rounded-none flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <ZoomIn className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Frame Inspector</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10">
                <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Detected Objects</div>
                <div className="text-2xl font-black font-orbitron">{players.length} <span className="text-[10px] font-normal text-white/40">NODES</span></div>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/10">
                <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Structural Entropy</div>
                <div className="text-2xl font-black font-orbitron text-cyan-400">0.421</div>
                <div className="mt-2 h-1 w-full bg-white/5">
                  <div className="h-full bg-cyan-500 w-[42%]" />
                </div>
              </div>

              <div className="p-4 bg-rose-500/5 border border-rose-500/20">
                <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Tactical Anomaly Detection</div>
                <p className="text-[10px] text-white/60 leading-tight">No critical structural fractures identified in this frame.</p>
              </div>
            </div>
          </div>

          {/* Audit Report Result */}
          <AnimatePresence>
            {reportData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white p-8 text-black flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div className="text-2xl font-black font-orbitron uppercase">Tactical Audit</div>
                  <div className="text-[10px] font-bold text-black/40 font-mono">ID: {reportData.matchId}</div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30 border-b border-black/10 pb-2">Critical Breakdown Moments</div>
                  {reportData.criticalMoments.map((moment: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="text-xs font-black font-mono">#{moment.frame}</div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-tighter">{moment.reason}</div>
                        <div className="text-[8px] font-black text-rose-600 uppercase">Impact: {moment.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-black/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Final Recommendation</div>
                  <div className="text-sm font-bold leading-snug">{reportData.recommendation}</div>
                  <button onClick={() => setReportData(null)} className="mt-6 w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-all">
                    Export PDF Report
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!reportData && (
             <div className="flex-1 border border-dashed border-white/10 flex flex-center items-center justify-center p-8 text-center opacity-40">
                <div className="flex flex-col items-center gap-4">
                  <FileText className="w-12 h-12 text-white/20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Report Generated</p>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}
