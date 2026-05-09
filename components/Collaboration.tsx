"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Collaboration() {
  return (
    <section className="relative w-full py-40 px-6 bg-white dark:bg-black overflow-hidden flex flex-col items-center justify-center text-center transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gray-100 dark:bg-white/5 rounded-full blur-[80px]"
        ></motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-16">
        <div className="relative group">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Join the FieldTheory Engine!
          </motion.h2>
        </div>
      </div>
    </section>
  );
}
