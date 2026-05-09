"use client";

import React from 'react';
import { motion } from 'framer-motion';

const timelineSteps = [
  {
    title: "1. DATA INGESTION",
    tech: "YOLOv8 & OpenCV",
    desc: "Raw video feeds are parsed in real-time. Player and ball coordinates are extracted via neural object detection, assigning unique tracking IDs to each entity."
  },
  {
    title: "2. STREAM PROCESSING",
    tech: "Apache Flink",
    desc: "Coordinate data is streamed and transformed. Noise is filtered out, and multi-camera perspectives are stitched into a unified 2D pitch projection."
  },
  {
    title: "3. TOPOLOGICAL ENGINE",
    tech: "Memgraph / NetworkX",
    desc: "Players become nodes. Distances and tactical vectors are converted into weighted edges. The system computes Laplacian matrices and centrality live."
  },
  {
    title: "4. COMMAND HUD",
    tech: "Next.js & Framer Motion",
    desc: "Graph states are rendered into the tactical interface. AI heuristics output live recommendations based on detected community fractures."
  }
];

export default function Timeline() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 bg-charcoal relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-500"
          >
            Architecture
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-orbitron tracking-tighter text-white"
          >
            PIPELINE TELEMETRY
          </motion.h2>
        </div>

        <div className="relative border-l border-white/10 ml-4 md:ml-1/2 md:left-1/2 md:-translate-x-1/2 space-y-16 py-8">
          {timelineSteps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={i} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Center Node */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
                />

                {/* Content Card */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`w-full pl-8 md:pl-0 md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12 text-left md:text-right'}`}
                >
                  <div className="liquid-glass p-6 group hover:border-blue-500/50 transition-colors">
                    <h3 className="text-lg font-orbitron font-bold text-white mb-1">{step.title}</h3>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">{step.tech}</div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* Animated Line overlay */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-[-1px] md:left-[calc(50%-1px)] w-[2px] bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent origin-top"
          />
        </div>
      </div>
    </section>
  );
}
