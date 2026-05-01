import { CiShare2 } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import { IoMdExit } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import * as tagsApi from "../api/tags";
import type { ApiTag } from "../api/types";
import NoteEditorModal from "./NoteEditorModal";
import ShareBrainModal from "./ShareBrainModal";

type StoredUser = { name: string; id: string; email: string };

type Props = {
  onNotesSaved: () => void;
};

export default function Navbar({ onNotesSaved }: Props) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [editorNoteId, setEditorNoteId] = useState<string | null>(null);
  const [tags, setTags] = useState<ApiTag[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<StoredUser | null>(null);

  const refreshUser = useCallback(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? (JSON.parse(raw) as StoredUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser, location.pathname]);

  const loadTags = useCallback(async () => {
    if (!user) {
      setTags([]);
      return;
    }
    try {
      const t = await tagsApi.listTags();
      setTags(t);
    } catch {
      setTags([]);
    }
  }, [user]);

  useEffect(() => {
    if (isEditorOpen) void loadTags();
  }, [isEditorOpen, loadTags]);

  useEffect(() => {
    const onOpenEditor = (e: Event) => {
      const ce = e as CustomEvent<{ id?: string }>;
      setEditorNoteId(ce.detail?.id ?? null);
      setIsEditorOpen(true);
    };
    window.addEventListener("secondbrain:open-editor", onOpenEditor as EventListener);
    return () => window.removeEventListener("secondbrain:open-editor", onOpenEditor as EventListener);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* still clear client */
    }
    localStorage.removeItem("user");
    refreshUser();
    navigate("/login");
  };

  const openNewNote = () => {
    setEditorNoteId(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="container">
      <div className="flex flex-col p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-center text-xl font-bold uppercase tracking-wide sm:text-left sm:text-3xl">
            Notes
          </h1>
        </div>
        {user ? (
          <div className="mt-3 flex flex-col items-center gap-4 sm:mt-0 sm:flex-row sm:gap-5">
            <button
              type="button"
              onClick={openNewNote}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-base font-semibold text-white sm:text-xl"
            >
              <FaPlus />
              Add note
            </button>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-300 px-4 py-2 text-base font-semibold text-purple-700 sm:text-xl"
            >
              <CiShare2 />
              Share brain
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-400 text-xl font-bold uppercase text-white">
                {user.name.charAt(0)}
              </span>
              <span className="text-xl font-bold capitalize tracking-tight">{user.name}</span>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-base font-semibold text-white sm:text-lg"
            >
              Log out
              <IoMdExit />
            </button>
          </div>
        ) : (
          <div className="mt-3 flex justify-center gap-4 sm:mt-0">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl bg-purple-400 px-4 py-2 text-xl font-semibold text-white"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-xl bg-purple-400 px-4 py-2 text-xl font-semibold text-white"
            >
              Register
            </button>
          </div>
        )}
      </div>

      <NoteEditorModal
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={onNotesSaved}
        noteId={editorNoteId}
        allTags={tags}
        onTagsChanged={() => void loadTags()}
      />
      <ShareBrainModal open={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
