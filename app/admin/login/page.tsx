"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg("Signing in...");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        setMsg("Wrong password.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  }

  const FIELD =
    "w-full rounded-lg bg-white/5 border border-slate-400 px-3 py-2 " +
    "placeholder-slate-400 outline-none " +
    "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";

  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-semibold">Admin Login</h1>

        <form onSubmit={submit} className="grid gap-3">
          <label htmlFor="password" className="text-sm text-slate-500">
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Admin password"
              className={FIELD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-2 my-1 rounded px-2 text-xs text-slate-600 hover:bg-white/10"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 rounded-lg px-4 py-2 text-sm font-medium ${
              loading
                ? "cursor-not-allowed bg-cyan-500/40 text-slate-800"
                : "bg-cyan-500/90 text-slate-900 hover:bg-cyan-400"
            }`}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <div className="mt-3 text-sm text-slate-500">{msg}</div>
      </div>
    </main>
  );
}
