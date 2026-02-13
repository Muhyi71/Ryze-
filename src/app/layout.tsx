import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ryze AI — UI Generator",
  description:
    "AI-powered agent that converts natural language UI intent into working UI code with live preview. Uses a fixed, deterministic component library.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
