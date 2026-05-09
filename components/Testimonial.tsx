"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "FieldTheory's topological graph engine completely changed how we analyze defensive fractures. We no longer look at players as points, but as a cohesive network.",
    author: "Elena Rostova",
    role: "Lead Data Scientist, FC Metro",
    color: "#10b981" // Emerald
  },
  {
    quote: "The ability to visualize betweenness centrality live during a match allows us to identify the opponent's lynchpin instantly. It's a game-changer.",
    author: "Marcus Vance",
    role: "Tactical Analyst, Premier Division",
    color: "#3b82f6" // Cyber Blue
  },
  {
    quote: "When we see the edges flicker and turn rose, we know a community collapse is imminent. We can adjust our formation before the opposition exploits the gap.",
    author: "Sarah Jenkins",
    role: "Head Coach, National Squad",
    color: "#f59e0b" // Amber
  }
];

export default function Testimonial() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 bg-[#0b0f1a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-500"
          >
            System Feedback
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-orbitron tracking-tighter text-white"
          >
            TACTICAL VALIDATION
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="liquid-glass p-8 flex flex-col justify-between space-y-6 group hover:border-white/20 transition-colors"
            >
              <Quote className="w-8 h-8 opacity-50" style={{ color: t.color }} />
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div 
                  className="w-10 h-10 rounded-full bg-black/50 border flex items-center justify-center font-orbitron font-bold text-sm"
                  style={{ borderColor: t.color, color: t.color }}
                >
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{t.author}</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
