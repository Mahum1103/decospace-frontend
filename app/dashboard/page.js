"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // e.g., https://xxx.hf.space

export default function DashboardPage() {
  const router = useRouter();
  const [sessionEmail, setSessionEmail] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [roomType, setRoomType] = useState("Living room");
  const [dimensions, setDimensions] = useState("12x15");
  const [style, setStyle] = useState("neutral, cozy, renter-friendly");
  const [budget, setBudget] = useState("400");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) {
        router.push("/");
      } else {
        setSessionEmail(user.email ?? null);
        setCheckingSession(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSummary("");
    setPosts([]);

    if (!BACKEND_URL) {
      setError("Backend URL is not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          room_type: roomType,
          dimensions,
          style,
          budget
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error: ${text}`);
      }

      const data = await res.json();
      setSummary(data.summary || "");
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong generating your design.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingSession) {
    return <p className="text-sm text-slate-500">Checking session...</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DecoSpace</h1>
          <p className="text-sm text-slate-600">
            Signed in as {sessionEmail}. Describe your room and let DecoSpace
            pull community inspiration for you.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 bg-white text-xs px-3 py-1.5"
        >
          Log out
        </button>
      </header>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Room type</label>
            <input
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Dimensions (ft)
            </label>
            <input
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Style notes</label>
          <textarea
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="max-w-[200px]">
          <label className="block text-sm font-medium mb-1">Budget ($)</label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm rounded-lg px-4 py-2"
        >
          {isSubmitting ? "Designing your space..." : "Generate my design"}
        </button>
      </form>

      {summary && (
        <section className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-2">
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="text-sm whitespace-pre-line">{summary}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              Community inspiration (Reddit)
            </h2>
            {posts.length === 0 ? (
              <p className="text-sm text-slate-500">
                No posts found or Reddit request failed.
              </p>
            ) : (
              <ul className="space-y-2">
                {posts.map((title, idx) => (
                  <li
                    key={idx}
                    className="border border-slate-200 rounded-lg p-3 text-sm bg-slate-50"
                  >
                    {title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
