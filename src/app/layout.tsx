import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Posyandu Kedungrejo Jabon",
  description:
    "Sistem informasi hasil pengukuran Vital Sign Posyandu Kedungrejo Jabon",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-slate-400 sm:px-6">
          Posyandu Kedungrejo Jabon • Sistem Data Vital Sign
        </footer>
      </body>
    </html>
  );
}
