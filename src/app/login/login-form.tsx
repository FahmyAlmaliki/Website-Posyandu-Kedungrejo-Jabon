"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-xs font-semibold text-slate-800 uppercase tracking-wider"
        >
          Nama Pengguna (Username)
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="input-db w-full text-sm"
          placeholder="admin"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-xs font-semibold text-slate-800 uppercase tracking-wider"
        >
          Kata Sandi (Password)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input-db w-full text-sm font-mono"
          placeholder="••••••••"
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 ring-1 ring-rose-200">
          <svg className="h-4 w-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-2.5 text-xs uppercase tracking-wider font-bold"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Memverifikasi Akses...</span>
          </span>
        ) : (
          "Masuk ke Konsol Admin"
        )}
      </button>
    </form>
  );
}
