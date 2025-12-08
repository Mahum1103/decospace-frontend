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
  const [style, setStyle] = useState("cozy, neutral, modern");
  const [budget, setBudget] = useState("500");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [posts, setPosts] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary("");
    setPosts([]);

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

      const data = await res.json();
      setSummary(data.summary);
      setPosts(data.posts || []);
    } catch (err) {
      setError("Something went wrong generating your design.");
    } finally {
      setLoading(false);
    }
  }

  function saveDesign() {
    const newDesign = {
      roomType,
      dimensions,
      style,
      budget,
      summary
    };
    setSavedDesigns((prev) => [...prev, newDesign]);
  }

  if (loadingSession) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
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

        <textarea
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Style Preferences"
          className="border p-2 rounded-lg w-full"
        />

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
          <p className="text-sm text-slate-700">{summary}</p>

          <button
            onClick={saveDesign}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
          >
            Save This Design
          </button>
        </div>
      )}

      {/* Community Inspiration */}
      {posts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Community Inspiration</h2>
          <ul className="grid gap-3">
            {posts.map((title, i) => (
              <li key={i} className="border p-3 rounded-lg text-sm bg-slate-50">
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Saved Designs */}
      {savedDesigns.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Saved Designs</h2>

          {savedDesigns.map((d, i) => (
            <div key={i} className="border rounded-lg p-3 text-sm">
              <p><b>Room:</b> {d.roomType}</p>
              <p><b>Style:</b> {d.style}</p>
              <p><b>Budget:</b> ${d.budget}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
