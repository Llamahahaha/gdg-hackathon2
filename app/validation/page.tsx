"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  CheckCircle,
  XCircle,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Cpu,
  Target,
  Layers,
  Activity,
  Wifi,
  WifiOff,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface TestResult {
  id: string;
  module: string;
  tier: number;
  input?: string;
  expected?: string;
  actual?: string;
  pass_criteria?: string;
  deviation?: number;
  status: "PASS" | "FAIL";
  error?: string;
  visual_data?: {
    nodes: Array<{ id: string; x: number; y: number; label?: string; type?: string; highlight?: string }>;
    edges: Array<{ source: string; target: string; weight?: number }>;
  };
}

interface ValidationResponse {
  summary: {
    total: number;
    passed: number;
    failed: number;
    pass_rate: number;
  };
  tests: Record<string, TestResult>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

// ──────────────────────────────────────────────────────────────────────────────
// Tier badge
// ──────────────────────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: number }) {
  return (
    <span
      className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border flex-shrink-0 ${
        tier === 1
          ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
          : "bg-amber-500/20 border-amber-500/40 text-amber-400"
      }`}
    >
      T{tier}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Module icon selector
// ──────────────────────────────────────────────────────────────────────────────
function ModuleIcon({ module }: { module: string }) {
  const cls = "w-4 h-4 flex-shrink-0";
  if (module.includes("Eigenvector")) return <Target className={cls} />;
  if (module.includes("Tarjan")) return <Layers className={cls} />;
  if (module.includes("Dijkstra")) return <Activity className={cls} />;
  if (module.includes("Floyd")) return <Cpu className={cls} />;
  if (module.includes("Entropy")) return <FlaskConical className={cls} />;
  if (module.includes("Noise")) return <Wifi className={cls} />;
  return <FlaskConical className={cls} />;
}

// ──────────────────────────────────────────────────────────────────────────────
// Metric bars — visual slider-style indicators shown inside every test card
// ──────────────────────────────────────────────────────────────────────────────
function MetricBars({ test, passed }: { test: TestResult; passed: boolean }) {
  type Bar = { label: string; value: number; max: number; unit?: string; color: string; threshold?: number };
  const bars: Bar[] = [];

  if (test.deviation !== undefined) {
    const threshold = test.id === "TC-01" ? 1e-6 : 1e-5;
    bars.push({ label: "Deviation", value: test.deviation, max: threshold * 10, unit: "", color: passed ? "bg-emerald-500" : "bg-rose-500", threshold: 10 });
  }
  if (test.id === "TC-09") {
    const m = test.actual?.match(/Cost: ([\d.]+)/);
    if (m) bars.push({ label: "Path Cost", value: parseFloat(m[1]), max: 6, unit: " m", color: passed ? "bg-violet-500" : "bg-rose-500", threshold: (2/6)*100 });
  }
  if (test.id === "TC-12") {
    const m = test.actual?.match(/Diameter: ([\d.]+)/);
    if (m) bars.push({ label: "Diameter", value: parseFloat(m[1]), max: 60, unit: " m", color: passed ? "bg-violet-500" : "bg-rose-500", threshold: (50/60)*100 });
  }
  if (test.id === "TC-15") {
    const m1 = test.actual?.match(/Entropy K\d+: ([\d.]+)/);
    const m2 = test.actual?.match(/Entropy Sparse: ([\d.]+)/);
    if (m1) bars.push({ label: "Entropy (Compact)", value: parseFloat(m1[1]), max: 1.2, unit: "", color: "bg-violet-500" });
    if (m2) bars.push({ label: "Entropy (Sparse)", value: parseFloat(m2[1]), max: 1.2, unit: "", color: "bg-amber-500" });
  }
  if (test.id === "TC-18") {
    const m = test.actual?.match(/LCC after Lynchpin removal: (\d+).*LCC after Random avg: ([\d.]+).*total (\d+)/);
    if (m) {
      const total = parseInt(m[3]);
      bars.push({ label: "LCC after Lynchpin removal", value: parseInt(m[1]), max: total, unit: " nodes", color: passed ? "bg-amber-500" : "bg-rose-500" });
      bars.push({ label: "LCC after Random removal", value: parseFloat(m[2]), max: total, unit: " nodes", color: "bg-emerald-500" });
    }
  }
  if (test.id === "TC-20") {
    const m = test.actual?.match(/diameter: ([\d.]+)/);
    if (m) bars.push({ label: "Def. Block Diameter", value: parseFloat(m[1]), max: 60, unit: " m", color: passed ? "bg-amber-500" : "bg-rose-500", threshold: (35/60)*100 });
  }
  if (test.id === "Face-Validity") {
    const scores = [...(test.actual?.matchAll(/\(([\d.]+)\)/g) ?? [])].map(m2 => parseFloat(m2[1]));
    ["Top", "2nd", "3rd", "4th"].slice(0, scores.length).forEach((rank, i) => {
      bars.push({ label: `${rank} Player Score`, value: scores[i], max: 0.65, unit: "", color: i === 0 ? "bg-emerald-500" : "bg-white/30" });
    });
  }
  if (test.id === "Noise-Reliability") {
    const m = test.actual?.match(/Ent: [\d.]+ \(dev ([\d.]+)%\), Diam: [\d.]+m \(dev ([\d.]+)%\)/);
    if (m) {
      bars.push({ label: "Entropy Deviation", value: parseFloat(m[1]), max: 50, unit: "%", color: passed ? "bg-cyan-500" : "bg-rose-500", threshold: 35 });
      bars.push({ label: "Diameter Deviation", value: parseFloat(m[2]), max: 50, unit: "%", color: passed ? "bg-cyan-500" : "bg-rose-500", threshold: 35 });
    }
  }
  if (bars.length === 0) {
    bars.push({ label: "Test Result", value: passed ? 100 : 0, max: 100, unit: "%", color: passed ? "bg-emerald-500" : "bg-rose-500" });
  }

  return (
    <div className="flex flex-col gap-3 border border-white/5 bg-black/20 px-4 py-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-white/25 flex items-center gap-1.5">
        <Activity className="w-3 h-3" />
        Metric Indicators
      </div>
      {bars.map((bar, i) => {
        const fillPct = Math.min((bar.value / bar.max) * 100, 100);
        const displayVal = bar.value > 0 && bar.value < 0.001
          ? bar.value.toExponential(2)
          : (Math.round(bar.value * 1000) / 1000).toString();
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{bar.label}</span>
              <span className="text-[10px] font-mono font-bold text-white/70">{displayVal}{bar.unit}</span>
            </div>
            <div className="relative h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 * i }}
                className={`h-full rounded-full ${bar.color} opacity-80`}
              />
              {bar.threshold !== undefined && (
                <div className="absolute top-0 h-full w-px bg-white/50" style={{ left: `${bar.threshold}%` }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Graph visualizer — normalizes coordinates to fill canvas, bigger nodes
// ──────────────────────────────────────────────────────────────────────────────
function GraphVisualizer({ test }: { test: TestResult }) {
  const nodes = test.visual_data!.nodes;
  const edges = test.visual_data!.edges;

  const PAD = 90;
  const VW = 900;
  const VH = 520;

  // Normalize using base (non-jitter) node bounds
  const baseNodes = nodes.filter(n => n.type !== "jitter");
  const xs = baseNodes.map(n => n.x);
  const ys = baseNodes.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const nx = (x: number) => PAD + ((x - minX) / rangeX) * (VW - PAD * 2);
  const ny = (y: number) => PAD + ((y - minY) / rangeY) * (VH - PAD * 2);

  return (
    <div className="border border-white/10 bg-black/40 p-4">
      <div className="text-[8px] font-black text-cyan-400/80 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Activity className="w-3 h-3" />
        Live Visual Verification
      </div>
      <div className="relative w-full border border-white/5 bg-white/[0.02]" style={{ height: "400px" }}>
        <svg className="w-full h-full" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id={`grid-${test.id}`} width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${test.id})`} />

