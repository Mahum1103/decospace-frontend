"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DashboardPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");

  // Form State
  const [roomType, setRoomType] = useState("Living room");
  const [dimensions, setDimensions] = useState("12x15");
  const [style, setStyle] = useState("Modern cozy");
  const [budget, setBudget] = useState("500");
  const [vibe, setVibe] = useState("");

  // Response State
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState([]);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState(null);

  // Protect Dashboard
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
          budget,
          vibe
        })
      });

      const data = await res.json();
      setSummary(data.summary || "");
      setImages(data.images || []);
    } catch {
      setError("Design generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function saveDesign() {
    const design = {
      roomType,
      style,
      dimensions,
      budget,
      vibe,
      summary,
      images
    };
    setSaved((prev) => [...prev, design]);
    setActiveTab("saved");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loadingSession) return <p className="p-6">Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DecoSpace</h1>
          <p className="text-sm text-slate-600">{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="border px-4 py-2 rounded">
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {["generate", "saved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px border-b-2 transition ${
              activeTab === tab
                ? "border-black font-semibold"
                : "border-transparent text-slate-500"
            }`}
          >
            {tab === "generate" ? "Generate Design" : "Saved Designs"}
          </button>
        ))}
      </div>

      {/* GENERATE TAB */}
      {activeTab === "generate" && (
        <>
          <form
            onSubmit={handleGenerate}
            className="bg-white p-6 rounded-2xl border space-y-4"
          >
            <h2 className="font-semibold text-xl">Design Input</h2>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Room Type</label>
              <input
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Room Dimensions</label>
              <input
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Design Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="border p-2 rounded"
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
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Budget</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="border p-2 rounded w-40"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Vibe / Priorities</label>
              <textarea
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="border p-2 rounded"
                placeholder="Optional: cozy, plants, neutral palette, clean aesthetic..."
              />
            </div>

            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Design"}
            </button>
          </form>

          {summary && (
            <div className="bg-white p-6 rounded-2xl border space-y-4">
              <p>{summary}</p>

              <button
                onClick={saveDesign}
                className="underline text-sm text-blue-600"
              >
                Save This Design
              </button>
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="rounded-lg h-40 object-cover"
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* SAVED TAB */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          {saved.length === 0 && <p>No saved designs yet.</p>}

          {saved.map((d, i) => (
            <div key={i} className="border p-4 rounded-2xl bg-white space-y-3">
              <p className="font-semibold">
                {d.roomType} — {d.style}
              </p>
              <p className="text-sm">{d.summary}</p>

              {/* Show first 3 images */}
              <div className="grid grid-cols-3 gap-2">
                {d.images.slice(0, 3).map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    className="rounded h-24 object-cover"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
