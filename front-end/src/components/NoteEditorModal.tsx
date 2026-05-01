import { useEffect, useMemo, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import * as notesApi from "../api/notes";
import * as tagsApi from "../api/tags";
import type { ApiTag } from "../api/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  noteId?: string | null;
  allTags: ApiTag[];
  onTagsChanged: () => void;
};

export default function NoteEditorModal({
  open,
  onClose,
  onSaved,
  noteId,
  allTags,
  onTagsChanged,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(noteId);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      if (!noteId) {
        setTitle("");
        setContent("");
        setSelected({});
        setNewTag("");
        return;
      }
      try {
        setLoading(true);
        const note = await notesApi.getNote(noteId);
        if (cancelled) return;
        setTitle(note.title);
        setContent(note.content);
        const sel: Record<string, boolean> = {};
        for (const t of note.tags) sel[t.id] = true;
        setSelected(sel);
      } catch {
        toast.error("Failed to load note");
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, noteId, onClose]);

  const selectedTagIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const toggleTag = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const handleCreateTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    try {
      const tag = await tagsApi.createTag(name);
      setNewTag("");
      onTagsChanged();
      setSelected((s) => ({ ...s, [tag.id]: true }));
      toast.success("Tag created");
    } catch {
      toast.error("Could not create tag");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      if (isEdit && noteId) {
        await notesApi.updateNote(noteId, { title: title.trim(), content, tagIds: selectedTagIds });
        toast.success("Note updated");
      } else {
        await notesApi.createNote({ title: title.trim(), content, tagIds: selectedTagIds });
        toast.success("Note created");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Save failed");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <IoCloseSharp
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-2xl text-zinc-600 hover:text-zinc-900"
          aria-label="Close"
        />
        <h2 className="text-center text-2xl font-bold uppercase tracking-tight text-purple-700">
          {isEdit ? "Edit note" : "New note"}
        </h2>
        {loading ? (
          <p className="mt-6 text-center text-lg text-zinc-600">Loading…</p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-zinc-700" htmlFor="note-title">
                Title
              </label>
              <input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border-2 px-3 py-2 focus:outline-purple-400"
                placeholder="Note title"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-700" htmlFor="note-body">
                Content
              </label>
              <textarea
                id="note-body"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="mt-1 w-full rounded-lg border-2 px-3 py-2 font-mono text-sm focus:outline-purple-400"
                placeholder="Write your note…"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      selected[t.id] ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 rounded-lg border-2 px-3 py-2 focus:outline-purple-400"
                  placeholder="New tag name"
                />
                <button
                  type="button"
                  onClick={() => void handleCreateTag()}
                  className="rounded-lg bg-purple-200 px-4 py-2 font-semibold text-purple-900"
                >
                  Add tag
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              className="mt-2 rounded-xl bg-purple-600 py-3 text-lg font-bold text-white hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
