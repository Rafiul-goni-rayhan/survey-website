"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;

      // Signing in is not enough: the user must be in the admin_users table.
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (adminError) throw adminError;
      if (!admin) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized as an admin.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to view submitted survey data.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-slate-900">Email Address</label>
            <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-slate-900">Password</label>
            <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className={fieldClass} />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-700 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? "Signing in..." : "Login to Dashboard"}</button>
        </form>
        {errorMessage && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-blue-700 hover:underline">← Back to Survey</Link>
        <p className="mt-6 text-center text-xs text-slate-500">Authorized administrators only</p>
      </div>
    </main>
  );
}
