"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) setError(error.message);
    else router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6">Sign in to DecoSpace</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white py-3 rounded">
          Sign In
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      <p className="text-sm mt-6 text-center">
        No account yet?{" "}
        <a href="/signup" className="underline font-medium">
          Create one
        </a>
      </p>
    </div>
  );
}
