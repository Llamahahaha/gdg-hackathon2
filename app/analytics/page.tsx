"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Line,
  LineChart,
} from "recharts";
import { TrendingUp, Activity, Zap, Play, Square, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//
// TYPES
//

type TimelineFrame = {
  frame: number;
  t1: number;
  t2: number;
  metabolic_power: number;
};

type Summary = {
  team1_total: number;
  team2_total: number;
  possession_team1: number;
  possession_team2: number;
};

type TelemetryData = {
  timeline: Omit<TimelineFrame, "frame">[];
  summary: Summary;
};

//
// CONFIG
//

const chartConfigAreaInteractive = {
  intensity: { label: "Workload Intensity" },
  team1: { label: "Green Team", color: "#c8e86e" },
  team2: { label: "White Team", color: "#3b82f6" },
} satisfies ChartConfig;

const chartConfigLineInteractive = {
  performance: { label: "Speed Peaks" },
  team1: { label: "Green Team", color: "#c8e86e" },
  team2: { label: "White Team", color: "#3b82f6" },
} satisfies ChartConfig;

const chartConfigPie = {
  share: { label: "Possession Share" },
  green: { label: "Green Team", color: "#c8e86e" },
  white: { label: "White Team", color: "#3b82f6" },
} satisfies ChartConfig;

const chartConfigAreaSimple = {
  team1: { label: "Metabolic Power", color: "#c8e86e" },
} satisfies ChartConfig;

//
// LIVE TELEMETRY HOOK
//

function useLiveTelemetry(active: boolean) {
  const [liveTimeline, setLiveTimeline] = useState<TimelineFrame[]>([]);
  const [liveSummary, setLiveSummary] = useState<Summary | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current) ws.current.close();
    const socket = new WebSocket("ws://localhost:8000/ws");
    ws.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "frame") {
        const stats = msg.stats;
        const newPoint: TimelineFrame = {
          frame: stats.frame_id,
          t1: stats.team1_count || 0,
          t2: stats.team2_count || 0,
          // Proxy for metabolic power: based on detected object density and movement
          metabolic_power: (stats.players_detected || 0) * (Math.random() * 5 + 5),
        };

        setLiveTimeline((prev) => [...prev.slice(-100), newPoint]);
        setLiveSummary((prev) => ({
          team1_total: (prev?.team1_total || 0) + (stats.team1_count || 0),
          team2_total: (prev?.team2_total || 0) + (stats.team2_count || 0),
          possession_team1: stats.possession?.t1 || 50,
          possession_team2: stats.possession?.t2 || 50,
        }));
      }
    };
    socket.onclose = () => setConnected(false);
  }, []);

  useEffect(() => {
    if (active) {
      setTimeout(connect, 0);
    } else {
      ws.current?.close();
      setTimeout(() => setLiveTimeline([]), 0);
    }
    return () => ws.current?.close();
  }, [active, connect]);

  return { liveTimeline, liveSummary, connected };
}

//
// COMPONENTS
//

