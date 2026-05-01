import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import * as notesApi from "../api/notes";
import * as tagsApi from "../api/tags";
import type { ApiNote, ApiTag } from "../api/types";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

type OutletCtx = { notesKey: number };

export default function NotesPage() {
  const { notesKey } = useOutletContext<OutletCtx>();
  const [user, setUser] = useState<{ name: string; id: string; email: string } | null>(null);
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 300);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const loadTags = useCallback(async () => {
    if (!user) return;
    try {
      const t = await tagsApi.listTags();
      setTags(t);
    } catch {
      /* ignore */
    }
  }, [user]);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notesApi.listNotes({
        page,
        limit: 12,
        q: debouncedQ,
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
      });
      setNotes(res.items);
      setHasMore(res.hasMore);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [user, page, debouncedQ, selectedTagIds]);

  useEffect(() => {
    void loadTags();
  }, [loadTags, notesKey]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes, notesKey]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, selectedTagIds]);

  const toggleTagFilter = (id: string) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await notesApi.deleteNote(id);
      setNotes((n) => n.filter((x) => x.id !== id));
      toast.success("Note deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.name.localeCompare(b.name)), [tags]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <h2 className="text-3xl font-bold text-zinc-700">Log in to see your notes</h2>
      </div>
    );
  }

  return (
    <div className="container px-4 pb-16 pt-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label className="text-sm font-semibold text-zinc-600" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1 w-full max-w-xl rounded-xl border-2 px-4 py-2 focus:outline-purple-400"
            placeholder="Search title or content…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {sortedTags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTagFilter(t.id)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                selectedTagIds.includes(t.id) ? "bg-purple-600 text-white" : "bg-zinc-200 text-zinc-800"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-lg text-zinc-500">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="mt-10 text-center text-lg text-zinc-500">No notes yet. Create one with + Add note.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-zinc-900">{note.title}</h3>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="text-purple-600 hover:scale-110"
                    title="Edit"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("secondbrain:open-editor", { detail: { id: note.id } }));
                    }}
                  >
                    <MdEdit size={24} />
                  </button>
                  <button
                    type="button"
                    className="text-red-500 hover:scale-110"
                    title="Delete"
                    onClick={() => void onDelete(note.id)}
                  >
                    <MdDeleteOutline size={26} />
                  </button>
                </div>
              </div>
              <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm text-zinc-700">{note.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {note.tags.map((t) => (
                  <span key={t.id} className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800">
                    {t.name}
                  </span>
                ))}
              </div>
              <p className="mt-auto pt-4 text-xs text-zinc-400">
                Updated {new Date(note.updatedAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-xl bg-zinc-200 px-4 py-2 font-semibold disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl bg-zinc-200 px-4 py-2 font-semibold disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
