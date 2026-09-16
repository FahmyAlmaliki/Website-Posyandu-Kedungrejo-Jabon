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
          className="mb-1.5 block text-sm font-medium text-blue-900"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="input-cloud"
          placeholder="admin"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-blue-900"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input-cloud"
          placeholder="••••••••"
        />
      </div>

      {errorMessage && (
        <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 ring-1 ring-rose-100">
          {errorMessage}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
