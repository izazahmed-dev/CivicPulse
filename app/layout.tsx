import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicPulse — Civic Intelligence Platform",
  description: "Report civic issues, track resolutions, and connect with your community. AI-powered civic intelligence for smarter cities.",
  keywords: ["civic", "infrastructure", "water", "community", "AI", "India"],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

import ChatBot from "@/components/ChatBot";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollProgress from "@/components/ScrollProgress";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/components/Toast";
import BackToTop from "@/components/BackToTop";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise-bg`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ChatProvider>
                <ToastProvider>
                  <ScrollProgress />
                  <Navbar />
                  {children}
                  <ThemeToggle />
                  <LanguageSwitcher />
                  <ChatBot />
                  <BackToTop />
                </ToastProvider>
              </ChatProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
