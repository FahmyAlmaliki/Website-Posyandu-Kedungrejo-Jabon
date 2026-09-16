import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/upload");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div className="w-full animate-fade-up rounded-3xl border border-sky-100 bg-white/90 p-7 shadow-cloud backdrop-blur sm:p-9">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-2xl text-white shadow-sm">
            🔐
          </span>
          <h1 className="mt-4 text-xl font-bold text-blue-900">
            Login Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Masuk untuk mengunggah data hasil pengukuran.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
