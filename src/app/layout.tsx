import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import SupportBot from "@/components/SupportBot";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { UserActivityMiddleware } from "@/middleware/userActivityMiddleware";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <UserActivityMiddleware>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <Footer />
              <SupportBot />
            </div>
          </UserActivityMiddleware>
        </AuthProvider>
      </body>
    </html>
  );
}
