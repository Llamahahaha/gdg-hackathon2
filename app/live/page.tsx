import Navbar from "@/components/Navbar";

export default function LivePage() {
  return (
    <main className="min-h-screen bg-black text-white p-24">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-8">Live Match Tracking</h1>
        <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative">
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold animate-pulse">LIVE</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">Player 7: 18km/h</span>
          </div>
          <span className="text-gray-500 italic">OpenCV / MediaPipe Stream Placeholder</span>
        </div>
      </div>
    </main>
  );
}
