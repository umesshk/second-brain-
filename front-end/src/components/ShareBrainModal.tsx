import { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import * as shareApi from "../api/share";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ShareBrainModal({ open, onClose }: Props) {
  const [links, setLinks] = useState<shareApi.ShareLink[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const l = await shareApi.listShareLinks();
      setLinks(l);
    } catch {
      toast.error("Could not load share links");
    }
  };

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open]);

  const copy = async (token: string) => {
    const path = `/share/${token}`;
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const create = async () => {
    try {
      setBusy(true);
      const link = await shareApi.createShareLink();
      await refresh();
      await copy(link.token);
    } catch {
      toast.error("Could not create share link");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (token: string) => {
    try {
      setBusy(true);
      await shareApi.revokeShareLink(token);
      await refresh();
      toast.success("Link revoked");
    } catch {
      toast.error("Revoke failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <IoCloseSharp
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-2xl text-zinc-600"
          aria-label="Close"
        />
        <h2 className="text-center text-2xl font-bold text-purple-700">Share brain</h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Anyone with the link can view your notes (read-only). Revoke anytime.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="mt-4 w-full rounded-xl bg-purple-600 py-3 font-bold text-white disabled:opacity-50"
        >
          Create new link & copy
        </button>
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold uppercase text-zinc-500">Active links</h3>
          {links.length === 0 ? (
            <p className="text-sm text-zinc-500">No active links.</p>
          ) : (
            links.map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <code className="truncate text-xs text-zinc-700">…/share/{l.token.slice(0, 8)}…</code>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-900"
                    onClick={() => void copy(l.token)}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-800"
                    onClick={() => void revoke(l.token)}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
