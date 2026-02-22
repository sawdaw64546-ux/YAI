import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doh Doh AI Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with D.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["D.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Doh Doh development", "React"],
  authors: [{ name: "D.ai Team" }],
  icons: {
    icon: "https://github.com/sawdaw64546-ux/YAI/blob/fc1dcb877a414e4365217e9c3c60db1bb29c1c63/src/public/logo.png",
  },
  openGraph: {
    title: "D.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://ddsmileai.vercel.app/",
    siteName: "D.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "D.ai Code Scaffold",
    description: "Doh Doh-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