          {edges.map((edge, i) => {
            const sn = nodes.find(n => n.id === edge.source);
            const tn = nodes.find(n => n.id === edge.target);
            if (!sn || !tn) return null;
            const isJitter = sn.type === "jitter" || tn.type === "jitter";
            const sw = edge.weight ? Math.min(edge.weight / 5, 4) : 1.5;
            return (
              <line key={`e-${i}`}
                x1={nx(sn.x)} y1={ny(sn.y)} x2={nx(tn.x)} y2={ny(tn.y)}
                stroke={isJitter ? "rgba(255,80,80,0.2)" : "rgba(100,200,255,0.22)"}
                strokeWidth={sw}
                strokeDasharray={isJitter ? "6 4" : "none"}
              />
            );
          })}

          {nodes.map((node, i) => {
            let fill = "rgba(160,160,255,0.35)";
            let stroke = "rgba(160,160,255,0.8)";
            let r = 14;
            if (node.type === "jitter") { fill = "rgba(255,80,80,0.35)"; stroke = "rgba(255,100,100,0.9)"; r = 9; }
            else if (node.highlight === "lynchpin") { fill = "rgba(255,165,0,0.75)"; stroke = "rgba(255,165,0,1)"; r = 18; }
            else if (node.highlight === "playmaker") { fill = "rgba(0,255,128,0.75)"; stroke = "rgba(0,255,128,1)"; r = 18; }

            const cx = nx(node.x);
            const cy = ny(node.y);
            return (
              <g key={`n-${i}`} transform={`translate(${cx},${cy})`}>
                {node.highlight && (
                  <circle r={r + 12} fill="none" stroke={stroke} strokeWidth="1.5" opacity="0">
                    <animate attributeName="r" values={`${r+4};${r+20};${r+4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={r} fill={fill} stroke={stroke} strokeWidth="2.5" />
                {node.label ? (
                  <text x="0" y={r + 18} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="13" fontFamily="monospace" fontWeight="bold">
                    {node.label}
                  </text>
                ) : (
                  <text x="0" y="5" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="monospace">
                    {node.id.replace("_j", "")}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 mt-2.5">
        {nodes.some(n => n.highlight === "lynchpin") && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-[9px] text-white/40 uppercase tracking-widest">Lynchpin</span></div>}
        {nodes.some(n => n.highlight === "playmaker") && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[9px] text-white/40 uppercase tracking-widest">Playmaker</span></div>}
        {nodes.some(n => n.type === "jitter") && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-[9px] text-white/40 uppercase tracking-widest">Jittered</span></div>}
        {nodes.some(n => n.type === "base") && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-400" /><span className="text-[9px] text-white/40 uppercase tracking-widest">Base Position</span></div>}
        {nodes.some(n => !n.type && !n.highlight) && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-400/60" /><span className="text-[9px] text-white/40 uppercase tracking-widest">Player Node</span></div>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Individual test card
// ──────────────────────────────────────────────────────────────────────────────
function TestCard({ test, index }: { test: TestResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const passed = test.status === "PASS";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`border transition-colors ${
        passed
          ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
          : "border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10"
      }`}
    >
      {/* ── Header row (always visible) ── */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded((p) => !p)}
        id={`test-card-${test.id}`}
      >
        {passed ? (
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
        )}

        <span className={`flex-shrink-0 ${passed ? "text-emerald-400" : "text-rose-400"}`}>
          <ModuleIcon module={test.module} />
        </span>

        <TierBadge tier={test.tier} />

        <span className="font-mono text-[9px] font-black text-white/25 uppercase tracking-widest w-24 flex-shrink-0 hidden sm:block">
          {test.id}
        </span>

        <span className="flex-1 text-[11px] font-bold text-white/80 uppercase tracking-wider truncate">
          {test.module}
        </span>

        <span
          className={`flex-shrink-0 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 ${
            passed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
          }`}
        >
          {test.status}
        </span>

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
        )}
      </button>

      {/* ── Expanded detail ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/5 flex flex-col gap-5">

              {/* ── Text metadata grid ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {test.input && (
                  <div>
                    <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Input</div>
                    <div className="text-[11px] text-white/65 font-mono leading-relaxed">{test.input}</div>
                  </div>
                )}
                {test.expected && (
                  <div>
                    <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Expected</div>
                    <div className="text-[11px] text-white/65 font-mono leading-relaxed">{test.expected}</div>
                  </div>
                )}
                {test.actual && (
                  <div>
                    <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Actual Output</div>
                    <div className={`text-[11px] font-mono leading-relaxed font-bold ${passed ? "text-emerald-400" : "text-rose-400"}`}>
                      {test.actual}
                    </div>
                  </div>
                )}
                {test.pass_criteria && (
                  <div className="sm:col-span-2">
                    <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Pass Criteria</div>
                    <div className="text-[11px] text-white/40 font-mono leading-relaxed">{test.pass_criteria}</div>
                  </div>
                )}
                {test.deviation !== undefined && (
                  <div>
                    <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Deviation</div>
                    <div className="text-[11px] text-cyan-400 font-mono font-bold">{test.deviation.toExponential(3)}</div>
                  </div>
                )}
                {test.error && (
                  <div className="sm:col-span-3">
                    <div className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Error</div>
                    <div className="text-[11px] text-rose-300 font-mono bg-rose-950/50 px-3 py-2">{test.error}</div>
                  </div>
                )}
              </div>
              
              {/* ── Metric bars (every test) ── */}
              <MetricBars test={test} passed={passed} />

              {/* ── Graph visualizer (Tier 2 tests with visual_data) ── */}
              {test.visual_data && test.visual_data.nodes && (
                <GraphVisualizer test={test} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Run button — used in two places so extracted as a component
// ──────────────────────────────────────────────────────────────────────────────
function RunButton({
  onClick,
  loading,
  size = "md",
}: {
  onClick: () => void;
  loading: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "px-4 py-2 text-[9px]",
    md: "px-6 py-2.5 text-[10px]",
    lg: "px-8 py-3.5 text-[11px]",
  };

  return (
    <button
      id="run-validation-btn"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 ${sizeClasses[size]} bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest transition-all`}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        <Play className="w-4 h-4 flex-shrink-0" />
      )}
      {loading ? "Running Tests…" : "Run Validation"}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────────────────
export default function ValidationPage() {
  const [data, setData] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pass" | "fail" | 1 | 2>("all");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Configuration settings
  const [config, setConfig] = useState({
    k_size: 5,
    playbook: "Spain 2012",
    noise_level: 2.0
  });

  async function runValidation() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      // Append a timestamp to bypass any browser caching of the 405 error
      const res = await fetch(`${API_BASE}/validate?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json: ValidationResponse = await res.json();
      setData(json);
      setApiOnline(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch(`${API_BASE}/health?t=${Date.now()}`)
      .then((r) => setApiOnline(r.ok))
      .catch(() => setApiOnline(false));
  }, []);

  const tests = data
    ? Object.values(data.tests).filter((t) => {
        if (filter === "pass") return t.status === "PASS";
        if (filter === "fail") return t.status === "FAIL";
        if (filter === 1) return t.tier === 1;
        if (filter === 2) return t.tier === 2;
        return true;
      })
    : [];

  const tier1Tests = data ? Object.values(data.tests).filter((t) => t.tier === 1) : [];
  const tier2Tests = data ? Object.values(data.tests).filter((t) => t.tier === 2) : [];
  const tier1Pass = tier1Tests.filter((t) => t.status === "PASS").length;
  const tier2Pass = tier2Tests.filter((t) => t.status === "PASS").length;

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── Top hero bar ── */}
        <div className="px-6 md:px-12 lg:px-16 pt-6 pb-8 border-b border-white/5">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/60">
                Algorithm Validation Suite
              </span>
            </div>

            {/* Title + button row — always rendered together */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Validation <span className="text-cyan-400">Lab</span>
                </h1>
                <p className="text-white/30 text-sm mt-1 max-w-lg leading-relaxed">
                  Tier 1 proves math correctness. Tier 2 proves tactical face-validity
                  using YOLOv11 telemetry data.
                </p>
              </div>

              {/* ── Controls: always in this top bar ── */}
              <div className="flex flex-row items-center gap-3 flex-shrink-0">
                {/* API pill */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${
                    apiOnline === true
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : apiOnline === false
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      : "border-white/10 bg-white/5 text-white/30"
                  }`}
                >
                  {apiOnline === true ? (
                    <Wifi className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <WifiOff className="w-3 h-3 flex-shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {apiOnline === true ? "API Online" : apiOnline === false ? "API Offline" : "…"}
                  </span>
                </div>

                {/* ── THE RUN BUTTON ── */}
                <RunButton onClick={runValidation} loading={loading} size="md" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-8">
          {/* ── API offline banner ── */}
          <AnimatePresence>
            {apiOnline === false && !loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="flex items-start gap-3 px-5 py-4 border border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">
                      Graph Analysis API Offline
                    </div>
                    <div className="text-[11px] text-white/50 break-all">
                      The Railway backend is not responding. Verify it is running at:
                    </div>
                    <code className="block mt-1 text-[10px] font-mono text-amber-300 bg-black/40 px-2.5 py-1.5 break-all">
                      {API_BASE}/health
                    </code>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-8 flex items-start gap-3 px-5 py-4 border border-rose-500/40 bg-rose-500/10">
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-0.5">
                  Request Failed
                </div>
                <div className="text-[11px] text-white/50 font-mono break-all">{error}</div>
              </div>
            </div>
          )}

          {/* ── Config Panel ── */}
          <div className="mb-8 bg-black/40 border border-white/10 p-5 rounded-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Test Configuration
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Graph Size */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-cyan-400/80">
                  Tier 1: Graph Size (K_n)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={config.k_size}
                    onChange={(e) => setConfig({ ...config, k_size: parseInt(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="text-xs font-mono font-bold w-6">{config.k_size}</span>
                </div>
                <p className="text-[8px] text-white/30">Used for Eigenvector and Entropy baseline tests.</p>
              </div>

              {/* Playbook */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-cyan-400/80">
                  Tier 2: Playbook
                </label>
                <select
                  value={config.playbook}
                  onChange={(e) => setConfig({ ...config, playbook: e.target.value })}
                  className="bg-white/5 border border-white/10 text-xs px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono text-white/80"
                >
                  <option value="Spain 2012">Spain 2012 (Historical)</option>
                  <option value="Randomized Team">Randomized Team Layout</option>
                </select>
                <p className="text-[8px] text-white/30">Determines node positions for tactical robustness checks.</p>
              </div>

              {/* Noise Level */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-cyan-400/80">
                  Tier 2: Noise Jitter (m)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={config.noise_level}
                    onChange={(e) => setConfig({ ...config, noise_level: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="text-xs font-mono font-bold w-6">{config.noise_level.toFixed(1)}</span>
                </div>
                <p className="text-[8px] text-white/30">Simulated tracking noise for reliability stress test.</p>
              </div>
            </div>
          </div>

          {/* ── Summary stat cards ── */}
          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total", value: data.summary.total, color: "text-white", bar: "bg-white/20" },
                { label: "Passed", value: data.summary.passed, color: "text-emerald-400", bar: "bg-emerald-500" },
                { label: "Failed", value: data.summary.failed, color: "text-rose-400", bar: "bg-rose-500" },
                {
                  label: "Pass Rate",
                  value: `${data.summary.pass_rate}%`,
                  color: data.summary.pass_rate >= 80 ? "text-cyan-400" : "text-amber-400",
                  bar: data.summary.pass_rate >= 80 ? "bg-cyan-500" : "bg-amber-500",
                },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-white/8 p-4 flex flex-col gap-1"
                >
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/25">{s.label}</div>
                  <div className={`text-2xl font-black font-orbitron ${s.color}`}>{s.value}</div>
                  <div className="h-0.5 w-full bg-white/5 mt-1">
                    <div className={`h-full ${s.bar} w-full opacity-60`} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Tier progress bars ── */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  tier: 1,
                  label: "Mathematical Correctness",
                  pass: tier1Pass,
                  total: tier1Tests.length,
                  color: "bg-violet-500",
                  border: "border-violet-500/20",
                  textColor: "text-violet-400",
                  desc: "Custom algorithm implementations verified against known graph-theory ground truth on controlled inputs.",
                },
                {
                  tier: 2,
                  label: "Tactical Face-Validity",
                  pass: tier2Pass,
                  total: tier2Tests.length,
                  color: "bg-amber-500",
                  border: "border-amber-500/20",
                  textColor: "text-amber-400",
                  desc: "Results validated against real football data — playmaker ranking, J-League robustness replication, stretch index, and YOLOv11 noise stability.",
                },
              ].map((t) => (
                <div key={t.tier} className={`bg-black/40 border ${t.border} p-5`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TierBadge tier={t.tier} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{t.label}</span>
                    </div>
                    <span className={`text-base font-black font-orbitron ${t.textColor}`}>
                      {t.pass}/{t.total}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 w-full mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(t.pass / (t.total || 1)) * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full ${t.color}`}
                    />
                  </div>
                  <p className="text-[9px] text-white/25 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Filter chips ── */}
          {data && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[7px] font-black uppercase tracking-widest text-white/15 mr-1">Filter:</span>
              {(
                [
                  { label: "All", val: "all" },
                  { label: "Passed", val: "pass" },
                  { label: "Failed", val: "fail" },
                  { label: "Tier 1", val: 1 },
                  { label: "Tier 2", val: 2 },
                ] as { label: string; val: typeof filter }[]
              ).map((f) => (
                <button
                  key={String(f.val)}
                  onClick={() => setFilter(f.val)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${
                    filter === f.val
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                      : "bg-transparent border-white/10 text-white/30 hover:border-white/25 hover:text-white/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Test cards ── */}
          {data && (
            <div className="flex flex-col gap-1.5">
              {tests.length === 0 && (
                <div className="text-center py-10 text-white/20 text-sm">No tests match this filter.</div>
              )}
              {tests.map((t, i) => (
                <TestCard key={t.id} test={t} index={i} />
              ))}
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 border border-white/5 animate-pulse"
                  style={{ animationDelay: `${i * 50}ms`, backgroundColor: `rgba(255,255,255,${0.01 + i * 0.002})` }}
                />
              ))}
            </div>
          )}

          {/* ── Idle / empty state — button repeated here for discoverability ── */}
          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-24 gap-8">
              {/* Animated hex icon */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border border-cyan-500/15 rounded-full absolute inset-0 m-auto"
                />
                <div className="w-24 h-24 border border-cyan-500/25 rounded-full flex items-center justify-center">
                  <FlaskConical className="w-9 h-9 text-cyan-400/50" />
                </div>
              </div>

              <div className="text-center">
                <div className="text-white/40 text-sm font-black uppercase tracking-widest mb-1">
                  No Results Yet
                </div>
                <div className="text-white/20 text-xs mb-6 max-w-xs">
                  Execute the validation suite to test all Tier 1 &amp; Tier 2 algorithms against the live API.
                </div>
                {/* ── Second run button in the empty state ── */}
                <RunButton onClick={runValidation} loading={loading} size="lg" />
              </div>

              {/* Mini legend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 max-w-2xl w-full border-t border-white/5 pt-8">
                {[
                  { icon: <Target className="w-4 h-4 text-violet-400" />, title: "Face Validity", body: "Eigenvector centrality on Spain 2012 → Xavi ranks #1" },
                  { icon: <Layers className="w-4 h-4 text-amber-400" />, title: "J-League Robustness", body: "Targeted lynchpin removal causes larger LCC drop than random" },
                  { icon: <Wifi className="w-4 h-4 text-cyan-400" />, title: "Noise Reliability", body: "±2m YOLOv11 jitter keeps metrics within 15% of baseline" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{item.title}</span>
                    </div>
                    <p className="text-[10px] text-white/20 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
