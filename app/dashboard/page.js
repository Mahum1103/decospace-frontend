"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DashboardPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [roomType, setRoomType] = useState("Living room");
  const [dimensions, setDimensions] = useState("12x15");
  const [style, setStyle] = useState("Modern cozy");
  const [budget, setBudget] = useState("500");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  // ✅ Protect the dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.push("/");
      } else {
        setUserEmail(data.session.user.email);
        setLoadingSession(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // ✅ Generate AI Design
  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary("");
    setImages([]);

    try {
      const res = await fetch(`${BACKEND_URL}/design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_type: roomType,
          dimensions,
          style,
          budget
        })
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setSummary(data.summary || "");
      setImages(data.images || []);
    } catch (err) {
      setError("Design generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingSession) return <p className="p-6">Loading...</p>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DecoSpace Dashboard</h1>
          <p className="text-sm text-slate-600">Logged in as {userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-slate-200 px-4 py-2 rounded-lg text-sm"
        >
          Log out
        </button>
      </div>

      {/* Generator */}
      <form
        onSubmit={handleGenerate}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold">Generate a New Room Design</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            placeholder="Room Type"
            className="border p-2 rounded-lg"
          />
          <input
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="Room Dimensions"
            className="border p-2 rounded-lg"
          />
        </div>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="border p-2 rounded-lg w-full"
        >
          <option>Modern cozy</option>
          <option>Minimalist</option>
          <option>Luxury glam</option>
          <option>Boho</option>
          <option>Industrial</option>
        </select>

        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget"
          className="border p-2 rounded-lg w-full max-w-[200px]"
        />

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Design"}
        </button>
      </form>

      {/* AI Output */}
      {summary && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Your AI Design Plan</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {/* Visual Inspiration */}
      {images.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Visual Inspiration</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Design inspiration"
                className="rounded-lg object-cover w-full h-40"
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
