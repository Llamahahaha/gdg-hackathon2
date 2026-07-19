import React from 'react';
import Navbar from '@/components/Navbar';
import { BookOpen, Activity, Shield, Cpu, Target, FileText, Database } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-charcoal text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-16 px-6 lg:px-12 max-w-5xl mx-auto w-full space-y-16">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">System Manual</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white font-orbitron uppercase">
            Platform <span className="text-cyan-500">Documentation</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl leading-relaxed">
            Comprehensive guide to the FieldTheory Spatio-Temporal Intelligence suite. Learn about our core modules, metrics, and the mathematical algorithms powering the analysis.
          </p>
        </div>

        {/* Section 1: Core Modules */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black font-orbitron uppercase tracking-widest border-l-4 border-cyan-500 pl-4">Core Modules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Live Engine</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The **Neural Stream Processor**. It ingests match footage at 30fps, performing high-fidelity YOLOv11 player detection. The engine abstracts 22 moving entities into a **Dynamic Adjacency Matrix**, streaming topological updates over low-latency WebSockets.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Command Center</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The **Spatio-Temporal Command Hub**. Features the **Formational Entropy Index (FEI)** timeline—a continuous audit of structural stability. It tracks neural status, possession cycles, and generates real-time alerts for defensive fractures.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <Cpu className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Tactical Sandbox</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The **Predictive Laboratory**. Allows coaches to perform **Manual Node Overrides**. Drag players to test hypothetical formations while the **Ghost Formation** (static match-state reference) provides a baseline for tactical drift analysis.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-500/30">
                <FileText className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Forensic Intelligence</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The **Audit Engine**. Combines computer vision telemetry with **Llama 3.2 Reasoning**. Generates formal PDF Intelligence Reports that translate complex graph eigenvalues into actionable coaching directives.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Predictive Intelligence */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black font-orbitron uppercase tracking-widest border-l-4 border-cyan-500 pl-4">Simulative Predictive Collapse</h2>
          <div className="p-8 bg-black/40 border border-white/10 rounded-2xl space-y-6">
            <p className="text-gray-300 leading-relaxed">
              The platform&apos;s signature predictive feature. Rather than waiting for a tactical error to occur, FieldTheory forecasts it using **Spectral Topology**.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold uppercase text-xs">Initialization</div>
                <p className="text-[10px] text-gray-500 uppercase leading-relaxed">The Sandbox ingests the match midpoint frame, establishing a ground-truth topological state.</p>
              </div>
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold uppercase text-xs">Stress Testing</div>
                <p className="text-[10px] text-gray-500 uppercase leading-relaxed">Coaches drag nodes to widen team diameter. The system calculates real-time dispersion variance.</p>
              </div>
              <div className="space-y-2">
                <div className="text-rose-500 font-bold uppercase text-xs">Critical Fracture</div>
                <p className="text-[10px] text-gray-500 uppercase leading-relaxed">Once Entropy crosses 60%, the system predicts a &quot;Structural Collapse,&quot; signifying the point where passing lanes mathematically fracture.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Mathematical Algorithms */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black font-orbitron uppercase tracking-widest border-l-4 border-cyan-500 pl-4">Mathematical Algorithms</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4" /> Stabilized Graph Entropy (FEI)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Quantifies formational &quot;disorder&quot; using the Shannon Entropy of the Laplacian Spectrum.
                  </p>
                  <div className="p-4 bg-black/50 border border-white/5 font-mono text-cyan-500 text-xs">
                    L = D - A <br />
                    p_i = exp(k * lambda_i) / sum(exp(k * lambda_j)) <br />
                    H = -sum(p_i * log2(p_i))
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    <strong className="text-white">Calibration Layers:</strong>
                  </p>
                  <ul className="text-[10px] text-gray-500 uppercase space-y-1 list-disc list-inside">
                    <li>Adjacency Persistence ($\gamma=0.7$)</li>
                    <li>Spectral Softmax Normalization ($k=2.0$)</li>
                    <li>Compactness Modulation ($\beta=0.15$)</li>
                    <li>EMA Temporal Smoothing ($\alpha=0.2$)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" /> Dijkstra&apos;s Path Efficiency
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Determines the **Optimal Pass Vector**. Edges are weighted as $W = 1/d \cdot OppImpedance$. The algorithm identifies the shortest path to goal-scoring zones through the lowest-entropy lanes.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Recommends the &quot;Path of Least Resistance&quot; for progression.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> Tarjan&apos;s Lynchpin Detection
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Uses Depth-First Search to locate **Cut Vertices**. These are players whose removal (neutralization) would split the team&apos;s connectivity into two or more disjoint components.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Identifies players who are single points of structural failure.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" /> Floyd-Warshall Team Diameter
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Computes all-pairs shortest paths to determine the **Graph Eccentricity**. The Team Diameter is the maximum of these eccentricities, measuring total spatial stretch.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Audits defensive &quot;Stretch.&quot; A diameter &gt; 60m signifies a high risk of through-ball penetration.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Eigenvector Centrality (Playmaker Index)
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Calculates the **Principal Eigenvector** of the adjacency matrix. Players are scored not just by their connections, but by the connectivity of the players they are linked to.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Identifies the &quot;Neural Hub&quot; of the team—the true playmaker controlling the game&apos;s flow.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
