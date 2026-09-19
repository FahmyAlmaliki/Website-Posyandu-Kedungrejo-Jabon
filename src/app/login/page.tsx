import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/upload");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-6">
      <div className="w-full db-card p-7 sm:p-8 shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-700 to-sky-500 text-xl text-white shadow-xs">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">
            Login Administrator Posyandu
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Autentikasi diperlukan untuk mengunggah dan mengelola data registri balita.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition inline-flex items-center gap-1"
          >
            ← Kembali ke Dashboard Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
