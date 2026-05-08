import Navbar from "@/components/Navbar";

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-24">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-8">AI Insights</h1>
        <div className="space-y-4">
          <div className="liquid-glass p-6 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-500">Fatigue Warning</h3>
              <p className="text-sm text-gray-400">Player 4 is at 82% fatigue. Substitution recommended within 5 minutes.</p>
            </div>
            <button className="px-4 py-2 bg-white/10 rounded-lg text-xs font-medium">Dismiss</button>
          </div>
          <div className="liquid-glass p-6 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-500">Tactical Advantage</h3>
              <p className="text-sm text-gray-400">Defensive gap detected in opponent's left wing. High sprint opportunity.</p>
            </div>
            <button className="px-4 py-2 bg-white/10 rounded-lg text-xs font-medium">Dismiss</button>
          </div>
        </div>
      </div>
    </main>
  );
}
