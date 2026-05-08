"use client";

import React, { useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  text: string;
  initialDelay?: number;
  charDelay?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedHeading({
  text,
  initialDelay = 200,
  charDelay = 30,
  duration = 500,
  className = "",
}: AnimatedHeadingProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split('\n');

  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, lineIndex) => {
        // Calculate cumulative length of previous lines for correct staggered delay
        const previousLinesLength = lines
          .slice(0, lineIndex)
          .reduce((acc, curr) => acc + curr.length, 0);

        return (
          <div key={lineIndex} className="block overflow-hidden">
            {line.split('').map((char, charIndex) => {
              const globalIndex = previousLinesLength + charIndex;
              const delay = globalIndex * charDelay;

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all ease-out"
                  style={{
                    display: 'inline-block',
                    opacity: isAnimating ? 1 : 0,
                    transform: isAnimating ? 'translateX(0)' : 'translateX(-18px)',
                    transitionDuration: `${duration}ms`,
                    transitionDelay: `${delay}ms`,
                    whiteSpace: char === ' ' ? 'pre' : 'normal',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        );
      })}
    </h1>
  );
}
