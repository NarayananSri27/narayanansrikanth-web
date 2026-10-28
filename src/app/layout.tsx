import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InstagramModal } from "@/components/InstagramModal";
import { ActivityTracker } from "@/components/ActivityTracker";

export const metadata: Metadata = {
  title: "Narayanan Srikanth — Engineering at McGill",
  description:
    "Personal website of Narayanan Srikanth. Engineering student at McGill University interested in software, finance & fintech, aerospace systems, and research.",
  keywords: [
    "Narayanan Srikanth",
    "McGill University",
    "Engineering",
    "Software Engineering",
    "Quantitative Finance",
    "Aerospace",
  ],
  authors: [{ name: "Narayanan Srikanth" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-neutral-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ActivityTracker />
            <InstagramModal />
            <Navbar />
            <main className="flex-1 w-full max-w-4xl mx-auto px-5 sm:px-8 py-10 md:py-16">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
