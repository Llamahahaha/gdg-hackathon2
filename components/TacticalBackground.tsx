"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function TacticalBackground() {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [nodes, setNodes] = React.useState<{id: number, x: number, y: number, dx: number[], dy: number[], duration: number, type: string, team: string}[]>([]);

  React.useEffect(() => {
    const generatedNodes = Array.from({ length: 11 }).map((_, i) => {
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 60;
      return {
        id: i,
        x,
        y,
        dx: [x, x + (Math.random() - 0.5) * 5, x],
        dy: [y, y + (Math.random() - 0.5) * 5, y],
        duration: 5 + Math.random() * 5,
        type: i === 0 ? 'ball' : 'player',
        team: i < 6 ? 'A' : 'B'
      };
    });
    requestAnimationFrame(() => {
      setNodes(generatedNodes);
    });
  }, []);

  if (!isMounted) return <div className="absolute inset-0 bg-charcoal" />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-charcoal">
      {/* Pitch Grid */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
             backgroundSize: '10% 10%',
             maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
           }} 
      />

      {/* Spectral Wave Overlays */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          animate={{ x: [-100, 100], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20 blur-3xl"
        />
      </div>

      <svg className="absolute inset-0 w-full h-full">
        {/* Connection Edges */}
        {nodes.map((node, i) => (
          nodes.slice(i + 1).map((other, j) => {
            const distance = Math.hypot(node.x - other.x, node.y - other.y);
            if (distance > 25) return null;
            
            return (
              <motion.line
                key={`${i}-${j}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${other.x}%`}
                y2={`${other.y}%`}
                stroke={node.team === other.team ? "rgba(0, 243, 255, 0.3)" : "rgba(255, 0, 51, 0.1)"}
                strokeWidth={0.5}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            );
          })
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ x: `${node.x}%`, y: `${node.y}%` }}
            animate={{ 
              x: node.dx.map(val => `${val}%`),
              y: node.dy.map(val => `${val}%`)
            }}
            transition={{ duration: node.duration, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle 
              r={node.type === 'ball' ? 4 : 2} 
              fill={node.type === 'ball' ? "#ffffff" : node.team === 'A' ? "#00f3ff" : "#0066ff"}
              className="drop-shadow-[0_0_8px_currentColor]"
            />
            {node.type === 'player' && (
              <circle r={6} fill="transparent" stroke="currentColor" strokeWidth={0.5} className="opacity-20" />
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
