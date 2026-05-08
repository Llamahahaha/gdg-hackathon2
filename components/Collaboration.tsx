"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Collaboration() {
  return (
    <section className="relative w-full py-40 px-6 bg-sky-400 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Brighter Dynamic Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-white/40 rounded-full blur-[120px]"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, -40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-sky-200/50 rounded-full blur-[100px]"
        ></motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-16">
        <div className="relative group">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-black text-[#064E3B] tracking-tighter drop-shadow-[0_10px_25px_rgba(6,78,59,0.3)] relative z-10"
          >
            Let's Collaborate!
          </motion.h2>
          
          {/* Shiny/Shimmer Effect Layer */}
          <motion.div
            animate={{ 
              backgroundPosition: ["200% 0", "-200% 0"] 
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 text-7xl md:text-9xl font-black text-white/40 tracking-tighter pointer-events-none z-20 mix-blend-overlay bg-gradient-to-r from-transparent via-white/80 to-transparent bg-[length:200%_100%]"
            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Let's Collaborate!
          </motion.div>
        </div>

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 10,
            delay: 0.5 
          }}
          whileHover={{ 
            scale: 1.2, 
            rotate: 15,
            boxShadow: "0 0 50px rgba(255,255,255,0.8)"
          }}
          className="w-32 h-32 rounded-full bg-[#064E3B] flex items-center justify-center text-white text-4xl font-black border-8 border-white shadow-2xl cursor-pointer relative overflow-hidden group"
        >
          <span className="relative z-10">OF</span>
          <motion.div 
            animate={{ 
              rotate: 360 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
}
