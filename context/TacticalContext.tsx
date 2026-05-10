"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface TacticalContextType {
  players: any[];
  liveFrame: string | null;
  connectionStatus: string;
  status: string;
  entropy: number;
  metrics: any;
  possession: string;
  isPlaying: boolean;
  frameIndex: number;
  timelineData: any[];
  startEngine: () => Promise<void>;
  stopEngine: () => Promise<void>;
}

const TacticalContext = createContext<TacticalContextType | undefined>(undefined);

export function TacticalProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<any[]>([]);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [status, setStatus] = useState("SYSTEM_READY");
  const [entropy, setEntropy] = useState(0.42);
  const [metrics, setMetrics] = useState<any>({ entropy: 0, articulation_points: [], diameter: 0, diameter_nodes: [] });
  const [possession, setPossession] = useState("UNKNOWN");
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    let socket: WebSocket;
    const connect = () => {
      try {
        socket = new WebSocket('ws://127.0.0.1:8000/ws');
        
        socket.onopen = () => {
          setConnectionStatus("CONNECTED");
          setWs(socket);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'status') {
              setStatus(data.message);
            }

            if (data.type === 'frame') {
              setLiveFrame(`data:image/jpeg;base64,${data.frame}`);
              setFrameIndex(data.stats?.frame_id || 0);
              setStatus("STREAMING_ACTIVE");
              
              if (data.stats) {
                const detections = data.stats.detections || [];
                const uniqueDetections = new Map();
                
                detections.forEach((d: any) => {
                  const bbox = d.bbox || [0, 0, 0, 0];
                  const center = d.center || [(bbox[0] + bbox[2])/2, (bbox[1] + bbox[3])/2];
                  const id = d.id !== undefined ? String(d.id) : String(Math.random());
                  
                  if (!uniqueDetections.has(id)) {
                    uniqueDetections.set(id, {
                      id: id,
                      rawX: center[0],
                      rawY: center[1],
                      x: (center[0] / 1920) * 800,
                      y: (center[1] / 1080) * 400,
                      name: `P${id}`,
                      team: d.team === 'green' ? 'A' : 'B'
                    });
                  }
                });

                setPlayers(Array.from(uniqueDetections.values()));
                setPossession(data.stats.possession || "UNKNOWN");
                
                if (data.stats.metrics) {
                  setMetrics(data.stats.metrics);
                  setEntropy(data.stats.metrics.entropy);
                  setTimelineData(prev => [...prev, { frame: data.stats.frame_id, entropy: data.stats.metrics.entropy }].slice(-100));
                }
              }
            }
          } catch (e) {
            console.error("Context: Failed to parse websocket message", e);
          }
        };

        socket.onclose = () => {
          setConnectionStatus("DISCONNECTED");
          setWs(null);
          // Try to reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setConnectionStatus("ERROR");
        };

      } catch (e) {
        setConnectionStatus("ERROR");
      }
    };

    connect();
    return () => {
      if (socket) socket.close();
    };
  }, []);

  const startEngine = useCallback(async () => {
    setIsPlaying(true);
    setStatus("SIGNAL_INITIALIZED");
    try {
      const response = await fetch('http://127.0.0.1:8000/start', { method: 'POST' });
      if (!response.ok) throw new Error("Failed to start pipeline");
    } catch (e) {
      setStatus("SIGNAL_ERROR");
      setIsPlaying(false);
    }
  }, []);

  const stopEngine = useCallback(async () => {
    setIsPlaying(false);
    setStatus("SIGNAL_ABORTED");
    try {
      await fetch('http://127.0.0.1:8000/stop', { method: 'POST' });
    } catch (e) {
      console.error("Failed to stop pipeline:", e);
    }
  }, []);

  return (
    <TacticalContext.Provider value={{
      players, liveFrame, connectionStatus, status, entropy, metrics, 
      possession, isPlaying, frameIndex, timelineData,
      startEngine, stopEngine
    }}>
      {children}
    </TacticalContext.Provider>
  );
}

export function useTactical() {
  const context = useContext(TacticalContext);
  if (context === undefined) {
    throw new Error('useTactical must be used within a TacticalProvider');
  }
  return context;
}
