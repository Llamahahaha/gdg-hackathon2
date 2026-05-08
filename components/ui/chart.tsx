"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip, Legend } from "recharts"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactElement
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, children, className, ...props }, ref) => {
    const chartId = React.useId()

    return (
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-area]:stroke-width-2 [&_.recharts-dot]:stroke-background [&_.recharts-dot]:stroke-width-2 [&_.recharts-layer]:outline-none [&_.recharts-polar-grid-concentric-polygon]:stroke-border [&_.recharts-polar-grid-concentric-circle]:stroke-border [&_.recharts-polar-grid-radial-line]:stroke-border [&_.recharts-sector]:outline-none [&_.recharts-sector]:stroke-width-0 [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <style dangerouslySetInnerHTML={{
          __html: Object.entries(config).map(([key, value]) => `
            :root {
              --color-${key}: ${value.color || 'inherit'};
            }
          `).join('\n')
        }} />
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = Tooltip
export const ChartTooltipContent = ({ 
  active, 
  payload, 
  label, 
  hideLabel, 
  indicator = "dot", 
  labelFormatter,
  className
}: any) => {
  if (!active || !payload) return null

  return (
    <div className={cn(
      "rounded-lg border bg-zinc-950 px-3 py-2 text-[11px] shadow-xl border-white/10",
      className
    )}>
      {!hideLabel && (
        <div className="mb-1 font-medium text-gray-400">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            {indicator === "dot" && (
              <div 
                className="h-1.5 w-1.5 rounded-full" 
                style={{ backgroundColor: item.color || item.payload.fill }} 
              />
            )}
            {indicator === "line" && (
              <div 
                className="h-[2px] w-3 rounded-full" 
                style={{ backgroundColor: item.color || item.payload.fill }} 
              />
            )}
            <span className="text-gray-500">{item.name}:</span>
            <span className="font-mono font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChartLegend = Legend
export const ChartLegendContent = ({ payload }: any) => {
  if (!payload) return null
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="h-2 w-2 rounded-full" 
            style={{ backgroundColor: item.color }} 
          />
          <span className="text-[10px] font-medium text-gray-400">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
