import Navbar from "@/components/Navbar";

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white p-24">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-8">Team Roster</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="liquid-glass p-6 rounded-xl border border-white/10 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                P{i}
              </div>
              <h3 className="font-semibold">Athlete {i}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Stamina: 9{i}%</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
