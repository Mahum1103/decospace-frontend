import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <h1 className="text-5xl font-bold">
        Design smarter with DecoSpace
      </h1>

      <p className="text-slate-600 text-lg">
        AI-powered room styling tailored to your space, budget, and vibe.
      </p>

      <div className="flex justify-center gap-4">
        <Link
          href="/login"
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Sign In
        </Link>

        <Link
          href="/signup"
          className="border px-6 py-3 rounded-lg"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
