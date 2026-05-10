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
                The Live Engine processes real-time video feeds (or uploaded footage) using YOLOv8 to detect player positions. It calculates real-time tactical metrics and streams the data over WebSockets for instantaneous analysis.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Dashboard</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The central command hub. It provides a high-level overview of the match, including the Formational Entropy Index (FEI) timeline, structural fracture alerts, and spatial vulnerability heatmaps.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <Cpu className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Simulations (Sandbox)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                An interactive tactical sandbox. Users can drag and drop nodes (players) to simulate different formations and instantly see how structural changes affect team entropy and stability.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-500/30">
                <FileText className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Forensic Replay & Reports</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Review historical footage frame-by-frame. The system generates automated PDF Intelligence Reports detailing critical structural failures, lynchpin vulnerabilities, and tactical recommendations powered by local LLMs.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Mathematical Algorithms */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black font-orbitron uppercase tracking-widest border-l-4 border-cyan-500 pl-4">Mathematical Algorithms</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4" /> Graph Laplacian Matrix (L)
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                The core of our spectral analysis. The Laplacian matrix is defined as <code className="text-cyan-400 bg-white/5 px-1">L = D - A</code>, where <code className="text-white">D</code> is the Degree Matrix (diagonal matrix of node connectivity) and <code className="text-white">A</code> is the Adjacency Matrix (representing the weighted proximity of players).
                <br /><br />
                The eigenvalues of <code className="text-white">L</code> provide a deep fingerprint of the team's structural integrity. The second smallest eigenvalue, known as the <strong className="text-white italic">Algebraic Connectivity</strong> or <strong className="text-white italic">Fiedler Value</strong>, specifically measures how difficult it is to fracture the team's network.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Higher Fiedler values represent a "cohesive unit" that is mathematically resistant to being bypassed.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" /> Dijkstra's Algorithm (Path Efficiency)
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                A greedy graph search algorithm that finds the shortest path between a source node (the player with the ball) and all other nodes in the network.
                <br /><br />
                FieldTheory uses Dijkstra's to calculate <strong className="text-white">Pass Efficiency Hubs</strong>. By weighting edges based on passing lanes (considering opponent proximity as an "impedance"), we identify the most efficient route for ball progression.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Recommends the optimal next pass in real-time, mathematically selecting the path of least resistance to the opponent's goal.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> Tarjan's Algorithm (Articulation Points)
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                A Depth-First Search (DFS) algorithm used to find Cut Vertices in the graph. These are single nodes whose removal would increase the number of disconnected components in the team's network.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Identifies "Lynchpin" players holding the formation together. Neutralizing these players mathematically severs the team's passing network.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" /> Floyd-Warshall (Graph Diameter)
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                We compute the shortest path between all pairs of nodes to find the Graph Diameter (the longest of all shortest paths) and the Average Shortest Path length.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Audits how stretched or compact a team is. A massive graph diameter implies the team is vulnerable to through-balls.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Eigenvector Centrality
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Measures the influence of a node in a network. A high eigenvector score means a player is not only well-connected but connected to other highly-influential players.
                <br /><br />
                <strong className="text-white">Tactical Meaning:</strong> Identifies the "True Playmaker." Unlike simple pass counts, this highlights players who are central to high-impact tactical sequences.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
