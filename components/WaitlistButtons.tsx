"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitlistButtons({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const isWaitlist = (status ?? "").toLowerCase() === "waitlist";
  const [loading, setLoading] =
    useState<null | "confirm" | "cancel">(null);

  if (!isWaitlist) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  async function update(next: "CONFIRMED" | "CANCELLED") {
    try {
      setLoading(next === "CONFIRMED" ? "confirm" : "cancel");
      const res = await fetch(`/api/admin/rsvp/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Update failed");
      }
      router.refresh(); // reload server data
    } catch (e: any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => update("CONFIRMED")}
        disabled={!!loading}
        className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-600 hover:bg-emerald-500/30 disabled:opacity-50"
      >
        {loading === "confirm" ? "Confirming…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => update("CANCELLED")}
        disabled={!!loading}
        className="rounded-md border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/30 disabled:opacity-50"
      >
        {loading === "cancel" ? "Cancelling…" : "Cancel"}
      </button>
    </div>
  );
}
