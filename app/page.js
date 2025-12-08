"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    // If already logged in, go straight to dashboard
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    // For this project, just send them to the dashboard after sign up
    router.push("/dashboard");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">DecoSpace</h1>
        <p className="text-sm text-slate-600">
          Your hub for all your styling needs. Log in or create an account to
          generate AI-powered room plans with live community inspiration.
        </p>
      </header>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3"
        >
          <h2 className="font-semibold text-lg">Log in</h2>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full mt-2 bg-slate-900 text-white text-sm rounded-lg py-2"
          >
            Log in
          </button>
        </form>

        <form
          onSubmit={handleSignup}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3"
        >
          <h2 className="font-semibold text-lg">Sign up</h2>
          <p className="text-xs text-slate-500">
            Supabase Auth makes DecoSpace behave like a real SaaS product.
          </p>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full mt-2 bg-slate-900 text-white text-sm rounded-lg py-2"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
