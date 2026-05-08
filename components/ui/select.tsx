"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Select = ({ children, value, onValueChange }: any) => {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(value)

  const handleSelect = (val: string) => {
    setSelected(val)
    onValueChange(val)
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open), value: selected })
        }
        if (child.type === SelectContent && open) {
          return React.cloneElement(child, { onSelect: handleSelect })
        }
        return null
      })}
    </div>
  )
}

const SelectTrigger = ({ children, className, onClick, value }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
)

const SelectValue = ({ placeholder, value }: any) => (
  <span>{value || placeholder}</span>
)

const SelectContent = ({ children, onSelect, className }: any) => (
  <div className={cn("absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-white/10 bg-zinc-950 p-1 text-white shadow-md", className)}>
    {React.Children.map(children, child => 
      React.cloneElement(child, { onClick: () => onSelect(child.props.value) })
    )}
  </div>
)

const SelectItem = ({ children, onClick, className }: any) => (
  <div
    onClick={onClick}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-white/10",
      className
    )}
  >
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
