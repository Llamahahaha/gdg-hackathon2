"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Line,
  LineChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

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

// --- CONFIG ---

const chartConfigAreaInteractive = {
  intensity: { label: "Intensity" },
  team1: { label: "Green Team", color: "#c8e86e" },
  team2: { label: "White Team", color: "#3b82f6" },
} satisfies ChartConfig;

const chartConfigLineInteractive = {
  performance: { label: "Intensity Index" },
  team1: { label: "Green Team", color: "#c8e86e" },
  team2: { label: "White Team", color: "#3b82f6" },
} satisfies ChartConfig;

const chartConfigPie = {
  share: { label: "Possession Share" },
  green: { label: "Green Team", color: "#c8e86e" },
  white: { label: "White Team", color: "#3b82f6" },
} satisfies ChartConfig;

const chartConfigAreaSimple = {
  team1: { label: "Green Team", color: "#c8e86e" },
} satisfies ChartConfig;

// --- COMPONENTS ---

function ChartLineInteractive({ timeline, summary }) {
  const [activeChart, setActiveChart] = React.useState("team1");

  const total = React.useMemo(
    () => ({
      team1: summary ? summary.team1_total : 0,
      team2: summary ? summary.team2_total : 0,
    }),
    [summary],
  );

  return (
    <Card className="py-4 sm:py-0 overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b border-white/5 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0 min-h-[100px]">
          <CardTitle>Team Intensity Peaks</CardTitle>
          <CardDescription>
            Real-time movement intensity metrics across the session
          </CardDescription>
        </div>
        <div className="flex">
          {["team1", "team2"].map((key) => {
            const chart = key;
            return (
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
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfigLineInteractive}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={timeline || []}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="#1f2937" />
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
                  labelFormatter={(value: string) => `Frame ${value}`}
                />
              }
            />
            <Line
              dataKey={activeChart === "team1" ? "t1" : "t2"}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ChartAreaInteractive({ timeline }) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = (timeline || []).filter((item) => {
    // For demo, show all
    return true;
  });

  return (
    <Card className="pt-0 overflow-hidden">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-white/5 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Intensity Over Time</CardTitle>
          <CardDescription>Comparative intensity between teams</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-none sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Full Session" />
          </SelectTrigger>
          <SelectContent className="rounded-none bg-zinc-900 border-white/10">
            <SelectItem value="full" className="rounded-none">
              Full Session
            </SelectItem>
            <SelectItem value="300" className="rounded-none">
              Last 300 Frames
            </SelectItem>
            <SelectItem value="100" className="rounded-none">
              Last 100 Frames
            </SelectItem>
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
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#1f2937" />
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
                  labelFormatter={(value: string) => `Frame ${value}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="t2"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
              name="team2"
            />
            <Area
              dataKey="t1"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
              name="team1"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ChartAreaDefault({ timeline }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metabolic Power Index</CardTitle>
        <CardDescription>Sum of player velocities over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigAreaSimple}>
          <AreaChart
            accessibilityLayer
            data={timeline || []}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="#1f2937" />
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
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month{" "}
              <TrendingUp className="h-4 w-4 text-[#c8e86e]" />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-500">
              Session Duration
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function ChartPieSeparatorNone({ summary }) {
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Possession Share</CardTitle>
        <CardDescription>Ball Control Percentage</CardDescription>
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
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month{" "}
          <TrendingUp className="h-4 w-4 text-[#c8e86e]" />
        </div>
        <div className="leading-none text-gray-500">
          Showing total possession frames
        </div>
      </CardFooter>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data) => setTelemetry(data))
      .catch((err) => console.error(err));
  }, []);

  if (!telemetry) {
    return (
      <main className="min-h-screen bg-transparent text-black dark:text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
        <Navbar />
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1
              className="text-4xl md:text-6xl font-black tracking-tighter uppercase dark:text-white text-black"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Performance Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Loading telemetry data...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const timeline = telemetry.timeline;
  const summary = telemetry.summary;

  // Add date to timeline for charts
  const timelineWithFrame = timeline.map((frame, i) => ({
    ...frame,
    frame: i,
  }));

  return (
    <main className="min-h-screen bg-transparent text-black dark:text-white pt-24 pb-12 px-6 md:px-12 lg:px-16">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase dark:text-white text-black"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Performance Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Advanced interactive visualizations for elite athletic performance
            data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartLineInteractive timeline={timelineWithFrame} summary={summary} />
          <ChartAreaInteractive timeline={timelineWithFrame} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ChartAreaDefault timeline={timelineWithFrame} />
          <ChartPieSeparatorNone summary={summary} />
          <Card className="flex flex-col justify-center p-8 bg-gradient-to-br from-[#c8e86e]/10 to-transparent border-[#c8e86e]/20">
            <div className="space-y-4 text-center">
              <TrendingUp className="w-12 h-12 text-[#c8e86e] mx-auto" />
              <h2 className="text-xl font-bold uppercase tracking-tight">
                Intelligence Ready
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our AI models are currently processing historical data to refine
                predictive metrics. Expect higher fidelity insights as more
                sessions are logged.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
