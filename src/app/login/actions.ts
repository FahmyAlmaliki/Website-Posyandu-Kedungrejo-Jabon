"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/upload",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Username atau password salah.";
    }
    throw error;
  }
}
