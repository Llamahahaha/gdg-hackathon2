import Navbar from "@/components/Navbar";

export default function LivePage() {
  return (
    <main className="min-h-screen bg-black text-white p-24">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-8">Live</h1>
      </div>
    </main>
  );
}
