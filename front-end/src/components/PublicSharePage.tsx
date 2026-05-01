import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as shareApi from "../api/share";
import type { ApiNote } from "../api/types";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export default function PublicSharePage() {
  const { token } = useParams<{ token: string }>();
  const [owner, setOwner] = useState<string>("");
  const [items, setItems] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await shareApi.getPublicSharedNotes(token, { q: debouncedQ });
        if (cancelled) return;
        setOwner(data.owner.name);
        setItems(data.items);
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 410) toast.error("This share link was revoked.");
        else if (status === 404) toast.error("Share link not found.");
        else toast.error("Could not load shared notes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, debouncedQ]);

  if (!token) {
    return <p className="p-8 text-center">Invalid link.</p>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-purple-800">Shared brain</h1>
        <p className="mt-2 text-zinc-600">
          Notes from <span className="font-semibold">{owner || "…"}</span>
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-6 w-full rounded-xl border-2 px-4 py-2"
          placeholder="Filter shared notes…"
        />
        {loading ? (
          <p className="mt-10 text-center">Loading…</p>
        ) : (
          <div className="mt-8 space-y-6">
            {items.map((note) => (
              <article key={note.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">{note.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-zinc-700">{note.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((t) => (
                    <span key={t.id} className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-800">
                      {t.name}
                    </span>
                  ))}
                </div>
              </article>
            ))}
            {items.length === 0 && !loading && <p className="text-zinc-500">No notes match.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
