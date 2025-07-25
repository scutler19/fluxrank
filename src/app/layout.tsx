import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FluxRank.io – Live OSS Leaderboard",
  description: "Real-time leaderboard of open source projects ranked by momentum, combining GitHub stars, npm downloads, and Reddit buzz.",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <script defer data-domain="fluxrank.io" src="https://plausible.io/js/script.outbound-links.tagged-events.js"></script>
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-dark-bg text-gray-200`}
        style={{ 
          backgroundColor: '#1A1A1A',
          color: '#E5E5E5'
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
