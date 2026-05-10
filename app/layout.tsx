import type { Metadata } from "next";
import { Inter, Orbitron } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: "FieldTheory | Tactical Graph Intelligence",
  description: "Advanced topological sports analytics and real-time team connectivity mapping.",
};

import { TacticalProvider } from "@/context/TacticalContext";
import AuthGuard from "@/components/AuthGuard";
import ChatBot from "@/components/ChatBot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-charcoal text-white font-sans antialiased">
        <AuthProvider>
          <AuthGuard>
            <TacticalProvider>
              {children}
              <ChatBot />
            </TacticalProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
