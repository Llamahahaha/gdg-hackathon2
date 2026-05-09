"use client"

import * as React from "react"
import Link from 'next/link'
import { Shield, Activity, Share2, Menu } from "lucide-react"

export default function Navbar() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return (
    <nav className="px-6 md:px-12 lg:px-16 pt-6 w-full fixed top-0 z-50 pointer-events-none">
      <div className="liquid-glass rounded-xl px-6 py-3 flex items-center justify-between border border-white/5 bg-black/40 backdrop-blur-xl pointer-events-auto">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
            <img 
              src="/logo.png" 
              alt="FieldTheory AI Logo" 
              className="w-full h-full object-cover transform scale-150"
            />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-white font-orbitron">
            Field<span className="text-cyan-400">Theory</span><span className="text-xs ml-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">AI</span>
          </span>
        </Link>

        {/* Center: HUD Links */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: "Dashboard", path: "#" },
            { name: "Live Engine", path: "#" },
            { name: "Replay Lab", path: "#" },
            { name: "Simulations", path: "#" },
            { name: "Intelligence Report", path: "#" }
          ].map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="text-[10px] font-black uppercase tracking-[0.2em] transition-all text-white/50 hover:text-cyan-400 flex items-center gap-2 group/link"
            >
              <div className="w-1 h-1 bg-cyan-500/20 rounded-full group-hover/link:bg-cyan-400 group-hover/link:scale-150 transition-all" />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Hackathon</span>
            <span className="text-[9px] font-bold text-white uppercase font-mono">GDG 2026</span>
          </div>
          <button className="hidden md:flex items-center gap-2 px-5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all group/btn">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Launch Analysis</span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover/btn:animate-pulse" />
          </button>
          <button className="p-2 text-white/50 hover:text-white transition-colors lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