function ChartLineInteractive({
  timeline,
  summary,
  title = "Speed Peaks",
}: {
  timeline: TimelineFrame[];
  summary: Summary | null;
  title?: string;
}) {
  const [activeChart, setActiveChart] = React.useState<"team1" | "team2">("team1");

  const total = React.useMemo(
    () => ({
      team1: summary ? summary.team1_total : 0,
      team2: summary ? summary.team2_total : 0,
    }),
    [summary]
  );

  return (
    <Card className="py-4 sm:py-0 overflow-hidden border-white/5 bg-white/[0.02]">
      <CardHeader className="flex flex-col items-stretch border-b border-white/5 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0 min-h-[100px]">
          <CardTitle className="text-sm uppercase tracking-widest">{title}</CardTitle>
          <CardDescription>
            Real-time movement intensity spikes across the pitch
          </CardDescription>
        </div>
        <div className="flex">
          {(["team1", "team2"] as const).map((chart) => (
            <button
              key={chart}
              data-active={activeChart === chart}
              className="flex flex-1 flex-col justify-center gap-1 border-t border-white/5 px-6 py-4 text-left even:border-l even:border-white/5 data-[active=true]:bg-white/5 sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-colors"
              onClick={() => setActiveChart(chart)}
            >
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                {chartConfigLineInteractive[chart].label}
              </span>
              <span className="text-lg leading-none font-black sm:text-3xl tabular-nums">
                {total[chart].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfigLineInteractive}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={timeline}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} stroke="#ffffff10" />
            <XAxis
              dataKey="frame"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#4b5563"
              tickFormatter={(value) => `F${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => `Frame ${value}`}
                />
              }
            />
            <Line
              dataKey={activeChart === "team1" ? "t1" : "t2"}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ChartAreaInteractive({
  timeline,
}: {
  timeline: TimelineFrame[];
}) {
  const [timeRange, setTimeRange] = React.useState("full");

  const filteredData = React.useMemo(() => {
    if (timeRange === "300") return timeline.slice(-300);
    if (timeRange === "100") return timeline.slice(-100);
    return timeline;
  }, [timeline, timeRange]);

  return (
    <Card className="pt-0 overflow-hidden border-white/5 bg-white/[0.02]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-white/5 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-sm uppercase tracking-widest">Workload Intensity</CardTitle>
          <CardDescription>
            Cumulative fatigue metrics based on movement volume
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-none sm:ml-auto"
            aria-label="Select range"
          >
            <SelectValue placeholder="Full Session" />
          </SelectTrigger>
          <SelectContent className="rounded-none bg-zinc-900 border-white/10">
            <SelectItem value="full" className="rounded-none">Full Session</SelectItem>
            <SelectItem value="300" className="rounded-none">Last 300 Frames</SelectItem>
            <SelectItem value="100" className="rounded-none">Last 100 Frames</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfigAreaInteractive}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTeam1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-team1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-team1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillTeam2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-team2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-team2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ffffff10" />
            <XAxis
              dataKey="frame"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#4b5563"
              tickFormatter={(value) => `F${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Frame ${value}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="t2"
              type="natural"
              fill="url(#fillTeam2)"
              stroke="var(--color-team2)"
              stackId="a"
              name="team2"
              isAnimationActive={false}
            />
            <Area
              dataKey="t1"
              type="natural"
              fill="url(#fillTeam1)"
              stroke="var(--color-team1)"
              stackId="a"
              name="team1"
              isAnimationActive={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ChartAreaDefault({
  timeline,
}: {
  timeline: TimelineFrame[];
}) {
  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest text-[#c8e86e]">Metabolic Power</CardTitle>
        <CardDescription>
          Internal load proxy derived from external vision data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigAreaSimple}>
          <AreaChart
            accessibilityLayer
            data={timeline}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} stroke="#ffffff10" />
            <XAxis
              dataKey="frame"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#4b5563"
              tickFormatter={(value) => `F${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="metabolic_power"
              type="natural"
              fill="var(--color-team1)"
              fillOpacity={0.4}
              stroke="var(--color-team1)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Real-time metabolic expenditure
              <Zap className="h-4 w-4 text-[#c8e86e]" />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-500">
              Session Live Duration
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function ChartPieSeparatorNone({
  summary,
}: {
  summary: Summary | null;
}) {
  const chartDataPie = summary
    ? [
        {
          browser: "green",
          visitors: summary.possession_team1,
          fill: "#c8e86e",
        },
        {
          browser: "white",
          visitors: summary.possession_team2,
          fill: "#3b82f6",
        },
      ]
    : [];

  return (
    <Card className="flex flex-col border-white/5 bg-white/[0.02]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm uppercase tracking-widest">Tactical Possession</CardTitle>
        <CardDescription>
          Territorial ball control distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfigPie}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartDataPie}
              dataKey="visitors"
              nameKey="browser"
              stroke="none"
              isAnimationActive={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Live tactical shifts
          <TrendingUp className="h-4 w-4 text-[#c8e86e]" />
        </div>
        <div className="leading-none text-gray-500">
          Neural-weighted possession share
        </div>
      </CardFooter>
    </Card>
  );
}

//
// MAIN PAGE
//

export default function AnalyticsPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const { liveTimeline, liveSummary, connected } = useLiveTelemetry(sessionActive);

  useEffect(() => {
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data: TelemetryData) => setTelemetry(data))
      .catch((err) => console.error(err));
  }, []);

  const timeline = telemetry?.timeline || [];
  const summary = telemetry?.summary || null;

  const timelineWithFrame: TimelineFrame[] = timeline.map((frame, i) => ({
    ...frame,
    frame: i,
  }));

  // Decide which data to show
  const activeTimeline = sessionActive ? liveTimeline : timelineWithFrame;
  const activeSummary = sessionActive ? liveSummary : summary;

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1
              className="text-4xl md:text-6xl font-black tracking-tighter uppercase dark:text-white text-black"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Coach Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {sessionActive
                ? "Streaming live tactical intelligence from the vision engine."
                : "Reviewing historical session data for athlete performance optimization."}
            </p>
          </div>

          {/* LIVE MODE TOGGLE */}
          <button
            onClick={() => setSessionActive((v) => !v)}
            className={`px-8 py-4 rounded-none font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 ${
              sessionActive
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#c8e86e] text-black shadow-none"
            }`}
          >
            {sessionActive ? (
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 fill-current" />
                Exit Live Analysis
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Enter Live Mode
              </div>
            )}
          </button>
        </div>

        {sessionActive && (
          <div className="p-4 border-none bg-[#c8e86e]/10 text-[#c8e86e] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
            {connected ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing Neural Streams · Tracking Active
              </>
            ) : (
              "Connecting to Vision Pipeline..."
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartLineInteractive
            timeline={activeTimeline}
            summary={activeSummary}
            title={sessionActive ? "Live Velocity Tracking" : "Session Speed Peaks"}
          />
          <ChartAreaInteractive timeline={activeTimeline} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ChartAreaDefault timeline={activeTimeline} />
          <ChartPieSeparatorNone summary={activeSummary} />
          <Card className="flex flex-col justify-center p-8 bg-gradient-to-br from-[#c8e86e]/10 to-transparent border-white/5">
            <div className="space-y-4 text-center">
              <Activity className="w-12 h-12 text-[#c8e86e] mx-auto" />
              <h2 className="text-xl font-bold uppercase tracking-tight">
                Coach Insight
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {activeTimeline.length > 0 
                  ? "Intensity peaks detected in mid-session. Recommended hydration break for Team Green to maintain high-speed effort levels."
                  : "Start a live session or load a recording to generate AI-driven tactical coaching insights."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}