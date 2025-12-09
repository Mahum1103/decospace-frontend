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

  const [roomType, setRoomType] = useState("Living room");
  const [dimensions, setDimensions] = useState("12x15");
  const [style, setStyle] = useState("Modern cozy");
  const [budget, setBudget] = useState("500");
  const [vibe, setVibe] = useState("");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState([]);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState(null);

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
    setSaved((prev) => [...prev, { roomType, style, summary }]);
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
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">DecoSpace</h1>
          <p className="text-sm text-slate-600">{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="border px-4 py-2 rounded">
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button onClick={() => setActiveTab("generate")} className="underline">
          Generate
        </button>
        <button onClick={() => setActiveTab("saved")} className="underline">
          Saved Designs
        </button>
      </div>

      {/* GENERATE TAB */}
      {activeTab === "generate" && (
        <>
          <form onSubmit={handleGenerate} className="bg-white p-6 rounded space-y-4">
            <h2 className="font-semibold">Generate New Design</h2>

            <input value={roomType} onChange={(e) => setRoomType(e.target.value)} className="border p-2 w-full" />
            <input value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="border p-2 w-full" />

            <select value={style} onChange={(e) => setStyle(e.target.value)} className="border p-2 w-full">
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

            <input value={budget} onChange={(e) => setBudget(e.target.value)} className="border p-2 w-full" />

            <textarea
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="Optional vibe & priorities (e.g. cozy, plants, renter-friendly)"
              className="border p-2 w-full"
            />

            <button type="submit" className="bg-black text-white px-6 py-2">
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>

          {summary && (
            <div className="bg-white p-6 rounded space-y-4">
              <p>{summary}</p>
              <button onClick={saveDesign} className="underline">
                Save Design
              </button>
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((src, i) => (
                <img key={i} src={src} className="rounded h-40 object-cover" />
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
            <div key={i} className="border p-4 rounded">
              <p><b>{d.roomType}</b> — {d.style}</p>
              <p className="text-sm">{d.summary}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
