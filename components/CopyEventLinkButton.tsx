"use client";
import { useState } from "react";

type Props = {
  slug?: string | null;
  id: string | number;
  serverUrl?: string; // optional override
};

export default function CopyEventLinkButton({ slug, id, serverUrl }: Props) {
  const base = serverUrl ?? process.env.SERVER_URL ?? "";
  const url = `${base}/events/${slug || id}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback (older browsers)
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-500/30"
      title={url}
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
