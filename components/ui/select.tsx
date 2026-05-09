"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange: (value: string) => void
}

const Select = ({ children, value, onValueChange }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(value)

  const handleSelect = (val: string) => {
    setSelected(val)
    onValueChange(val)
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            onClick: () => setOpen(!open), 
            value: selected 
          } as React.ComponentProps<typeof SelectTrigger>)
        }
        if (child.type === SelectContent && open) {
          return React.cloneElement(child, { 
            onSelect: handleSelect 
          } as React.ComponentProps<typeof SelectContent>)
        }
        return null
      })}
    </div>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  value?: string
}

const SelectTrigger = ({ children, className, onClick }: SelectTriggerProps) => (
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

interface SelectValueProps {
  placeholder?: string
  value?: string
}

const SelectValue = ({ placeholder, value }: SelectValueProps) => (
  <span>{value || placeholder}</span>
)

interface SelectContentProps {
  children: React.ReactNode
  onSelect?: (value: string) => void
  className?: string
}

const SelectContent = ({ children, onSelect, className }: SelectContentProps) => (
  <div className={cn("absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-white/10 bg-zinc-950 p-1 text-white shadow-md", className)}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null
      return React.cloneElement(child, { 
        onClick: () => onSelect?.((child.props as { value: string }).value) 
      } as React.HTMLAttributes<HTMLElement>)
    })}
  </div>
)

interface SelectItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  value: string
}

const SelectItem = ({ children, onClick, className }: SelectItemProps) => (
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
