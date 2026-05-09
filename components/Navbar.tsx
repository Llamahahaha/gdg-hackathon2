"use client"

import * as React from "react"
import Link from 'next/link'
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="px-6 md:px-12 lg:px-16 pt-6 w-full fixed top-0 z-50">
      <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between border border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-lg">
        {/* Left: Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter uppercase dark:text-white text-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          PulsePlay <span className="text-[#c8e86e]">AI</span>
        </Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: "Home", path: "/" },
            { name: "Live Tracking", path: "/live" },
            { name: "Analytics", path: "/analytics" },
            { name: "AI Insights", path: "/insights" },
            { name: "Replay Center", path: "/replay" },
            { name: "Technology", path: "/technology" }
          ].map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="text-xs uppercase tracking-widest transition-colors hover:text-[#c8e86e] font-bold dark:text-white/70 text-black/70 dark:hover:text-white hover:text-black"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#c8e86e]" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
            </button>
          )}
          <button className="hidden lg:block bg-white dark:bg-white text-black px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
