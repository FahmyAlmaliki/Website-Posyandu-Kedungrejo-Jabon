import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-lg font-bold text-white shadow-sm">
            P
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-blue-900">
              Posyandu Kedungrejo
            </span>
            <span className="block text-xs text-sky-600">
              Data Vital Sign • Jabon
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-blue-800"
          >
            Beranda
          </Link>

          {session?.user ? (
            <>
              <Link href="/upload" className="btn-primary">
                Upload CSV
              </Link>
              <form action={logout}>
                <button type="submit" className="btn-secondary">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-blue-800"
            >
              Login Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
