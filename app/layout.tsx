import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers"

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-[#080c08] dark:text-white transition-colors duration-300">
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
