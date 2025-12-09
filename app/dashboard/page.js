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

  // ✅ Auth protection
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) router.push("/");
      else {
        setUserEmail(data.session.user.email);
        setLoadingSession(false);
      }
    });
  }, [router]);

  // ✅ Load saved designs
  useEffect(() => {
    const raw = localStorage.getItem("decospace_saved_designs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedDesigns(parsed);
    }
  }, []);

  // ✅ Persist saved
  useEffect(() => {
    localStorage.setItem("decospace_saved_designs", JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary("");
    setImages([]);

    if (!BACKEND_URL) {
      setError("Backend URL missing.");
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
      setSummary(data.summary || "");
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch {
      setError("Design generation failed.");
    } finally {
      setLoading(false);
    }
  }

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
    return <div className="p-10 text-[#6b6259]">Loading your workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-[#d6ccc2] px-6 py-10">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a]">DecoSpace</h1>
          <p className="text-sm text-[#6b6259] mt-1">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 rounded-xl border border-[#d5bdaf] px-5 py-2 text-sm bg-[#f5ebe0] hover:bg-[#e3d5ca] shadow-sm"
        >
          Log out
        </button>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto flex gap-8 border-b border-[#d5bdaf] mb-10">
        {["generate", "saved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-[#1a1a1a] text-[#1a1a1a]"
                : "text-[#6b6259] hover:text-[#1a1a1a]"
            }`}
          >
            {tab === "generate" ? "Generate Design" : "Saved Designs"}
          </button>
        ))}
      </div>

      {/* GENERATE TAB */}
      {activeTab === "generate" && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* LEFT FORM */}
          <div className="bg-[#f5ebe0] rounded-3xl p-8 shadow-xl space-y-6 border border-[#d5bdaf]">
            <h2 className="text-2xl font-semibold">Design Your Space</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold">Room Type</label>
                <input
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d5bdaf] px-4 py-2 text-sm bg-[#edede9]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Dimensions</label>
                <input
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d5bdaf] px-4 py-2 text-sm bg-[#edede9]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold">Design Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d5bdaf] px-4 py-2 text-sm bg-[#edede9]"
              >
                {[
                  "Modern cozy","Minimalist","Luxury glam","Boho","Industrial",
                  "Scandinavian","Japandi","Art Deco","Farmhouse",
                  "Mid-century modern","Urban chic","Vintage","Coastal","Dark academia"
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold">Budget ($)</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-40 rounded-xl border border-[#d5bdaf] px-4 py-2 text-sm bg-[#edede9]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Vibe & Priorities</label>
              <textarea
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d5bdaf] px-4 py-2 text-sm bg-[#edede9]"
                placeholder="cozy, pink, plants, renter-friendly..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-[#edede9] rounded-xl py-3 font-medium hover:opacity-90 transition"
            >
              {loading ? "Generating..." : "Generate Design"}
            </button>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* RIGHT RESULTS */}
          <div className="space-y-6">
            {summary && (
              <div className="bg-[#f5ebe0] rounded-3xl p-8 shadow-xl border border-[#d5bdaf]">
                <p className="whitespace-pre-line text-sm text-[#1a1a1a]">
                  {summary}
                </p>
                <button
                  onClick={handleSaveDesign}
                  className="mt-4 text-sm underline"
                >
                  Save this design
                </button>
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="rounded-2xl h-44 w-full object-cover shadow-md hover:scale-[1.03] transition"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAVED TAB */}
      {activeTab === "saved" && (
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {savedDesigns.length === 0 && (
            <p className="text-[#6b6259]">No saved designs yet.</p>
          )}

          {savedDesigns.map((d) => (
            <div
              key={d.id}
              className="bg-[#f5ebe0] rounded-3xl p-6 shadow-xl space-y-3 border border-[#d5bdaf]"
            >
              <div>
                <h3 className="font-semibold">{d.roomType} — {d.style}</h3>
                <p className="text-xs text-[#6b6259]">
                  {d.dimensions} · ${d.budget}
                </p>
              </div>

              <p className="text-xs whitespace-pre-line text-[#1a1a1a]">
                {d.summary}
              </p>

              {d.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {d.images.slice(0, 3).map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      className="rounded-xl h-20 w-full object-cover"
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
