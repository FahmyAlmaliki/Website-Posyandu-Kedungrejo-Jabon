import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";
import { PosyanduLogo } from "@/components/posyandu-logo";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group transition">
          <PosyanduLogo className="h-10 w-10 shadow-xs rounded-xl" showText={true} />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Dashboard
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <Link href="/upload" className="btn-primary">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload CSV</span>
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>Admin</span>
              </div>
              <form action={logout}>
                <button type="submit" className="btn-secondary text-xs">
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Login Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
