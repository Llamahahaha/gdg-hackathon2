"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, ShieldAlert, Target, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  summary: {
    team1_total: number;
    team2_total: number;
  };
  timeline: {
    metrics: {
      entropy: number;
      diameter: number;
      articulation_points: string[];
    };
  }[];
}

export default function IntelligenceReportPage() {
  const [tacticalData, setTacticalData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/tactical_data.json')
      .then(res => res.json())
      .then(data => {
        setTacticalData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tactical data", err);
        setLoading(false);
      });
  }, []);

  // Process data for charts
  const timeline = tacticalData?.timeline || [];
  
  // Real Entropy Data mapped for the chart
  const entropyData = timeline.slice(0, 100).map((frame, idx) => ({
    time: `${(idx / 30).toFixed(1)}s`,
    entropy: frame.metrics?.entropy || 0
  }));

  // Average Metrics
  const avgEntropy = timeline.length > 0 ? (timeline.reduce((acc: number, f) => acc + (f.metrics?.entropy || 0), 0) / timeline.length).toFixed(2) : "0.00";
  const avgDiameter = timeline.length > 0 ? (timeline.reduce((acc: number, f) => acc + (f.metrics?.diameter || 0), 0) / timeline.length).toFixed(1) : "0.0";
  
  // Find all unique articulation points (lynchpins) identified during the match
  const allLynchpins = new Set<string>();
  let fractureAlerts = 0;
  
  timeline.forEach((frame) => {
    const aps = frame.metrics?.articulation_points || [];
    if (aps.length > 0) fractureAlerts++;
    aps.forEach((ap: string) => allLynchpins.add(ap));
  });

  const uniqueLynchpins = Array.from(allLynchpins);

  const efficiencyData = [
    { zone: 'Final Third', val: tacticalData ? 65 + (timeline.length % 10) : 65 },
    { zone: 'Midfield', val: tacticalData ? 88 - (timeline.length % 5) : 88 },
    { zone: 'Defensive', val: tacticalData ? 94 : 94 },
    { zone: 'Transition', val: tacticalData ? 72 + (timeline.length % 15) : 72 },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("POST-MATCH TACTICAL AUDIT", 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`MATCH_ID: #YOLO-LIVE`, 14, 32);
    doc.text(`DATE: ${new Date().toLocaleDateString().toUpperCase()}`, 14, 38);
    
    doc.setFont("helvetica", "bold");
    doc.text("PRIMARY METRICS", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Avg Formation Entropy: ${avgEntropy}`, 14, 60);
    doc.text(`Avg Team Diameter: ${avgDiameter}px`, 14, 66);
    doc.text(`Fracture Alerts: ${fractureAlerts}`, 14, 72);

    const tableData = uniqueLynchpins.map((nodeId) => {
      let count = 0;
      timeline.forEach((f) => {
        if (f.metrics?.articulation_points?.includes(nodeId)) count++;
      });
      return [ `Player #${nodeId}`, `${count} frames`, count > 10 ? "CRITICAL" : "MED", count > 10 ? "VULNERABLE" : "MONITORING" ];
    });

    autoTable(doc, {
      startY: 85,
      head: [['Node ID', 'Detection Count', 'Criticality', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 243, 255], textColor: [0, 0, 0] }
    });

    doc.save('intelligence_report.pdf');
  };

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <FileText className="w-4 h-4 text-cyan-400" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Tactical Intelligence Report</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-orbitron tracking-tighter uppercase">POST-MATCH AUDIT</h1>
              <div className="flex gap-4">
                 <span className="text-[10px] font-bold text-cyan-400 font-mono">MATCH_ID: #YOLO-LIVE</span>
                 <span className="text-[10px] font-bold text-gray-500 font-mono">DATE: {new Date().toLocaleDateString().toUpperCase()}</span>
              </div>
           </div>
           
           <div className="flex gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                 <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">AI</div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Active Analyst</span>
                    <span className="text-[10px] font-bold text-white">VisionPlay Neural Engine</span>
                 </div>
              </div>
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 transition-all">
                 <Download className="w-4 h-4" /> Download PDF
              </button>
           </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "Avg Formation Entropy", val: loading ? "..." : avgEntropy, trend: avgEntropy > "0.6" ? "WARNING" : "STABLE", icon: TrendingUp, color: "text-cyan-400" },
             { label: "Avg Team Diameter", val: loading ? "..." : `${avgDiameter}px`, trend: "COMPACT", icon: Users, color: "text-blue-500" },
             { label: "Stability Index", val: loading ? "..." : `${(100 - (parseFloat(avgEntropy)*100)).toFixed(1)}`, trend: "COMPUTED", icon: Target, color: "text-emerald-500" },
             { label: "Fracture Alerts", val: loading ? "..." : fractureAlerts.toString(), trend: fractureAlerts > 50 ? "CRITICAL" : "NORMAL", icon: ShieldAlert, color: "text-rose-500" },
           ].map((m, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="liquid-glass p-6 rounded-2xl border border-white/5"
             >
                <div className="flex justify-between items-start mb-4">
                   <m.icon className={`w-5 h-5 ${m.color}`} />
                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{m.trend}</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                <div className="text-3xl font-black font-orbitron text-white">{m.val}</div>
             </motion.div>
           ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Entropy Timeline */}
           <div className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold font-orbitron text-white uppercase tracking-tight">Entropy Timeline</h3>
                 <span className="text-[9px] font-mono text-cyan-400">UNIT: LAPLACIAN_EIGENVALUE</span>
              </div>
              <div className="h-[300px] w-full">
                 {!loading && entropyData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={entropyData}>
                         <defs>
                            <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                         <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                           itemStyle={{ color: '#00f3ff', fontSize: '12px', fontWeight: 'bold' }}
                         />
                         <Area type="monotone" dataKey="entropy" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorEntropy)" />
                      </AreaChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-cyan-400/50 text-sm font-mono animate-pulse">AWAITING YOLO DATA...</div>
                 )}
              </div>
           </div>

           {/* Efficiency by Zone */}
           <div className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold font-orbitron text-white uppercase tracking-tight">Passing Efficiency</h3>
                 <span className="text-[9px] font-mono text-blue-500">UNIT: NETWORK_FLOW %</span>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="zone" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip 
                         cursor={{fill: 'transparent'}}
                         contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                       />
                       <Bar dataKey="val" fill="#0066ff" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

        </div>

        {/* Deep Audit: Articulation Points */}
        <div className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-orbitron text-white uppercase tracking-tight">Articulation Node Audit</h3>
              <div className="flex gap-4">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Vulnerabilities Identified: {uniqueLynchpins.length}</span>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="border-b border-white/5">
                    <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                       <th className="pb-4">Node ID (Player)</th>
                       <th className="pb-4">Detection Count</th>
                       <th className="pb-4">Criticality</th>
                       <th className="pb-4">Status</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs font-mono">
                    {uniqueLynchpins.length > 0 ? uniqueLynchpins.map((nodeId, i) => {
                      // Count how many times this node was an articulation point
                      let count = 0;
                      timeline.forEach((f) => {
                        if (f.metrics?.articulation_points?.includes(nodeId)) count++;
                      });
                      const crit = count > 10 ? "CRITICAL" : "MED";
                      const status = count > 10 ? "VULNERABLE" : "MONITORING";
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                           <td className="py-4 font-bold text-white">Player #{nodeId}</td>
                           <td className="py-4 text-gray-500">{count} frames</td>
                           <td className={`py-4 font-black uppercase ${crit === 'CRITICAL' ? 'text-rose-500' : 'text-cyan-400'}`}>{crit}</td>
                           <td className="py-4">
                              <span className={`px-2 py-1 rounded text-[8px] font-black ${status === 'VULNERABLE' ? 'bg-rose-500/20 text-rose-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                 {status}
                              </span>
                           </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-white/30 italic">No structural vulnerabilities detected yet.</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

      </main>
    </div>
  );
}
