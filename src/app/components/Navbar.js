"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";

export default function Navbar() {
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let subscription;
    try {
      const supabase = getSupabase();
      supabase.auth.getUser().then(({ data }) => {
        if (active) setSignedIn(Boolean(data.user));
      });
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setSignedIn(Boolean(session?.user));
      });
      subscription = result.data.subscription;
    } catch {
      // The layout can render before Supabase has been configured.
    }
    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function logout() {
    try {
      await getSupabase().auth.signOut();
      setSignedIn(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">S</span>
          <span className="truncate text-base font-bold text-slate-900 sm:text-lg">Survey Website</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/" className="hidden text-sm font-semibold text-slate-700 hover:text-blue-700 sm:inline">Survey</Link>
          {signedIn ? (
            <>
              <Link href="/dashboard" className="rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-800 sm:px-4 sm:text-sm">Dashboard</Link>
              <button onClick={logout} type="button" className="text-xs font-semibold text-slate-700 hover:text-blue-700 sm:text-sm">Logout</button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-800 sm:px-4 sm:text-sm">Admin Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
