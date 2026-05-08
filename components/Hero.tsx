import React from 'react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          type="video/mp4"
        />
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col px-6 md:px-12 lg:px-16 pb-12 lg:pb-16 justify-end">
        <div className="lg:grid lg:grid-cols-2 lg:items-end">
          {/* Left Column */}
          <div className="flex flex-col">
            <AnimatedHeading
              text={"Shaping the future\nof athletic performance."}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
              initialDelay={200}
              charDelay={30}
              duration={500}
            />

            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl">
                Real-time AI vision and performance intelligence for the next generation of champions.
              </p>
            </FadeIn>

            <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-4">
              <button className="bg-white text-black px-8 py-3 rounded-lg font-medium transition-all">
                Watch Demo
              </button>
              <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium transition-all hover:bg-white hover:text-black">
                Explore Tech
              </button>
            </FadeIn>
          </div>

          {/* Right Column */}
          <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <span className="text-lg md:text-xl lg:text-2xl font-light">
                  Vision. Performance. Growth.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
