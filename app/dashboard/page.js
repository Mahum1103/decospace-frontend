"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function DashboardPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");

  // Form state
  const [roomType, setRoomType] = useState("Living room");
  const [dimensions, setDimensions] = useState("12x15");
  const [style, setStyle] = useState("Modern cozy");
  const [budget, setBudget] = useState("500");
  const [vibe, setVibe] = useState("");

  // Result state
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [error, setError] = useState(null);

  // ✅ Protect dashboard
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

  // ✅ Load saved designs from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("decospace_saved_designs");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedDesigns(parsed);
      }
    } catch {}
  }, []);

  // ✅ Persist saved designs
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "decospace_saved_designs",
        JSON.stringify(savedDesigns)
      );
    } catch {}
  }, [savedDesigns]);

  // ✅ Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // ✅ Generate design
  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary("");
    setImages([]);

    if (!BACKEND_URL) {
      setError("Backend URL is missing.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_type: roomType,
          dimensions,
          style,
          budget,
          vibe
        })
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setSummary(typeof data.summary === "string" ? data.summary : "");
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch (err) {
      setError("Design generation failed.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Save full design with images
  function handleSaveDesign() {
    if (!summary) return;

    const newDesign = {
      id: Date.now(),
      roomType,
      dimensions,
      style,
      budget,
      vibe,
      summary,
      images: images.slice(0, 6),
      createdAt: new Date().toISOString()
    };

    setSavedDesigns((prev) => [newDesign, ...prev]);
    setActiveTab("saved");
  }

  if (loadingSession) {
    return <p className="p-6 text-sm text-slate-600">Loading dashboard...</p>;
  }

  return (
    <div className="min-h-screen pb-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">DecoSpace</h1>
          <p className="text-sm text-slate-600">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 border px-4 py-2 rounded text-sm"
        >
          Log out
        </button>
      </header>

      {/* Tabs */}
      <nav className="border-b flex gap-6">
        <button
          onClick={() => setActiveTab("generate")}
          className={`pb-2 border-b-2 ${
            activeTab === "generate"
              ? "border-black font-semibold"
              : "border-transparent text-slate-500"
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`pb-2 border-b-2 ${
            activeTab === "saved"
              ? "border-black font-semibold"
              : "border-transparent text-slate-500"
          }`}
        >
          Saved
        </button>
      </nav>

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleGenerate}
            className="bg-white border rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-xl font-semibold">Design Input</h2>

            <label className="block text-sm">
              Room Type
              <input
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="border w-full p-2 rounded mt-1"
              />
            </label>

            <label className="block text-sm">
              Dimensions
              <input
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="border w-full p-2 rounded mt-1"
              />
            </label>

            <label className="block text-sm">
              Style
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="border w-full p-2 rounded mt-1"
              >
                {[
                  "Modern cozy",
                  "Minimalist",
                  "Luxury glam",
                  "Boho",
                  "Industrial",
                  "Scandinavian",
                  "Japandi",
                  "Art Deco",
                  "Farmhouse",
                  "Mid-century modern",
                  "Urban chic",
                  "Vintage",
                  "Coastal",
                  "Dark academia"
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              Budget ($)
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="border w-40 p-2 rounded mt-1"
              />
            </label>

            <label className="block text-sm">
              Vibe & Priorities (optional)
              <textarea
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="border w-full p-2 rounded mt-1"
                placeholder="cozy, pink, plants, renter-friendly..."
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded"
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>

          <div className="space-y-4">
            {summary && (
              <div className="bg-white border rounded-2xl p-6 space-y-3">
                <p className="text-sm whitespace-pre-line">{summary}</p>

                <button
                  onClick={handleSaveDesign}
                  className="text-blue-600 text-sm underline"
                >
                  Save this design
                </button>
              </div>
            )}

            {images.length > 0 && (
              <div className="bg-white border rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="rounded h-32 w-full object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === "saved" && (
        <div className="grid md:grid-cols-2 gap-4">
          {savedDesigns.length === 0 && (
            <p className="text-sm text-slate-600">No saved designs yet.</p>
          )}

          {savedDesigns.map((d) => (
            <div
              key={d.id}
              className="bg-white border rounded-2xl p-5 space-y-2"
            >
              <h3 className="font-semibold text-sm">
                {d.roomType} — {d.style}
              </h3>

              <p className="text-xs text-slate-500">
                {d.dimensions} · ${d.budget}
              </p>

              {d.vibe && (
                <p className="text-xs italic text-slate-500">
                  Vibe: {d.vibe}
                </p>
              )}

              <p className="text-xs whitespace-pre-line">{d.summary}</p>

              {Array.isArray(d.images) && d.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {d.images.slice(0, 3).map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      className="rounded h-20 w-full object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
