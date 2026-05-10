"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Activity, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const seedDatabase = async () => {
    setIsSeeding(true);
    setStatus({ type: 'idle', message: '' });

    try {
      // 1. Seed Teams
      await setDoc(doc(db, "teams", "team_manblue"), {
        teamId: "team_manblue",
        name: "Man Blue FC",
        shortName: "MCI",
        primaryColor: "#00B2A9",
        defaultFormation: "4-3-3",
        players: [
          { playerId: "p1", name: "Haaland", number: 9, position: "FW" },
          { playerId: "p2", name: "De Bruyne", number: 17, position: "MID" }
        ]
      });

      // 2. Seed Matches
      await setDoc(doc(db, "matches", "match_8899"), {
        matchId: "match_8899",
        teamId: "team_manblue",
        opponent: "Red United",
        date: new Date().toISOString(),
        status: "completed",
        score: { us: 2, them: 1 },
        telemetryDataUrl: "gs://fieldtheory-app.appspot.com/telemetry/match_8899.json"
      });

      // 3. Seed Intelligence Reports
      await setDoc(doc(db, "intelligence_reports", "rep_match_8899"), {
        reportId: "rep_match_8899",
        matchId: "match_8899",
        generatedAt: new Date().toISOString(),
        metrics: {
          overallStructuralHealth: 87.5,
          averageTeamCompactness: 22.4,
          criticalLynchpin: {
            playerId: "p2",
            name: "De Bruyne",
            isolationRiskScore: 92.1
          }
        },
        keyEvents: [
          {
            timestamp: "45:12",
            eventType: "formation_fracture",
            description: "Midfield connectivity dropped below 40%."
          }
        ]
      });

      setStatus({ type: 'success', message: 'Successfully seeded the database with sample data!' });
    } catch (error: unknown) {
      console.error("Error seeding database:", error);
      setStatus({ type: 'error', message: (error as Error).message || 'Failed to seed database' });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 px-4">
      <Navbar />
      
      <div className="max-w-3xl mx-auto mt-12">
        <div className="p-8 border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-widest uppercase font-orbitron">Database Admin</h1>
              <p className="text-white/50 text-xs mt-1 uppercase tracking-widest">Manage your Firebase Firestore</p>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            This tool will inject sample tactical data (Teams, Matches, and Intelligence Reports) directly into your configured Firebase project. 
            Make sure your <code className="bg-white/10 px-1 rounded text-cyan-400">.env.local</code> is configured correctly and your Firestore Database is initialized in the Firebase Console.
          </p>

          <button
            onClick={seedDatabase}
            disabled={isSeeding}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-4 rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <Activity className="w-5 h-5 animate-pulse" />
                Injecting Data...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Seed Sample Data to Firestore
              </>
            )}
          </button>

          {status.type !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${
              status.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <div className="text-sm">{status.message}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
