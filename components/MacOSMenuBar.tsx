"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Search } from 'lucide-react';
import { AppleLogo } from './Primitives';

export default function MacOSMenuBar() {
  const menuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.6 }}
      className="w-full h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-4">
          <AppleLogo className="w-3.5 h-3.5" />
          <span className="font-bold text-white">Aura</span>
          <div className="flex items-center gap-4">
            {menuItems.map((item, i) => (
              <span
                key={item}
                className={`text-white/70 hover:text-white cursor-pointer ${i > 2 ? 'hidden sm:inline' : ''
                  } ${i > 3 ? 'hidden md:inline' : ''}`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <div className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search</span>
          </div>
          <span>Wed May 6 1:09 PM</span>
        </div>
      </div>
    </motion.div>
  );
}
