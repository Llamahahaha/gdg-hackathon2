import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CoreTechnologies from "@/components/CoreTechnologies";
import SimulationPreview from "@/components/SimulationPreview";
import Timeline from "@/components/Timeline";
import PlatformExtensibility from "@/components/PlatformExtensibility";

export default function Home() {
  return (
    <main className="min-h-screen bg-charcoal">
      <Navbar />
      <Hero />
      <HowItWorks />
      <CoreTechnologies />
      <SimulationPreview />
      <Timeline />
      <PlatformExtensibility />
    </main>
  );
}




