"use client";

import { useState, useActionState } from "react";
import { PencilSimple, Trash, Eye, EyeSlash, PlusCircle } from "@phosphor-icons/react";
import {
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  toggleFaqItem,
} from "@/server/actions/faq";
import type { FaqItem } from "@prisma/client";

const initialState = { error: undefined as string | undefined, success: false };

function FaqForm({
  item,
  onSuccess,
}: {
  item?: FaqItem;
  onSuccess?: () => void;
}) {
  const action = item
    ? async (_prev: typeof initialState, formData: FormData) => {
        const res = (await updateFaqItem(item.id, formData)) as typeof initialState;
        if (res.success && onSuccess) onSuccess();
        return res;
      }
    : async (_prev: typeof initialState, formData: FormData) => {
        const res = (await createFaqItem(formData)) as typeof initialState;
        if (res.success && onSuccess) onSuccess();
        return res;
      };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-white/80">Question</label>
        <input
          name="question"
          required
          defaultValue={item?.question}
          placeholder="What should guests know?"
          className="w-full rounded-[10px] border border-white/15 bg-white/[0.07] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-admin-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-white/80">Answer</label>
        <textarea
          name="answer"
          required
          rows={3}
          defaultValue={item?.answer}
          placeholder="Provide a clear, helpful answer..."
          className="w-full resize-none rounded-[10px] border border-white/15 bg-white/[0.07] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-admin-accent focus:outline-none"
        />
      </div>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.success && !item && <p className="text-xs text-green-400">FAQ item added.</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-[10px] bg-admin-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(255,46,136,0.3)] transition-[filter] hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "Saving…" : item ? "Save Changes" : "Add FAQ Item"}
      </button>
    </form>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(item.active);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    const next = !active;
    setActive(next);
    await toggleFaqItem(item.id, next);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.question}"?`)) return;
    setDeleting(true);
    await deleteFaqItem(item.id);
  }

  return (
    <li className={`border-b border-white/10 px-5 py-4 last:border-0 ${!active ? "opacity-50" : ""}`}>
      {editing ? (
        <div className="space-y-3">
          <FaqForm item={item} onSuccess={() => setEditing(false)} />
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{item.question}</p>
            <p className="mt-1 text-sm text-white/55 line-clamp-2">{item.answer}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={handleToggle}
              title={active ? "Hide from site" : "Show on site"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/50 hover:text-white transition-colors"
            >
              {active ? <Eye size={15} /> : <EyeSlash size={15} />}
            </button>
            <button
              onClick={() => setEditing(true)}
              title="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/50 hover:text-white transition-colors"
            >
              <PencilSimple size={15} weight="duotone" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash size={15} weight="regular" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function FaqManager({ items }: { items: FaqItem[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      {/* Existing items */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-[13px] font-bold uppercase tracking-[1px] text-white/70">
            FAQ Items ({items.length})
          </h2>
          <p className="text-xs text-white/35">Eye icon toggles visibility on site</p>
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-white/35">
            No FAQ items yet. Add your first one →
          </p>
        ) : (
          <ul>
            {items.map((item) => (
              <FaqRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>

      {/* Add new */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[1px] text-white/70">
          <PlusCircle size={15} weight="duotone" />
          Add FAQ Item
        </h2>
        <FaqForm onSuccess={() => setShowForm(false)} />
      </div>
    </div>
  );
}
