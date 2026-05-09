import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Timeline from "@/components/Timeline";
import Testimonial from "@/components/Testimonial";
import Collaboration from "@/components/Collaboration";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Timeline />
      <Testimonial />
      <Collaboration />
    </main>
  );
}



