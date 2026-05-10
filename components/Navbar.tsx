"use client"

import * as React from "react"
import Link from 'next/link'
import { Shield, Activity, Share2, Menu, Hexagon, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import path from "path"

export default function Navbar() {
  const [mounted, setMounted] = React.useState(false)
  const { user, logout } = useAuth()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return (
    <nav className="px-6 md:px-12 lg:px-16 pt-6 w-full fixed top-0 z-50 pointer-events-none">
      <div className="liquid-glass rounded-xl px-6 py-3 flex items-center justify-between border border-white/5 bg-black/40 backdrop-blur-xl pointer-events-auto">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-cyan-500/30 group-hover:border-cyan-400 transition-colors flex items-center justify-center bg-black/50">
            <Hexagon className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-white font-orbitron">
            Field<span className="text-cyan-400">Theory</span><span className="text-xs ml-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">AI</span>
          </span>
        </Link>

        {/* Center: HUD Links - Only accessible if authenticated */}
        <div className="hidden lg:flex items-center gap-8">
          {user ? [
            { name: "Home", path: "/" },
            { name: "Dashboard", path: "/dashboard" },
            { name: "Live Engine", path: "/live" },
            { name: "Replay Lab", path: "/replay" },
            { name: "Simulations", path: "/simulations" },
            { name: "Intelligence Report", path: "/reports" }
          ].map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="text-[10px] font-black uppercase tracking-[0.2em] transition-all text-white/50 hover:text-cyan-400 flex items-center gap-2 group/link"
            >
              <div className="w-1 h-1 bg-cyan-500/20 rounded-full group-hover/link:bg-cyan-400 group-hover/link:scale-150 transition-all" />
              {link.name}
            </Link>
          )) : (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <Shield className="w-3 h-3 text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">Authentication Required for HUD Access</span>
            </div>
          )}
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex flex-col px-3 py-1 bg-white/5 border border-white/10 rounded-lg min-w-[160px]">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Auth:</span>
              <span className="text-[9px] font-bold text-cyan-400 uppercase font-mono max-w-[100px] truncate" title={user?.email || "GUEST"}>
                {user ? user.email : "GUEST"}
              </span>
            </div>
            <div className="flex justify-between items-center mt-0.5 border-t border-white/5 pt-0.5">
              <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{user ? 'Authorized Analyst' : 'No Access'}</span>
              <span className="text-[7px] font-black text-white/50 uppercase tracking-widest bg-black/40 px-1 rounded">{user ? 'L1' : '--'}</span>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/live" className="hidden md:flex items-center gap-2 px-5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all group/btn pointer-events-auto">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Launch Analysis</span>
                <Activity className="w-4 h-4 text-cyan-400 group-hover/btn:animate-pulse" />
              </Link>
              <button onClick={logout} className="p-2 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white/50 hover:text-red-400 rounded-lg transition-all pointer-events-auto" title="Log Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all pointer-events-auto">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Authenticate</span>
            </Link>
          )}
          <button className="p-2 text-white/50 hover:text-white transition-colors lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

