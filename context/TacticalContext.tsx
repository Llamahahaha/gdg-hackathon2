"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface Player {
  id: string;
  rawX: number;
  rawY: number;
  x: number;
  y: number;
  name: string;
  team: 'A' | 'B';
}

export interface Metrics {
  entropy: number;
  articulation_points: string[];
  diameter: number;
  diameter_nodes: string[];
}

export interface Detection {
  id: number | string;
  bbox?: [number, number, number, number];
  center?: [number, number];
  team: string;
}

export interface FrameData {
  frame_id: number;
  detections: Detection[];
  metrics: Metrics;
  possession: string;
  t1: number;
  t2: number;
}

interface TacticalContextType {
  players: Player[];
  liveFrame: string | null;
  connectionStatus: string;
  status: string;
  entropy: number;
  metrics: Metrics;
  possession: string;
  isPlaying: boolean;
  frameIndex: number;
  timelineData: FrameData[];       // full frame records for Replay Lab
  uploadedVideoSrc: string | null; // blob URL of the video uploaded in Live Engine
  analysisTeam: 'green' | 'white';
  setAnalysisTeam: (team: 'green' | 'white') => void;
  setUploadedVideoSrc: (src: string | null) => void;
  currentStats: FrameData | null;  // stats of the most-recent frame (for pause snapshot)
  startEngine: () => Promise<void>;
  stopEngine: () => Promise<void>;
}

const TacticalContext = createContext<TacticalContextType | undefined>(undefined);

export function TacticalProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [status, setStatus] = useState("SYSTEM_READY");
  const [entropy, setEntropy] = useState(0.42);
  const [metrics, setMetrics] = useState<Metrics>({ entropy: 0, articulation_points: [], diameter: 0, diameter_nodes: [] });
  const [possession, setPossession] = useState("UNKNOWN");
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [timelineData, setTimelineData] = useState<FrameData[]>([]);
  const [uploadedVideoSrc, setUploadedVideoSrc] = useState<string | null>(null);
  const [currentStats, setCurrentStats] = useState<FrameData | null>(null);
  const [analysisTeam, setAnalysisTeam] = useState<'green' | 'white'>('green');
  
  const isPlayingRef = useRef(isPlaying);
  const timelineDataRef = useRef<FrameData[]>([]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    timelineDataRef.current = timelineData;
  }, [timelineData]);

  useEffect(() => {
    let socket: WebSocket;
    const connect = () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${window.location.hostname}:8000`;
        const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws';
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          setConnectionStatus("CONNECTED");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'status') {
              if (isPlayingRef.current) setStatus(data.message);
            }

            if (data.type === 'frame') {
              if (!isPlayingRef.current) return; // Prevent updates when aborted
              
              setLiveFrame(`data:image/jpeg;base64,${data.frame}`);
              setFrameIndex(data.stats?.frame_id || 0);
              setStatus("STREAMING_ACTIVE");
              
              if (data.stats) {
                const detections: Detection[] = data.stats.detections || [];
                const uniqueDetections = new Map<string, Player>();
                
                detections
                  .filter(d => (d.team === 'green' || d.team === 'white') && d.id !== undefined)
                  .forEach((d) => {
                    const center = d.center || [0, 0];
                    
                    // Filter out zero-coordinate noise from top-left corner
                    if (center[0] <= 0 && center[1] <= 0) return;

                    const id = String(d.id);
                    
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
                }
                // Keep last 300 full frames for Replay Lab
                const fullRecord = {
                  frame_id: data.stats.frame_id,
                  detections: data.stats.detections || [],
                  metrics: data.stats.metrics || {},
                  possession: data.stats.possession || 'UNKNOWN',
                  t1: data.stats.team1_count || 0,
                  t2: data.stats.team2_count || 0
                };
                setCurrentStats(fullRecord);
                setTimelineData(prev => [...prev, fullRecord].slice(-300));
              }
            }
          } catch {
            console.error("Context: Failed to parse websocket message");
          }
        };

        socket.onclose = () => {
          setConnectionStatus("DISCONNECTED");
          // Try to reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setConnectionStatus("ERROR");
        };

      } catch {
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
    isPlayingRef.current = true;
    setStatus("SIGNAL_INITIALIZED");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${window.location.hostname}:8000`;
      const response = await fetch(`${backendUrl}/start`, { method: 'POST' });
      if (!response.ok) throw new Error("Failed to start pipeline");
    } catch {
      setStatus("SIGNAL_ERROR");
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, []);

   const stopEngine = useCallback(async () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setStatus("SIGNAL_ABORTED");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${window.location.hostname}:8000`;
      await fetch(`${backendUrl}/stop`, { method: 'POST' });
      
      if (timelineDataRef.current.length > 0) {
        console.log("Checking Supabase connection...");
        if (!supabase) {
          console.warn("Supabase not configured. Skipping cloud save.");
          alert("Match halted. Note: Match data was NOT saved to the cloud because Supabase is not configured.");
        } else {
          console.log("Saving telemetry to Supabase...");
          const { error } = await supabase.from('match_telemetry').insert([{
            match_id: 'live_match_' + Date.now(),
            total_frames: timelineDataRef.current.length,
            timeline_data: timelineDataRef.current
          }]);
          
          if (error) {
            // Log the raw error — Supabase error properties are non-enumerable
            // so spreading into {} shows empty. Log directly instead.
            console.error("Supabase Save Error:", error.message || error);
            console.error("  message:", error?.message);
            console.error("  code:", error?.code);
            console.error("  details:", error?.details);
            console.error("  hint:", error?.hint);
            alert(`❌ Supabase Error: ${error?.message || 'Unable to connect. The project might be paused or offline.'}\nCode: ${error?.code || 'N/A'}`);
          } else {
            console.log("Successfully saved match telemetry to Supabase.");
            alert("✅ Match data successfully saved to Supabase!");
          }
        }
      } else {
        console.warn("No telemetry data to save.");
      }
    } catch (e) {
      console.error("Failed to stop pipeline or save telemetry", e);
      alert("⚠️ Error during stop: " + (e instanceof Error ? e.message : String(e)));
    }
  }, []);

  return (
    <TacticalContext.Provider value={{
      players, liveFrame, connectionStatus, status, entropy, metrics, 
      possession, isPlaying, frameIndex, timelineData,
      uploadedVideoSrc, setUploadedVideoSrc,
      currentStats,
      analysisTeam, setAnalysisTeam,
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
