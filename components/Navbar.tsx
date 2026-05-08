import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="px-6 md:px-12 lg:px-16 pt-6 w-full fixed top-0 z-50">
      <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="text-2xl font-semibold tracking-tight">
          PulsePlay AI
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Live", "Analytics", "Insights", "Team"].map((link) => (
            <Link
              key={link}
              href={`/${link.toLowerCase()}`}
              className="text-sm transition-colors hover:text-gray-300"
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Right: Button */}
        <button className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100">
          Get Started
        </button>
      </div>
    </nav>
  );
}

