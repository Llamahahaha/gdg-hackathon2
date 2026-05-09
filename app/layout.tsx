import type { Metadata } from "next";
import { Inter, Orbitron } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/components/providers"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: "PulsePlay AI | Sports Intelligence Platform",
  description: "Real-time AI vision and performance intelligence for the next generation of champions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-white text-black dark:bg-[#080c08] dark:text-white transition-colors duration-300 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
