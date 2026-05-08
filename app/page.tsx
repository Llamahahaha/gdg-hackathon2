import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ClassifyUI from "@/components/ClassifyUI";
import Timeline from "@/components/Timeline";
import Collaboration from "@/components/Collaboration";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Collaboration />
      <ClassifyUI />
      <Timeline />
    </main>
  );
}


