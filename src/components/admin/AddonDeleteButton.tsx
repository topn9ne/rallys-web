"use client";

import { useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { deleteAddon } from "@/server/actions/addons";

export function AddonDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteAddon(id);
    setLoading(false);
    if (res?.error) {
      setError(String(res.error));
      setOpen(false);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      <button
        title="Delete add-on"
        onClick={() => { setError(null); setOpen(true); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:border-red-500 hover:text-white"
      >
        <Trash size={15} weight="duotone" />
      </button>
      {open && (
        <ConfirmModal
          title="Delete Add-on"
          message={`Delete "${name}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmVariant="danger-ghost"
          confirmIcon="delete"
          cancelLabel="Back"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
