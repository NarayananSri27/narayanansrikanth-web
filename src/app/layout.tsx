import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InstagramModal } from "@/components/InstagramModal";
import { ActivityTracker } from "@/components/ActivityTracker";

export const metadata: Metadata = {
  title: "Narayanan Srikanth",
  description:
    "Engineering student at McGill University. Software engineering, quantitative finance, aerospace systems, and research.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const goatcounterCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} storageKey="theme-v2"
        >
          <AuthProvider>
            <ActivityTracker />
            <InstagramModal />
            <div className="content">
              <Navbar />
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>

        {/* Lightweight, cookie-less aggregate traffic analytics */}
        {goatcounterCode && (
          <Script
            data-goatcounter={`https://${goatcounterCode}.goatcounter.com/count`}
            async
            src="//gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}


