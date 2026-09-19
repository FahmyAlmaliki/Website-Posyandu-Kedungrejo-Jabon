import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Posyandu Kedungrejo Jabon • Sistem Basis Data Vital Sign",
  description:
    "Sistem Basis Data Registri Hasil Pengukuran Vital Sign Balita Posyandu Kedungrejo Jabon",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>Sistem Registri Vital Sign Balita • Posyandu Desa Kedungrejo Jabon</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Database Engine: SQLite</span>
              <span>•</span>
              <span>Koneksi Aman</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
