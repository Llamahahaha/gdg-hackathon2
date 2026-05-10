"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { 
  Search, Clock, Target, Activity, ChevronLeft, ChevronRight, Play, Pause, FileText, AlertTriangle, ZoomIn, Download
} from 'lucide-react';
import { useTactical } from '@/context/TacticalContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReplayLabPage() {
  const { timelineData: timeline, status: liveStatus } = useTactical();
  const [loading, setLoading] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (timeline && timeline.length > 0) {
      setLoading(false);
    }
  }, [timeline]);

  // Sync players with frameIndex
  useEffect(() => {
    if (!timeline || timeline.length === 0) return;
    const currentFrame = timeline[frameIndex];
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
  }, [frameIndex, timeline]);

  useEffect(() => {
    if (!isPlaying || !timeline || timeline.length === 0) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % timeline.length);
    }, 100); // Replaying at ~10 FPS for analysis clarity
    return () => clearInterval(interval);
  }, [isPlaying, timeline]);

  const generateAudit = () => {
    if (!timeline || timeline.length === 0) return;
    setIsGeneratingReport(true);
    
    // Scan timeline for critical moments
    const moments: any[] = [];
    timeline.forEach((f: any, i: number) => {
      if (f.metrics?.entropy > 0.8 && moments.length < 3) {
        moments.push({ frame: i, reason: `Entropy spike (${f.metrics.entropy.toFixed(2)})`, impact: "Critical" });
      } else if (f.metrics?.articulation_points?.length > 0 && moments.length < 3) {
        moments.push({ frame: i, reason: `Lynchpin vulnerability detected at Player #${f.metrics.articulation_points[0]}`, impact: "High" });
      }
    });

    if (moments.length === 0) {
      moments.push({ frame: timeline.length - 1, reason: "No critical structural fractures identified. System stable.", impact: "Low" });
    }

    const avgEntropy = (timeline.reduce((acc: number, f: any) => acc + (f.metrics?.entropy || 0), 0) / timeline.length).toFixed(2);
    
    const generatedData = {
        matchId: "FT-AI-AUDIT",
        date: new Date().toLocaleDateString().toUpperCase(),
        criticalMoments: moments,
        overallStability: `${(100 - parseFloat(avgEntropy)*100).toFixed(1)}%`,
        recommendation: parseFloat(avgEntropy) > 0.5 ? "Increase defensive line compactness by 12% during transition phases." : "Structure optimal. Maintain pressing intensity."
    };

    setTimeout(() => {
      setReportData(generatedData);
      setIsGeneratingReport(false);
      downloadPDF(generatedData);
    }, 1500);
  };

  const downloadPDF = (data: any) => {
    const doc = new jsPDF();
    doc.setFillColor(11, 15, 26);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(0, 243, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FIELDTHEORY AI: TACTICAL AUDIT", 14, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`MATCH ID: ${data.matchId}`, 14, 30);
    doc.text(`DATE: ${data.date}`, 14, 36);
    doc.text(`OVERALL STABILITY: ${data.overallStability}`, 14, 42);
    
    doc.setTextColor(0, 243, 255);
    doc.text("CRITICAL BREAKDOWN MOMENTS", 14, 55);
    
    const tableData = data.criticalMoments.map((m: any) => [
        `#${m.frame}`, m.reason, m.impact
    ]);

    autoTable(doc, {
        startY: 60,
        head: [['Frame', 'Tactical Event', 'Impact Risk']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 243, 255], textColor: [11, 15, 26], fontStyle: 'bold' },
        bodyStyles: { fillColor: [18, 18, 18], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [25, 25, 25] },
        styles: { font: 'helvetica' }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setTextColor(0, 243, 255);
    doc.text("AI TACTICAL RECOMMENDATION", 14, finalY);
    doc.setTextColor(255, 255, 255);
    doc.text(data.recommendation, 14, finalY + 8);

    doc.save("FieldTheory_Tactical_Audit.pdf");
  };

  const currentEntropy = selectedFrame?.metrics?.entropy || 0;
  const isAnomaly = currentEntropy > 0.6;

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans flex flex-col overflow-hidden">
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
              <button onClick={generateAudit} disabled={loading || !timeline || timeline.length === 0} className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isGeneratingReport ? <Activity className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} 
                {isGeneratingReport ? 'Generating PDF...' : 'Download Intelligence Audit'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black rounded-none border border-white/20 relative overflow-hidden group min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-cyan-400/50 text-sm font-mono animate-pulse">AWAITING YOLO TELEMETRY...</div>
            ) : (
              <>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 z-10" />
                
                {/* HUD Overlays */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1920 1080">
                  {players.map((p, i) => (
                    <g key={p.id} transform={`translate(${p.rawX}, ${p.rawY})`}>
                      <rect x="-20" y="-20" width="40" height="40" fill="none" stroke={p.team === 'A' ? "#00f3ff" : "#ff0033"} strokeWidth="2" opacity="0.4" />
                      <text y="-30" textAnchor="middle" fill="white" fontSize="12" className="font-mono opacity-50 uppercase">P{p.id}</text>
                    </g>
                  ))}
                  {/* Edges */}
                  {players.map((p, i) => (
                      players.slice(i + 1).map((other) => {
                        const dist = Math.hypot(p.rawX - other.rawX, p.rawY - other.rawY);
                        if (dist > 400) return null;
                        const isSameTeam = p.team === other.team;
                        const isStressed = dist > 250;
                        
                        return (
                          <line
                            key={`${p.id}-${other.id}`}
                            x1={p.rawX} y1={p.rawY} x2={other.rawX} y2={other.rawY}
                            stroke={isStressed ? "#ff0033" : (isSameTeam ? "#00f3ff" : "#ffffff")}
                            strokeWidth={isSameTeam ? 1.5 : 0.5}
                            opacity={isSameTeam ? (isStressed ? 0.8 : 0.3) : 0.1}
                            strokeDasharray={isStressed ? "4,4" : "0"}
                          />
                        );
                      })
                   ))}
                </svg>

                {/* Frame Data HUD */}
                <div className="absolute bottom-8 left-8 p-4 bg-black/80 border border-white/20 backdrop-blur-xl space-y-1">
                  <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Frame Intelligence</div>
                  <div className="text-sm font-bold font-orbitron">#00{frameIndex} / 00{timeline?.length || 0}</div>
                  <div className="text-[8px] text-white/40 uppercase font-mono">Timestamp: {(frameIndex * 0.1).toFixed(2)}s</div>
                </div>
              </>
            )}
          </div>

          {/* Forensic Timeline Control */}
          <div className="h-32 bg-black/40 border border-white/20 p-6 flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <button onClick={() => setIsPlaying(!isPlaying)} disabled={loading || !timeline || timeline.length === 0} className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-50">
                   {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                 </button>
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Precise Scrubbing Mode</div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setFrameIndex(Math.max(0, frameIndex - 1))} disabled={loading} className="p-2 hover:bg-white/5 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                 <button onClick={() => setFrameIndex(Math.min((timeline?.length || 1) - 1, frameIndex + 1))} disabled={loading} className="p-2 hover:bg-white/5 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
               </div>
             </div>
             
             <div className="relative h-4 w-full bg-white/5 cursor-pointer group" onClick={(e) => {
               if (loading || !timeline || timeline.length === 0) return;
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const pct = x / rect.width;
               setFrameIndex(Math.floor(pct * timeline.length));
             }}>
               <motion.div 
                 animate={{ width: timeline && timeline.length > 0 ? `${(frameIndex / timeline.length) * 100}%` : '0%' }}
                 className="h-full bg-cyan-500 relative"
               >
                 <div className="absolute right-[-2px] top-[-4px] bottom-[-4px] w-1 bg-white shadow-[0_0_10px_white]" />
               </motion.div>
               {/* Event Markers based on high entropy in real timeline */}
               {timeline && timeline.map((f: any, i: number) => {
                 if (f.metrics?.entropy > 0.8) {
                   return <div key={i} className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(i / timeline.length) * 100}%` }} />
                 }
                 return null;
               })}
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
                <div className="text-2xl font-black font-orbitron">{loading ? '--' : players.length} <span className="text-[10px] font-normal text-white/40">NODES</span></div>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/10">
                <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Structural Entropy</div>
                <div className={`text-2xl font-black font-orbitron ${isAnomaly ? 'text-rose-500' : 'text-cyan-400'}`}>{loading ? '--' : currentEntropy.toFixed(3)}</div>
                <div className="mt-2 h-1 w-full bg-white/5">
                  <motion.div 
                    animate={{ width: `${currentEntropy * 100}%` }}
                    className={`h-full ${isAnomaly ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                  />
                </div>
              </div>

              <div className={`p-4 border ${isAnomaly ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isAnomaly ? 'text-rose-500' : 'text-cyan-400'}`}>Tactical Anomaly Detection</div>
                <p className="text-[10px] text-white/60 leading-tight">
                  {isAnomaly 
                    ? `CRITICAL FRACTURE DETECTED. Graph Laplacian threshold exceeded.` 
                    : `No critical structural fractures identified in this frame.`}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Report Result */}
          <AnimatePresence>
            {reportData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 bg-cyan-500/10 border border-cyan-500/30 p-8 text-white flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div className="text-xl font-black font-orbitron uppercase text-cyan-400">Tactical Audit Generated</div>
                  <div className="text-[10px] font-bold text-white/40 font-mono">ID: {reportData.matchId}</div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400/50 border-b border-cyan-500/20 pb-2">Critical Breakdown Moments</div>
                  {reportData.criticalMoments.map((moment: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="text-xs font-black font-mono text-cyan-400">#{moment.frame}</div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-tighter">{moment.reason}</div>
                        <div className="text-[8px] font-black text-rose-500 uppercase">Impact: {moment.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-cyan-500/20">
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400/50 mb-2">Final Recommendation</div>
                  <div className="text-sm font-bold leading-snug">{reportData.recommendation}</div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <FileText className="w-3 h-3" /> PDF Successfully Downloaded
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!reportData && (
             <div className="flex-1 border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center opacity-40">
                <FileText className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Report Generated</p>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}
